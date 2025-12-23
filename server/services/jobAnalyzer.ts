import { invokeLLM } from '../_core/llm';
import { JobAnalysis } from '../../drizzle/schema';

/**
 * Analyze job description and extract requirements using AI
 */
export async function analyzeJobDescription(jobDescription: string): Promise<JobAnalysis> {
  const systemPrompt = `You are an expert job description analyzer. Extract key requirements from job postings.

Extract ONLY information explicitly stated in the job description.
Categorize skills accurately into required vs nice-to-have.
Identify both technical and soft skills.

Return a JSON object with this structure:
{
  "requiredSkills": ["skill1", "skill2", ...],
  "niceToHaveSkills": ["skill3", "skill4", ...],
  "responsibilities": ["responsibility1", "responsibility2", ...],
  "keywords": ["keyword1", "keyword2", ...],
  "softSkills": ["communication", "leadership", ...]
}`;

  const userPrompt = `Analyze this job description:\n\n${jobDescription}`;

  const response = await invokeLLM({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'job_analyzer',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            requiredSkills: {
              type: 'array',
              items: { type: 'string' },
              description: 'Must-have technical skills',
            },
            niceToHaveSkills: {
              type: 'array',
              items: { type: 'string' },
              description: 'Preferred or nice-to-have skills',
            },
            responsibilities: {
              type: 'array',
              items: { type: 'string' },
              description: 'Key job responsibilities',
            },
            keywords: {
              type: 'array',
              items: { type: 'string' },
              description: 'Important keywords for ATS',
            },
            softSkills: {
              type: 'array',
              items: { type: 'string' },
              description: 'Soft skills and personal qualities',
            },
          },
          required: ['requiredSkills', 'niceToHaveSkills', 'responsibilities', 'keywords', 'softSkills'],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Failed to analyze job description: No response from AI');
  }

  const contentText = typeof content === 'string' ? content : JSON.stringify(content);
  const analysis = JSON.parse(contentText) as JobAnalysis;
  return analysis;
}
