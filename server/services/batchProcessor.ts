import { customizeResume, generateCoverLetter } from './customizer';
import { analyzeJobDescription } from './jobAnalyzer';
import { calculateMatchScore } from './matcher';
import { analyzeATSCompatibility } from './atsScanner';

export interface BatchJobDescription {
  id: string;
  companyName: string;
  roleName: string;
  description: string;
}

export interface BatchCustomizationResult {
  jobId: string;
  companyName: string;
  roleName: string;
  matchScore: number;
  atsScore: number;
  customizedResume: any;
  coverLetter: string;
  explanation: string;
  keywords: {
    matched: string[];
    missing: string[];
    weak: string[];
  };
}

/**
 * Process multiple job descriptions and generate customized resumes for each
 * Returns results with comparison metrics for side-by-side view
 */
export async function processBatchOptimization(
  originalResume: {
    summary?: string;
    skills: string[];
    experience: Array<{
      title: string;
      company: string;
      description: string;
      bullets: string[];
    }>;
    education: Array<{
      school: string;
      degree: string;
      field: string;
    }>;
  },
  jobDescriptions: BatchJobDescription[],
  templateId: string = 'classic'
): Promise<BatchCustomizationResult[]> {
  const results: BatchCustomizationResult[] = [];

  // Process each job description in parallel for efficiency
  const promises = jobDescriptions.map(async (job) => {
    try {
      // Analyze job description
      const jobAnalysis = await analyzeJobDescription(job.description);

      // Calculate match score
      const matchScore = await calculateMatchScore({ ...originalResume, projects: [] } as any, jobAnalysis);

      // Customize resume for this job
      const customized = await customizeResume(
        { ...originalResume, projects: [] } as any,
        jobAnalysis,
        matchScore as any
      );

      // Generate cover letter
      const coverLetter = await generateCoverLetter(
        originalResume as any,
        (customized as any).customized,
        job.companyName,
        job.roleName
      );

      // Generate explanation
      const matchScoreNum = typeof matchScore === 'number' ? matchScore : (matchScore as any).score || 0;
      const explanation = `Customized for ${job.companyName} - ${job.roleName} position with ${matchScoreNum.toFixed(0)}% match score`;

      // Analyze ATS compatibility
      const resumeData = {
        summary: (customized as any).customized?.summary?.revised || (customized as any).customized?.summary?.original,
        skills: (customized as any).customized?.skills || [],
        experience: ((customized as any).customized?.experience || []).map((exp: any) => ({
          title: exp.role,
          company: exp.company,
          description: exp.duration || '',
          bullets: exp.bullets.map((b: any) => typeof b === 'string' ? b : (b.revised || b.original)),
        })),
        education: (customized as any).customized?.education || [],
      };

      const atsAnalysis = await analyzeATSCompatibility(
        resumeData,
        job.description
      );

      return {
        jobId: job.id,
        companyName: job.companyName,
        roleName: job.roleName,
        matchScore: matchScoreNum,
        atsScore: atsAnalysis.atsScore,
        customizedResume: customized,
        coverLetter,
        explanation,
        keywords: atsAnalysis.keywordAnalysis,
      };
    } catch (error) {
      console.error(`Error processing job ${job.id}:`, error);
      throw error;
    }
  });

  // Wait for all jobs to complete
  const processedResults = await Promise.all(promises);
  results.push(...processedResults);

  // Sort by match score (highest first)
  results.sort((a, b) => b.matchScore - a.matchScore);

  return results;
}

/**
 * Generate comparison summary for batch results
 */
export function generateBatchComparison(results: BatchCustomizationResult[]) {
  if (results.length === 0) {
    return null;
  }

  const avgMatchScore =
    results.reduce((sum, r) => sum + r.matchScore, 0) / results.length;
  const avgAtsScore =
    results.reduce((sum, r) => sum + r.atsScore, 0) / results.length;

  const bestMatch = results[0];
  const worstMatch = results[results.length - 1];

  return {
    totalJobs: results.length,
    averageMatchScore: avgMatchScore,
    averageAtsScore: avgAtsScore,
    bestMatch: {
      company: bestMatch.companyName,
      role: bestMatch.roleName,
      score: bestMatch.matchScore,
    },
    worstMatch: {
      company: worstMatch.companyName,
      role: worstMatch.roleName,
      score: worstMatch.matchScore,
    },
    scoreRange: {
      min: worstMatch.matchScore,
      max: bestMatch.matchScore,
    },
  };
}

/**
 * Extract common keywords across all job descriptions
 */
export function extractCommonKeywords(results: BatchCustomizationResult[]) {
  if (results.length === 0) {
    return {
      universal: [],
      frequent: [],
      rare: [],
    };
  }

  // Count keyword occurrences
  const keywordCounts: Record<string, number> = {};

  results.forEach((result) => {
    result.keywords.matched.forEach((keyword) => {
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
    });
  });

  const totalJobs = results.length;
  const universal = Object.entries(keywordCounts)
    .filter(([_, count]) => count === totalJobs)
    .map(([keyword]) => keyword);

  const frequent = Object.entries(keywordCounts)
    .filter(([_, count]) => count >= Math.ceil(totalJobs * 0.5) && count < totalJobs)
    .map(([keyword]) => keyword)
    .sort((a, b) => keywordCounts[b] - keywordCounts[a]);

  const rare = Object.entries(keywordCounts)
    .filter(([_, count]) => count < Math.ceil(totalJobs * 0.5))
    .map(([keyword]) => keyword)
    .sort((a, b) => keywordCounts[b] - keywordCounts[a])
    .slice(0, 10);

  return {
    universal,
    frequent,
    rare,
  };
}
