import { invokeLLM } from '../_core/llm';
import { ParsedResume, JobAnalysis, MatchScore } from '../../drizzle/schema';

/**
 * Calculate semantic similarity and matching score between resume and job
 */
export async function calculateMatchScore(
  resume: ParsedResume,
  jobAnalysis: JobAnalysis
): Promise<MatchScore> {
  const systemPrompt = `You are an expert resume-job matching analyst. Evaluate how well a resume matches a job description.

ANALYSIS CRITERIA:
1. Skill Overlap: Compare resume skills with required and nice-to-have skills
2. Experience Relevance: Assess if work experience aligns with job responsibilities
3. Keyword Alignment: Check presence of important keywords in resume

SCORING RULES:
- Overall match: 0-100 (weighted average of all factors)
- Skill overlap: 0-100 (percentage of required skills present)
- Experience relevance: 0-100 (how well experience matches responsibilities)
- Keyword alignment: 0-100 (percentage of key terms present)

OUTPUT FORMAT:
{
  "overallMatch": 75,
  "strengths": ["Strong Python experience", "Relevant project work"],
  "gaps": ["Missing AWS certification", "Limited leadership experience"],
  "skillOverlap": 80,
  "experienceRelevance": 70,
  "keywordAlignment": 75
}`;

  const resumeText = JSON.stringify(resume, null, 2);
  const jobText = JSON.stringify(jobAnalysis, null, 2);

  const userPrompt = `Evaluate this match:\n\nRESUME:\n${resumeText}\n\nJOB REQUIREMENTS:\n${jobText}`;

  const response = await invokeLLM({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'match_scorer',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            overallMatch: {
              type: 'number',
              description: 'Overall match score 0-100',
            },
            strengths: {
              type: 'array',
              items: { type: 'string' },
              description: 'Areas where resume is strong',
            },
            gaps: {
              type: 'array',
              items: { type: 'string' },
              description: 'Skills or experience missing from resume',
            },
            skillOverlap: {
              type: 'number',
              description: 'Skill overlap score 0-100',
            },
            experienceRelevance: {
              type: 'number',
              description: 'Experience relevance score 0-100',
            },
            keywordAlignment: {
              type: 'number',
              description: 'Keyword alignment score 0-100',
            },
          },
          required: [
            'overallMatch',
            'strengths',
            'gaps',
            'skillOverlap',
            'experienceRelevance',
            'keywordAlignment',
          ],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Failed to calculate match score: No response from AI');
  }

  const contentText = typeof content === 'string' ? content : JSON.stringify(content);
  const matchScore = JSON.parse(contentText) as MatchScore;
  return matchScore;
}
