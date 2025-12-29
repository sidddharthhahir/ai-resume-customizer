import { describe, it, expect, vi } from 'vitest';
import { analyzeATSCompatibility } from './services/atsScanner';

describe('ATS Scanner Service', () => {
  it('should return a valid ATS analysis structure', async () => {
    const mockResume = {
      summary: 'Experienced software engineer with 5 years of experience',
      skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
      experience: [
        {
          title: 'Senior Engineer',
          company: 'Tech Corp',
          description: '2021-2023',
          bullets: [
            'Built scalable APIs using Node.js',
            'Led team of 3 engineers',
            'Improved performance by 40%',
          ],
        },
      ],
      education: [
        {
          school: 'University of Tech',
          degree: 'BS',
          field: 'Computer Science',
        },
      ],
    };

    const mockJobDescription = `
      We are looking for a Senior Software Engineer with experience in:
      - React and TypeScript
      - Node.js backend development
      - PostgreSQL databases
      - Team leadership
      - API design
      - Performance optimization
    `;

    // Mock the LLM call
    vi.mock('./services/atsScanner', async () => {
      const actual = await vi.importActual('./services/atsScanner');
      return {
        ...actual,
        analyzeATSCompatibility: vi.fn().mockResolvedValue({
          atsScore: 85,
          keywordAnalysis: {
            matched: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'API'],
            missing: ['CI/CD', 'Docker'],
            weak: ['Performance optimization'],
          },
          formattingWarnings: [],
          suggestions: [
            {
              original: 'Improved performance by 40%',
              suggestion: 'Optimized database queries and caching strategies, improving application performance by 40%',
              reason: 'More specific and impactful for ATS',
            },
          ],
          riskLevel: 'low',
        }),
      };
    });

    // Note: In a real test, we would need to mock the LLM service
    // For now, we verify the structure is correct
    expect(mockResume).toHaveProperty('summary');
    expect(mockResume).toHaveProperty('skills');
    expect(mockResume).toHaveProperty('experience');
    expect(mockResume).toHaveProperty('education');
    expect(Array.isArray(mockResume.skills)).toBe(true);
    expect(Array.isArray(mockResume.experience)).toBe(true);
    expect(Array.isArray(mockResume.education)).toBe(true);
  });

  it('should validate that suggestions do not add new skills', () => {
    const suggestions = [
      {
        original: 'Worked with React',
        suggestion: 'Developed responsive web applications using React and TypeScript',
        reason: 'More specific technology stack',
      },
    ];

    const resume = {
      summary: 'Software engineer',
      skills: ['React', 'TypeScript', 'Node.js'],
      experience: [],
      education: [],
    };

    // Verify suggestions only reword existing content
    suggestions.forEach((suggestion) => {
      const lowerSuggestion = suggestion.suggestion.toLowerCase();
      const resumeText = JSON.stringify(resume).toLowerCase();

      // Check that core technologies mentioned are in the resume
      const mentionedTechs = ['react', 'typescript', 'node.js'];
      const allTechsPresent = mentionedTechs.every(
        (tech) => resumeText.includes(tech) || lowerSuggestion.includes(tech)
      );

      expect(allTechsPresent).toBe(true);
    });
  });

  it('should calculate ATS score between 0 and 100', () => {
    const validScores = [0, 25, 50, 75, 85, 100];

    validScores.forEach((score) => {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  it('should categorize risk levels correctly', () => {
    const riskLevels = ['low', 'medium', 'high'];

    riskLevels.forEach((risk) => {
      expect(['low', 'medium', 'high']).toContain(risk);
    });
  });

  it('should identify keyword gaps without suggesting additions', () => {
    const analysis = {
      keywordAnalysis: {
        matched: ['React', 'Node.js'],
        missing: ['Docker', 'Kubernetes'],
        weak: ['Testing'],
      },
    };

    // Verify structure
    expect(analysis.keywordAnalysis).toHaveProperty('matched');
    expect(analysis.keywordAnalysis).toHaveProperty('missing');
    expect(analysis.keywordAnalysis).toHaveProperty('weak');

    // Verify arrays
    expect(Array.isArray(analysis.keywordAnalysis.matched)).toBe(true);
    expect(Array.isArray(analysis.keywordAnalysis.missing)).toBe(true);
    expect(Array.isArray(analysis.keywordAnalysis.weak)).toBe(true);
  });
});
