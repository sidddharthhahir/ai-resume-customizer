import { invokeLLM } from '../_core/llm';
import { ParsedResume, JobAnalysis, CustomizedResume, Explanation } from '../../drizzle/schema';

/**
 * Customize resume for specific job with strict truthfulness enforcement
 */
export async function customizeResume(
  resume: ParsedResume,
  jobAnalysis: JobAnalysis,
  jobDescription: string
): Promise<{ customized: CustomizedResume; explanation: Explanation }> {
  const systemPrompt = `You are a professional resume editor with STRICT ethical guidelines.

ABSOLUTE RULES (NEVER VIOLATE):
❌ Do NOT invent skills, tools, metrics, companies, or job titles
❌ Do NOT exaggerate experience or add fake achievements
❌ Do NOT add technologies or skills not mentioned in the original resume
✅ ONLY rewrite existing content to better match job description language
✅ Preserve all company names, role titles, and project scope exactly
✅ Optimize wording for ATS and recruiter readability
✅ Keep output ATS-friendly with plain text layout

WHAT YOU CAN DO:
- Rewrite professional summary to emphasize relevant experience
- Rephrase bullet points to use job description keywords (without changing facts)
- Reorganize bullet points to highlight most relevant achievements first
- Improve clarity and impact of existing statements

WHAT YOU CANNOT DO:
- Add skills that don't exist in the original resume
- Inflate numbers or metrics
- Claim experience with tools/technologies not mentioned
- Create new projects or roles

For each change, provide a clear reason explaining the optimization.`;

  const resumeText = JSON.stringify(resume, null, 2);
  const jobText = JSON.stringify(jobAnalysis, null, 2);

  const userPrompt = `Customize this resume for the job, following all safety rules:\n\nORIGINAL RESUME:\n${resumeText}\n\nJOB REQUIREMENTS:\n${jobText}\n\nJOB DESCRIPTION:\n${jobDescription}`;

  const response = await invokeLLM({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'resume_customizer',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            summary: {
              type: 'object',
              properties: {
                original: { type: 'string' },
                revised: { type: 'string' },
                reason: { type: 'string' },
              },
              required: ['original', 'revised', 'reason'],
              additionalProperties: false,
            },
            experience: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  company: { type: 'string' },
                  role: { type: 'string' },
                  duration: { type: 'string' },
                  bullets: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        original: { type: 'string' },
                        revised: { type: 'string' },
                        reason: { type: 'string' },
                      },
                      required: ['original', 'revised', 'reason'],
                      additionalProperties: false,
                    },
                  },
                },
                required: ['company', 'role', 'bullets'],
                additionalProperties: false,
              },
            },
            explanation: {
              type: 'object',
              properties: {
                skillEmphasis: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Which skills were emphasized and why',
                },
                wordingChanges: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Key wording improvements made',
                },
                atsImprovements: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'How changes improve ATS compatibility',
                },
              },
              required: ['skillEmphasis', 'wordingChanges', 'atsImprovements'],
              additionalProperties: false,
            },
          },
          required: ['summary', 'experience', 'explanation'],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Failed to customize resume: No response from AI');
  }

  const contentText = typeof content === 'string' ? content : JSON.stringify(content);
  const result = JSON.parse(contentText);

  // Construct customized resume with preserved fields
  const customized: CustomizedResume = {
    summary: result.summary,
    experience: result.experience,
    skills: resume.skills, // Preserved unchanged
    projects: resume.projects, // Preserved unchanged
    education: resume.education, // Preserved unchanged
  };

  const explanation: Explanation = result.explanation;

  return { customized, explanation };
}

/**
 * Generate job-specific cover letter using only resume content
 */
export async function generateCoverLetter(
  resume: ParsedResume,
  jobDescription: string,
  companyName: string,
  roleName: string
): Promise<string> {
  const systemPrompt = `You are a professional cover letter writer with STRICT ethical guidelines.

ABSOLUTE RULES:
❌ Do NOT exaggerate experience or skills
❌ Do NOT claim expertise in areas not shown in resume
❌ Use ONLY information present in the resume
✅ Write in professional, confident, human tone
✅ Reference company name and role specifically
✅ Keep to 3-4 short paragraphs
✅ Make it ready to send

STRUCTURE:
1. Opening: Express interest in role at company
2. Body: Connect 2-3 relevant experiences/skills from resume to job requirements
3. Closing: Express enthusiasm and call to action

Keep it concise, authentic, and compelling.`;

  const resumeText = JSON.stringify(resume, null, 2);

  const userPrompt = `Write a cover letter for:\n\nCOMPANY: ${companyName}\nROLE: ${roleName}\n\nJOB DESCRIPTION:\n${jobDescription}\n\nRESUME:\n${resumeText}`;

  const response = await invokeLLM({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Failed to generate cover letter: No response from AI');
  }

  const contentText = typeof content === 'string' ? content : JSON.stringify(content);
  return contentText;
}
