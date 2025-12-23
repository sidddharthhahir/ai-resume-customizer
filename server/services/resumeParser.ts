import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { invokeLLM } from '../_core/llm';
import { ParsedResume } from '../../drizzle/schema';

/**
 * Extract text from PDF buffer
 */
async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();
  return result.text;
}

/**
 * Extract text from DOCX buffer
 */
async function extractDocxText(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/**
 * Extract text from resume file based on mime type
 */
export async function extractResumeText(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') {
    return extractPdfText(buffer);
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    return extractDocxText(buffer);
  } else {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }
}

/**
 * Parse resume text into structured JSON using AI
 */
export async function parseResumeWithAI(resumeText: string): Promise<ParsedResume> {
  const systemPrompt = `You are a professional resume parser. Extract information from resumes into structured JSON format.

CRITICAL RULES:
- Extract ONLY information that exists in the resume
- Do NOT invent or assume any information
- If a field is not present, use empty string or empty array
- Preserve exact company names, role titles, and technologies mentioned
- Keep all metrics and numbers exactly as stated

Return a JSON object with this exact structure:
{
  "summary": "professional summary or objective statement",
  "skills": ["skill1", "skill2", ...],
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "duration": "Jan 2020 - Present",
      "bullets": ["achievement 1", "achievement 2", ...]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "brief description",
      "technologies": ["tech1", "tech2", ...]
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "Degree Type",
      "field": "Field of Study",
      "year": "2020"
    }
  ]
}`;

  const userPrompt = `Parse the following resume into structured JSON:\n\n${resumeText}`;

  const response = await invokeLLM({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'resume_parser',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            summary: { type: 'string', description: 'Professional summary or objective' },
            skills: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of skills mentioned in resume',
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
                    items: { type: 'string' },
                  },
                },
                required: ['company', 'role', 'bullets'],
                additionalProperties: false,
              },
            },
            projects: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  technologies: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                },
                required: ['name', 'description'],
                additionalProperties: false,
              },
            },
            education: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  institution: { type: 'string' },
                  degree: { type: 'string' },
                  field: { type: 'string' },
                  year: { type: 'string' },
                },
                required: ['institution', 'degree'],
                additionalProperties: false,
              },
            },
          },
          required: ['summary', 'skills', 'experience', 'projects', 'education'],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Failed to parse resume: No response from AI');
  }

  const contentText = typeof content === 'string' ? content : JSON.stringify(content);
  const parsed = JSON.parse(contentText) as ParsedResume;
  return parsed;
}
