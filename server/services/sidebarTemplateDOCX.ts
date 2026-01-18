import { Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableCell, TableRow, BorderStyle, WidthType, ImageRun, VerticalAlign } from 'docx';
import { CustomizedResume } from '../../drizzle/schema';

/**
 * Generate Professional Sidebar template DOCX sections
 * Two-column layout with circular photo, contact info, and main content
 */
export function generateSidebarDOCXSections(
  customizedResume: CustomizedResume,
  photoBuffer?: Buffer
): (Paragraph | Table)[] {
  const sections: Paragraph[] = [];

  // Header with photo and name
  const headerCells: TableCell[] = [];

  // Left cell: Photo
  if (photoBuffer) {
    headerCells.push(
      new TableCell({
        children: [
          new Paragraph({
            children: [
              new ImageRun({
                type: 'png',
                data: photoBuffer,
                transformation: {
                  width: 100,
                  height: 100,
                },
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
        ],
        width: { size: 100, type: WidthType.PERCENTAGE },
        verticalAlign: VerticalAlign.CENTER,
      })
    );
  }

  // Right cell: Name and contact
  const contactChildren: Paragraph[] = [
    new Paragraph({
      text: 'Your Name',
      heading: HeadingLevel.TITLE,
      spacing: { after: 100 },
    }),
  ];

  headerCells.push(
    new TableCell({
      children: contactChildren,
      width: { size: 100, type: WidthType.PERCENTAGE },
      verticalAlign: VerticalAlign.CENTER,
    })
  );

  sections.push(
    new Table({
      rows: [
        new TableRow({
          children: headerCells,
          height: { value: 120, rule: 'atLeast' },
        }),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    }) as any
  );

  // Professional Summary
  if (customizedResume.summary?.revised) {
    sections.push(
      new Paragraph({
        text: 'PROFESSIONAL SUMMARY',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 },
        border: {
          bottom: {
            color: '000000',
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    );
    sections.push(
      new Paragraph({
        text: customizedResume.summary.revised,
        spacing: { after: 200 },
      })
    );
  }

  // Technical Skills
  if (customizedResume.skills && customizedResume.skills.length > 0) {
    sections.push(
      new Paragraph({
        text: 'TECHNICAL SKILLS',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 },
        border: {
          bottom: {
            color: '000000',
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    );

    // Group skills by category
    const skillsByCategory = groupSkillsByCategory(customizedResume.skills);
    Object.entries(skillsByCategory).forEach(([category, skills]) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${category}: `,
              bold: true,
            }),
            new TextRun({
              text: skills.join(', '),
            }),
          ],
          spacing: { after: 100 },
          indent: { left: 400 },
        })
      );
    });

    sections.push(new Paragraph({ text: '', spacing: { after: 100 } }));
  }

  // Experience
  if (customizedResume.experience && customizedResume.experience.length > 0) {
    sections.push(
      new Paragraph({
        text: 'EXPERIENCE',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 },
        border: {
          bottom: {
            color: '000000',
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    );

    customizedResume.experience.forEach((exp) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.role,
              bold: true,
            }),
          ],
          spacing: { after: 50 },
          indent: { left: 400 },
        })
      );

      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${exp.company}${exp.duration ? ` | ${exp.duration}` : ''}`,
              italics: true,
            }),
          ],
          spacing: { after: 100 },
          indent: { left: 400 },
        })
      );

      exp.bullets.forEach((bullet) => {
        sections.push(
          new Paragraph({
            text: bullet.revised,
            spacing: { after: 50 },
            indent: { left: 800 },
            bullet: {
              level: 0,
            },
          })
        );
      });

      sections.push(new Paragraph({ text: '', spacing: { after: 100 } }));
    });
  }

  // Projects
  if (customizedResume.projects && customizedResume.projects.length > 0) {
    sections.push(
      new Paragraph({
        text: 'PROJECTS',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 },
        border: {
          bottom: {
            color: '000000',
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    );

    customizedResume.projects.forEach((project) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: project.name,
              bold: true,
            }),
          ],
          spacing: { after: 50 },
          indent: { left: 400 },
        })
      );

      if (project.technologies && project.technologies.length > 0) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: project.technologies.join(', '),
                italics: true,
              }),
            ],
            spacing: { after: 50 },
            indent: { left: 400 },
          })
        );
      }

      if (project.description) {
        sections.push(
          new Paragraph({
            text: project.description,
            spacing: { after: 100 },
            indent: { left: 400 },
          })
        );
      }

      sections.push(new Paragraph({ text: '', spacing: { after: 100 } }));
    });
  }

  // Education
  if (customizedResume.education && customizedResume.education.length > 0) {
    sections.push(
      new Paragraph({
        text: 'EDUCATION',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 },
        border: {
          bottom: {
            color: '000000',
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    );

    customizedResume.education.forEach((edu) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: edu.degree,
              bold: true,
            }),
          ],
          spacing: { after: 50 },
          indent: { left: 400 },
        })
      );

      sections.push(
        new Paragraph({
          text: `${edu.institution}${edu.field ? ` | ${edu.field}` : ''}${edu.year ? ` | ${edu.year}` : ''}`,
          spacing: { after: 100 },
          indent: { left: 400 },
        })
      );
    });
  }

  return sections as any[];
}

/**
 * Group skills by category
 */
function groupSkillsByCategory(skills: string[]): Record<string, string[]> {
  const categories: Record<string, string[]> = {
    'Frontend': [],
    'Backend': [],
    'Databases': [],
    'AI/ML': [],
    'DevOps': [],
    'Other': [],
  };

  const categoryKeywords = {
    'Frontend': ['react', 'vue', 'angular', 'next', 'typescript', 'javascript', 'html', 'css', 'tailwind', 'vite'],
    'Backend': ['python', 'django', 'node', 'express', 'java', 'spring', 'go', 'rust', 'php'],
    'Databases': ['postgresql', 'mysql', 'mongodb', 'redis', 'supabase', 'firebase'],
    'AI/ML': ['tensorflow', 'pytorch', 'llm', 'ollama', 'langchain', 'huggingface'],
    'DevOps': ['docker', 'kubernetes', 'github', 'gitlab', 'ci/cd', 'aws', 'gcp', 'azure'],
  };

  skills.forEach((skill) => {
    const lowerSkill = skill.toLowerCase();
    let categorized = false;

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((keyword) => lowerSkill.includes(keyword))) {
        categories[category].push(skill);
        categorized = true;
        break;
      }
    }

    if (!categorized) {
      categories['Other'].push(skill);
    }
  });

  // Remove empty categories
  return Object.fromEntries(Object.entries(categories).filter(([, skills]) => skills.length > 0));
}
