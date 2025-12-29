import { invokeLLM } from '../_core/llm';

export interface ATSAnalysis {
  atsScore: number;
  keywordAnalysis: {
    matched: string[];
    missing: string[];
    weak: string[];
  };
  formattingWarnings: string[];
  suggestions: Array<{
    original: string;
    suggestion: string;
    reason: string;
  }>;
  riskLevel: 'low' | 'medium' | 'high';
}

/**
 * Analyzes resume ATS compatibility
 * Returns score, keyword gaps, formatting warnings, and safe suggestions
 */
export async function analyzeATSCompatibility(
  resume: {
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
  jobDescription: string
): Promise<ATSAnalysis> {
  // Extract text from resume for analysis
  const resumeText = buildResumeText(resume);

  // Use LLM to perform comprehensive ATS analysis
  const response = await invokeLLM({
    messages: [
      {
        role: 'system',
        content: `You are an ATS (Applicant Tracking System) optimization expert. Analyze resumes for ATS compatibility.
        
CRITICAL RULES:
- NEVER suggest adding skills not in the resume
- NEVER invent experience or metrics
- ONLY suggest wording improvements
- Preserve all factual content
- Be conservative with scoring`,
      },
      {
        role: 'user',
        content: `Analyze this resume for ATS compatibility against the job description.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Provide a JSON response with this exact structure:
{
  "atsScore": <number 0-100>,
  "keywordAnalysis": {
    "matched": [<keywords found in both>],
    "missing": [<keywords in job but not resume>],
    "weak": [<keywords in resume but underemphasized>]
  },
  "formattingWarnings": [<list of ATS-unfriendly formatting issues>],
  "suggestions": [
    {
      "original": "<exact text from resume>",
      "suggestion": "<improved wording only, no new skills>",
      "reason": "<why this helps ATS"
    }
  ],
  "riskLevel": "<low|medium|high>"
}

Focus on:
1. Keyword overlap (skills, tools, frameworks, methodologies)
2. Semantic similarity (synonyms, related terms)
3. Section clarity and structure
4. Bullet point readability
5. Formatting issues that confuse ATS parsers

Be realistic - most resumes score 60-85.`,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'ats_analysis',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            atsScore: {
              type: 'number',
              description: 'ATS compatibility score 0-100',
            },
            keywordAnalysis: {
              type: 'object',
              properties: {
                matched: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Keywords found in both resume and job description',
                },
                missing: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Keywords in job description but not in resume',
                },
                weak: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Keywords in resume but underemphasized',
                },
              },
              required: ['matched', 'missing', 'weak'],
            },
            formattingWarnings: {
              type: 'array',
              items: { type: 'string' },
              description: 'ATS-unfriendly formatting issues',
            },
            suggestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  original: {
                    type: 'string',
                    description: 'Original text from resume',
                  },
                  suggestion: {
                    type: 'string',
                    description: 'Improved wording (no new skills)',
                  },
                  reason: {
                    type: 'string',
                    description: 'Why this helps ATS compatibility',
                  },
                },
                required: ['original', 'suggestion', 'reason'],
              },
            },
            riskLevel: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              description: 'Overall ATS risk level',
            },
          },
          required: [
            'atsScore',
            'keywordAnalysis',
            'formattingWarnings',
            'suggestions',
            'riskLevel',
          ],
          additionalProperties: false,
        },
      },
    },
  });

  // Parse the response
  const content = response.choices[0]?.message.content;
  if (!content || typeof content !== 'string') {
    throw new Error('Failed to get ATS analysis from LLM');
  }

  const analysis = JSON.parse(content) as ATSAnalysis;

  // Validate that suggestions don't add new skills
  validateSuggestions(analysis.suggestions, resume);

  return analysis;
}

/**
 * Builds plain text representation of resume for analysis
 */
function buildResumeText(resume: {
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
}): string {
  const parts: string[] = [];

  if (resume.summary) {
    parts.push(`PROFESSIONAL SUMMARY:\n${resume.summary}\n`);
  }

  if (resume.skills && resume.skills.length > 0) {
    parts.push(`SKILLS:\n${resume.skills.join(', ')}\n`);
  }

  if (resume.experience && resume.experience.length > 0) {
    parts.push('EXPERIENCE:');
    resume.experience.forEach((exp) => {
      parts.push(`${exp.title} at ${exp.company}`);
      if (exp.description) {
        parts.push(exp.description);
      }
      if (exp.bullets && exp.bullets.length > 0) {
        parts.push(exp.bullets.map((b) => `- ${b}`).join('\n'));
      }
    });
    parts.push('');
  }

  if (resume.education && resume.education.length > 0) {
    parts.push('EDUCATION:');
    resume.education.forEach((edu) => {
      parts.push(`${edu.degree} in ${edu.field} from ${edu.school}`);
    });
  }

  return parts.join('\n');
}

/**
 * Validates that suggestions don't introduce new skills
 */
function validateSuggestions(
  suggestions: Array<{
    original: string;
    suggestion: string;
    reason: string;
  }>,
  resume: {
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
  }
): void {
  // Extract all skills and technologies mentioned in resume
  const resumeContent = buildResumeText(resume).toLowerCase();
  const skillsList = resume.skills.map((s) => s.toLowerCase());

  // Check each suggestion
  for (const suggestion of suggestions) {
    const suggestionLower = suggestion.suggestion.toLowerCase();

    // Look for new technical terms that weren't in original
    const newTerms = extractTechnicalTerms(suggestionLower).filter(
      (term) =>
        !resumeContent.includes(term) &&
        !skillsList.some((skill) => skill.includes(term))
    );

    if (newTerms.length > 0) {
      // Log warning but don't throw - LLM might have introduced new terms
      const termsStr = newTerms.join(', ');
      console.warn(`[ATS] Suggestion may introduce new terms: ${termsStr}`);
    }
  }
}

/**
 * Extracts technical terms from text
 */
function extractTechnicalTerms(text: string): string[] {
  // Look for common programming languages, frameworks, tools
  const technicalPattern =
    /\b(python|javascript|typescript|java|c\+\+|react|angular|vue|node|express|django|flask|spring|kubernetes|docker|aws|azure|gcp|sql|mongodb|postgresql|redis|elasticsearch|kafka|git|jenkins|terraform|ansible|ci\/cd|rest|graphql|microservices|serverless|lambda|ec2|s3|rds|dynamodb|cloudformation|terraform|ansible|prometheus|grafana|datadog|new relic|splunk)\b/gi;

  const matches = text.match(technicalPattern) || [];
  const uniqueTerms = Array.from(new Set(matches.map((m) => m.toLowerCase())));
  return uniqueTerms;
}

/**
 * Generates safe optimization suggestions using LLM
 */
export async function generateSafeOptimizations(
  resume: {
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
  jobDescription: string
): Promise<string> {
  const resumeText = buildResumeText(resume);

  const response = await invokeLLM({
    messages: [
      {
        role: 'system',
        content: `You are an expert at improving resume wording for ATS compatibility without changing meaning or adding skills.
        
RULES:
- Reword ONLY, never add new skills or experience
- Keep all factual content intact
- Focus on clarity and keyword visibility
- Make bullets more impactful
- Use action verbs effectively`,
      },
      {
        role: 'user',
        content: `Reword this resume for better ATS compatibility against this job description.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Provide the reworded resume in the same format, with improved wording only. No new skills or experience should be added.`,
      },
    ],
  });

  const content = response.choices[0]?.message.content;
  if (content && typeof content === 'string') {
    return content;
  }
  return '';
}
