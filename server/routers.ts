import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { customizations } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { 
  createResume, 
  getResumeById, 
  getUserResumes,
  createJobDescription,
  getJobDescriptionById,
  getUserJobDescriptions,
  createCustomization,
  getCustomizationById,
  getUserCustomizations,
  getCustomizationByResumeAndJob,
  updateCustomizationFiles
} from "./db";
import { extractResumeText, parseResumeWithAI } from "./services/resumeParser";
import { analyzeJobDescription } from "./services/jobAnalyzer";
import { calculateMatchScore } from "./services/matcher";
import { customizeResume, generateCoverLetter } from "./services/customizer";
import { 
  generateResumePDF, 
  generateResumeDOCX, 
  generateCoverLetterPDF, 
  generateCoverLetterDOCX 
} from "./services/fileGenerator";
import { analyzeATSCompatibility } from "./services/atsScanner";
import { storagePut } from "./storage";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  resume: router({
    // Upload and parse resume
    upload: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileData: z.string(), // base64 encoded
        mimeType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Decode base64 file data
        const buffer = Buffer.from(input.fileData, 'base64');
        
        // Upload to S3
        const fileKey = `resumes/${ctx.user.id}/${Date.now()}_${input.fileName}`;
        const { url: fileUrl, key } = await storagePut(fileKey, buffer, input.mimeType);
        
        // Extract text from file
        const resumeText = await extractResumeText(buffer, input.mimeType);
        
        // Parse with AI
        const parsedContent = await parseResumeWithAI(resumeText);
        
        // Save to database
        const resume = await createResume({
          userId: ctx.user.id,
          originalFileName: input.fileName,
          fileUrl,
          fileKey: key,
          parsedContent,
        });
        
        return resume;
      }),

    // Get user's resumes
    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserResumes(ctx.user.id);
    }),

    // Get specific resume
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getResumeById(input.id);
      }),
  }),

  job: router({
    // Create and analyze job description
    create: protectedProcedure
      .input(z.object({
        description: z.string(),
        companyName: z.string().optional(),
        roleName: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Analyze job description with AI
        const analysis = await analyzeJobDescription(input.description);
        
        // Save to database
        const job = await createJobDescription({
          userId: ctx.user.id,
          description: input.description,
          companyName: input.companyName || null,
          roleName: input.roleName || null,
          analysis,
        });
        
        return job;
      }),

    // Get user's job descriptions
    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserJobDescriptions(ctx.user.id);
    }),

    // Get specific job description
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getJobDescriptionById(input.id);
      }),
  }),

  customization: router({
    // Upload profile photo
    uploadPhoto: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileData: z.string(), // base64 encoded
        mimeType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Validate mime type
        if (!['image/jpeg', 'image/jpg', 'image/png'].includes(input.mimeType)) {
          throw new Error('Only JPG and PNG images are supported');
        }

        // Decode base64 file data
        const buffer = Buffer.from(input.fileData, 'base64');
        
        // Validate file size (max 5MB)
        if (buffer.length > 5 * 1024 * 1024) {
          throw new Error('Photo size must be less than 5MB');
        }
        
        // Upload to S3
        const fileKey = `photos/${ctx.user.id}/${Date.now()}_${input.fileName}`;
        const { url: photoUrl, key: photoKey } = await storagePut(fileKey, buffer, input.mimeType);
        
        return { photoUrl, photoKey };
      }),

    // Create full customization (match + customize + cover letter)
    create: protectedProcedure
      .input(z.object({
        resumeId: z.number(),
        jobId: z.number(),
        templateId: z.string().optional(),
        includePhoto: z.boolean().optional(),
        photoUrl: z.string().optional(),
        photoKey: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get resume and job
        const resume = await getResumeById(input.resumeId);
        const job = await getJobDescriptionById(input.jobId);
        
        if (!resume || !job) {
          throw new Error('Resume or job not found');
        }
        
        if (!job.analysis) {
          throw new Error('Job analysis not available');
        }
        
        // Calculate match score
        const matchScore = await calculateMatchScore(resume.parsedContent, job.analysis);
        
        // Customize resume
        const { customized, explanation } = await customizeResume(
          resume.parsedContent,
          job.analysis,
          job.description
        );
        
        // Generate cover letter
        const coverLetter = await generateCoverLetter(
          resume.parsedContent,
          job.description,
          job.companyName || 'the company',
          job.roleName || 'this position'
        );
        
        // Save customization
        const customization = await createCustomization({
          userId: ctx.user.id,
          resumeId: input.resumeId,
          jobId: input.jobId,
          templateId: input.templateId || 'classic',
          matchScore,
          customizedResume: customized,
          coverLetter,
          explanation,
          includePhoto: input.includePhoto ? 1 : 0,
          photoUrl: input.photoUrl || null,
          photoKey: input.photoKey || null,
          resumePdfUrl: null,
          resumeDocxUrl: null,
          coverLetterPdfUrl: null,
          coverLetterDocxUrl: null,
        });
        
        return customization;
      }),

    // Generate downloadable files
    generateFiles: protectedProcedure
      .input(z.object({
        customizationId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const customization = await getCustomizationById(input.customizationId);
        
        if (!customization) {
          throw new Error('Customization not found');
        }
        
        const job = await getJobDescriptionById(customization.jobId);
        if (!job) {
          throw new Error('Job not found');
        }
        
        const companyName = job.companyName || 'Company';
        const roleName = job.roleName || 'Role';
        
        // Generate all files
        const photoUrl = customization.includePhoto ? customization.photoUrl || undefined : undefined;
        const [resumePdf, resumeDocx, coverLetterPdf, coverLetterDocx] = await Promise.all([
          generateResumePDF(customization.customizedResume, companyName, roleName, photoUrl),
          generateResumeDOCX(customization.customizedResume, companyName, roleName, photoUrl),
          generateCoverLetterPDF(customization.coverLetter, companyName, roleName),
          generateCoverLetterDOCX(customization.coverLetter, companyName, roleName),
        ]);
        
        // Update customization with file URLs
        await updateCustomizationFiles(customization.id, {
          resumePdfUrl: resumePdf.url,
          resumeDocxUrl: resumeDocx.url,
          coverLetterPdfUrl: coverLetterPdf.url,
          coverLetterDocxUrl: coverLetterDocx.url,
        });
        
        return {
          resumePdfUrl: resumePdf.url,
          resumeDocxUrl: resumeDocx.url,
          coverLetterPdfUrl: coverLetterPdf.url,
          coverLetterDocxUrl: coverLetterDocx.url,
        };
      }),

    // Get user's customizations
    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserCustomizations(ctx.user.id);
    }),

    // Get specific customization
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getCustomizationById(input.id);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const customization = await getCustomizationById(input.id);
        if (!customization || customization.userId !== ctx.user.id) {
          throw new Error('Customization not found or unauthorized');
        }
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        await db.delete(customizations).where(eq(customizations.id, input.id as any));
        return { success: true };
      }),

    // Get customization by resume and job
    getByResumeAndJob: protectedProcedure
      .input(z.object({
        resumeId: z.number(),
        jobId: z.number(),
      }))
      .query(async ({ input }) => {
        return getCustomizationByResumeAndJob(input.resumeId, input.jobId);
      }),

    // Analyze ATS compatibility
    analyzeATS: protectedProcedure
      .input(z.object({
        customizationId: z.number(),
      }))
      .query(async ({ input }) => {
        const customization = await getCustomizationById(input.customizationId);
        if (!customization) {
          throw new Error('Customization not found');
        }

        const job = await getJobDescriptionById(customization.jobId);
        if (!job) {
          throw new Error('Job description not found');
        }

        // Analyze ATS compatibility
        const resumeData = {
          summary: customization.customizedResume.summary?.revised || customization.customizedResume.summary?.original,
          skills: customization.customizedResume.skills,
          experience: customization.customizedResume.experience.map((exp: any) => ({
            title: exp.role,
            company: exp.company,
            description: exp.duration || '',
            bullets: exp.bullets.map((b: any) => typeof b === 'string' ? b : (b.revised || b.original)),
          })),
          education: customization.customizedResume.education.map((edu: any) => ({ school: edu.institution || '', degree: edu.degree || '', field: edu.field || '' })),
        };
        const atsAnalysis = await analyzeATSCompatibility(
          resumeData,
          job.description
        );

        return atsAnalysis;
      }),
  }),
});

export type AppRouter = typeof appRouter;
