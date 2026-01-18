import PDFDocument from 'pdfkit';
import { CustomizedResume } from '../../drizzle/schema';

/**
 * Generate Professional Sidebar template PDF
 * Two-column layout with circular photo, contact info, and main content
 */
export function generateSidebarPDF(
  doc: any,
  customizedResume: CustomizedResume,
  photoBuffer?: Buffer
): void {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const margin = 40;
  const sidebarWidth = 140;
  const contentWidth = pageWidth - 2 * margin - sidebarWidth - 20;

  // Left sidebar background (light gray)
  doc.rect(margin, 0, sidebarWidth, pageHeight).fill('#f9fafb');

  // Add circular photo in sidebar if provided
  if (photoBuffer) {
    const photoSize = 100;
    const photoX = margin + (sidebarWidth - photoSize) / 2;
    const photoY = margin + 20;

    // Create circular mask for photo
    doc.save();
    doc.circle(photoX + photoSize / 2, photoY + photoSize / 2, photoSize / 2).clip();
    doc.image(photoBuffer, photoX, photoY, {
      width: photoSize,
      height: photoSize,
    });
    doc.restore();
  }

  // Contact info in sidebar (placeholder - would come from parsed resume)
  const contactStartY = photoBuffer ? margin + 140 : margin + 20;
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#000000');

  // Main content area
  const contentX = margin + sidebarWidth + 20;
  const contentStartY = margin;

  // Name (main heading)
  doc.fontSize(24).font('Helvetica-Bold').fillColor('#000000').text('Your Name', contentX, contentStartY, {
    width: contentWidth,
  });
  doc.moveDown(0.5);

  // Professional Summary
  if (customizedResume.summary?.revised) {
    doc.fontSize(11).font('Helvetica-Bold').text('PROFESSIONAL SUMMARY', contentX, doc.y);
    doc.fontSize(10).font('Helvetica').text(customizedResume.summary.revised, contentX, doc.y, {
      width: contentWidth,
    });
    doc.moveDown(0.8);
  }

  // Technical Skills
  if (customizedResume.skills && customizedResume.skills.length > 0) {
    doc.fontSize(11).font('Helvetica-Bold').text('TECHNICAL SKILLS', contentX, doc.y);
    doc.moveDown(0.3);

    // Group skills by category if available
    const skillsByCategory = groupSkillsByCategory(customizedResume.skills);
    Object.entries(skillsByCategory).forEach(([category, skills]) => {
      doc.fontSize(10).font('Helvetica-Bold').text(`${category}:`, contentX + 10, doc.y);
      doc.fontSize(9).font('Helvetica').text(skills.join(', '), contentX + 10, doc.y, {
        width: contentWidth - 10,
      });
      doc.moveDown(0.3);
    });
    doc.moveDown(0.5);
  }

  // Experience
  if (customizedResume.experience && customizedResume.experience.length > 0) {
    doc.fontSize(11).font('Helvetica-Bold').text('EXPERIENCE', contentX, doc.y);
    doc.moveDown(0.3);

    customizedResume.experience.forEach((exp, index) => {
      doc.fontSize(10).font('Helvetica-Bold').text(exp.role, contentX + 10, doc.y);
      doc.fontSize(9).font('Helvetica-Oblique').text(`${exp.company}${exp.duration ? ` | ${exp.duration}` : ''}`, contentX + 10, doc.y);
      doc.moveDown(0.2);

      exp.bullets.forEach((bullet) => {
        doc.fontSize(9).font('Helvetica').text(`• ${bullet.revised}`, contentX + 20, doc.y, {
          width: contentWidth - 20,
        });
      });

      if (index < customizedResume.experience.length - 1) {
        doc.moveDown(0.3);
      }
    });
    doc.moveDown(0.5);
  }

  // Projects
  if (customizedResume.projects && customizedResume.projects.length > 0) {
    doc.fontSize(11).font('Helvetica-Bold').text('PROJECTS', contentX, doc.y);
    doc.moveDown(0.3);

    customizedResume.projects.forEach((project, index) => {
      doc.fontSize(10).font('Helvetica-Bold').text(project.name, contentX + 10, doc.y);
      if (project.technologies && project.technologies.length > 0) {
        doc.fontSize(9).font('Helvetica-Oblique').text(project.technologies.join(', '), contentX + 10, doc.y);
      }
      doc.moveDown(0.2);

      if (project.description) {
        doc.fontSize(9).font('Helvetica').text(project.description, contentX + 20, doc.y, {
          width: contentWidth - 20,
        });
      }

      if (index < customizedResume.projects.length - 1) {
        doc.moveDown(0.3);
      }
    });
    doc.moveDown(0.5);
  }

  // Education
  if (customizedResume.education && customizedResume.education.length > 0) {
    doc.fontSize(11).font('Helvetica-Bold').text('EDUCATION', contentX, doc.y);
    doc.moveDown(0.3);

    customizedResume.education.forEach((edu) => {
      doc.fontSize(10).font('Helvetica-Bold').text(edu.degree, contentX + 10, doc.y);
      doc.fontSize(9).font('Helvetica').text(
        `${edu.institution}${edu.field ? ` | ${edu.field}` : ''}${edu.year ? ` | ${edu.year}` : ''}`,
        contentX + 10,
        doc.y,
        { width: contentWidth - 10 }
      );
      doc.moveDown(0.4);
    });
  }
}

/**
 * Group skills by category (Frontend, Backend, etc.)
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
