import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun } from 'docx';
import { CustomizedResume } from '../../drizzle/schema';
import { storagePut } from '../storage';
import axios from 'axios';
import { getTemplate, formatHeading, formatBullet, getSpacingMultiplier, type TemplateType } from '../../shared/templates';

/**
 * Generate sanitized filename for downloads
 */
function sanitizeFilename(text: string): string {
  return text.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
}

/**
 * Generate PDF resume
 */
export async function generateResumePDF(
  customizedResume: CustomizedResume,
  companyName: string,
  roleName: string,
  photoUrl?: string,
  templateId: TemplateType = 'classic'
): Promise<{ url: string; key: string }> {
  const template = getTemplate(templateId);
  // Fetch photo before creating PDF (if provided)
  let photoBuffer: Buffer | undefined;
  if (photoUrl) {
    try {
      const response = await axios.get(photoUrl, { responseType: 'arraybuffer' });
      photoBuffer = Buffer.from(response.data);
    } catch (error) {
      console.error('Failed to fetch photo:', error);
    }
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', async () => {
      try {
        const pdfBuffer = Buffer.concat(chunks);
        const timestamp = Date.now();
        const sanitizedCompany = sanitizeFilename(companyName);
        const sanitizedRole = sanitizeFilename(roleName);
        const fileKey = `resumes/Resume_${sanitizedCompany}_${sanitizedRole}_${timestamp}.pdf`;
        const result = await storagePut(fileKey, pdfBuffer, 'application/pdf');
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });

    // Title
    const pageWidth = doc.page.width;
    const pageMargin = 50;
    const photoSize = 100;
    const photoGap = 15; // Gap between photo and text
    
    if (photoBuffer) {
      // Add photo in top-right corner
      doc.image(photoBuffer, pageWidth - pageMargin - photoSize, pageMargin, {
        width: photoSize,
        height: photoSize,
        fit: [photoSize, photoSize],
        align: 'center',
        valign: 'center'
      });
    }
    
    // Title (left-aligned to avoid photo)
    const titleWidth = photoBuffer ? pageWidth - 2 * pageMargin - photoSize - photoGap : pageWidth - 2 * pageMargin;
    doc.fontSize(20).font('Helvetica-Bold').text('RESUME', pageMargin, pageMargin, { 
      width: titleWidth,
      align: 'left' 
    });
    
    // Add extra space if photo is present to prevent overlap
    if (photoBuffer) {
      doc.moveDown(2.5); // Extra space for photo height
    } else {
      doc.moveDown();
    }

    // Summary
    const summaryHeading = formatHeading('PROFESSIONAL SUMMARY', template);
    doc.fontSize(14).font('Helvetica-Bold').text(summaryHeading);
    doc.moveDown(0.5 * getSpacingMultiplier(template));
    
    // Calculate text width to avoid photo overlap
    const textWidth = photoBuffer ? pageWidth - 2 * pageMargin - photoSize - photoGap : pageWidth - 2 * pageMargin;
    doc.fontSize(11).font('Helvetica').text(customizedResume.summary.revised, pageMargin, doc.y, {
      width: textWidth,
      align: 'left'
    });
    doc.moveDown();

    // Skills
    if (customizedResume.skills.length > 0) {
      const skillsHeading = formatHeading('SKILLS', template);
      doc.fontSize(14).font('Helvetica-Bold').text(skillsHeading);
      doc.moveDown(0.5 * getSpacingMultiplier(template));
      doc.fontSize(11).font('Helvetica').text(customizedResume.skills.join(' • '));
      doc.moveDown();
    }

    // Experience
    if (customizedResume.experience.length > 0) {
      const expHeading = formatHeading('EXPERIENCE', template);
      doc.fontSize(14).font('Helvetica-Bold').text(expHeading);
      doc.moveDown(0.5 * getSpacingMultiplier(template));

      customizedResume.experience.forEach((exp) => {
        doc.fontSize(12).font('Helvetica-Bold').text(exp.role);
        doc.fontSize(11).font('Helvetica-Oblique').text(`${exp.company}${exp.duration ? ` | ${exp.duration}` : ''}`);
        doc.moveDown(0.3);

        exp.bullets.forEach((bullet) => {
          doc.fontSize(11).font('Helvetica').text(`• ${bullet.revised}`, { indent: 20 });
        });
        doc.moveDown();
      });
    }

    // Projects
    if (customizedResume.projects.length > 0) {
      doc.fontSize(14).font('Helvetica-Bold').text('PROJECTS');
      doc.moveDown(0.5);

      customizedResume.projects.forEach((project) => {
        doc.fontSize(12).font('Helvetica-Bold').text(project.name);
        doc.fontSize(11).font('Helvetica').text(project.description);
        if (project.technologies && project.technologies.length > 0) {
          doc.fontSize(10).font('Helvetica-Oblique').text(`Technologies: ${project.technologies.join(', ')}`);
        }
        doc.moveDown(0.5);
      });
    }

    // Education
    if (customizedResume.education.length > 0) {
      const eduHeading = formatHeading('EDUCATION', template);
      doc.fontSize(14).font('Helvetica-Bold').text(eduHeading);
      doc.moveDown(0.5 * getSpacingMultiplier(template));

      customizedResume.education.forEach((edu) => {
        doc.fontSize(12).font('Helvetica-Bold').text(edu.degree);
        doc.fontSize(11).font('Helvetica').text(
          `${edu.institution}${edu.field ? ` | ${edu.field}` : ''}${edu.year ? ` | ${edu.year}` : ''}`
        );
        doc.moveDown(0.5);
      });
    }

    doc.end();
  });
}

/**
 * Generate DOCX resume
 */
export async function generateResumeDOCX(
  customizedResume: CustomizedResume,
  companyName: string,
  roleName: string,
  photoUrl?: string,
  templateId: TemplateType = 'classic'
): Promise<{ url: string; key: string }> {
  const template = getTemplate(templateId);
  // Fetch photo before creating DOCX (if provided)
  let photoBuffer: Buffer | undefined;
  if (photoUrl) {
    try {
      const response = await axios.get(photoUrl, { responseType: 'arraybuffer' });
      photoBuffer = Buffer.from(response.data);
    } catch (error) {
      console.error('Failed to fetch photo for DOCX:', error);
    }
  }

  const sections: Paragraph[] = [];

  // Add photo if provided (top-right)
  if (photoBuffer) {
    sections.push(
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
        alignment: AlignmentType.RIGHT,
      })
    );
  }

  // Title
  sections.push(
    new Paragraph({
      text: 'RESUME',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  // Summary
  sections.push(
    new Paragraph({
      text: formatHeading('PROFESSIONAL SUMMARY', template),
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200 * getSpacingMultiplier(template), after: 100 * getSpacingMultiplier(template) },
    })
  );
  sections.push(
    new Paragraph({
      text: customizedResume.summary.revised,
      spacing: { after: 200 },
    })
  );

  // Skills
  if (customizedResume.skills.length > 0) {
    sections.push(
      new Paragraph({
        text: formatHeading('SKILLS', template),
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200 * getSpacingMultiplier(template), after: 100 * getSpacingMultiplier(template) },
      })
    );
    sections.push(
      new Paragraph({
        text: customizedResume.skills.join(' • '),
        spacing: { after: 200 },
      })
    );
  }

  // Experience
  if (customizedResume.experience.length > 0) {
    sections.push(
      new Paragraph({
        text: formatHeading('EXPERIENCE', template),
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200 * getSpacingMultiplier(template), after: 100 * getSpacingMultiplier(template) },
      })
    );

    customizedResume.experience.forEach((exp) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.role, bold: true }),
          ],
          spacing: { after: 50 },
        })
      );
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${exp.company}${exp.duration ? ` | ${exp.duration}` : ''}`, italics: true }),
          ],
          spacing: { after: 100 },
        })
      );

      exp.bullets.forEach((bullet) => {
        sections.push(
          new Paragraph({
            text: `• ${bullet.revised}`,
            spacing: { after: 50 },
          })
        );
      });

      sections.push(new Paragraph({ text: '', spacing: { after: 100 } }));
    });
  }

  // Projects
  if (customizedResume.projects.length > 0) {
    sections.push(
      new Paragraph({
        text: 'PROJECTS',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 100 },
      })
    );

    customizedResume.projects.forEach((project) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: project.name, bold: true }),
          ],
          spacing: { after: 50 },
        })
      );
      sections.push(
        new Paragraph({
          text: project.description,
          spacing: { after: 50 },
        })
      );
      if (project.technologies && project.technologies.length > 0) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Technologies: ${project.technologies.join(', ')}`, italics: true }),
            ],
            spacing: { after: 100 },
          })
        );
      }
    });
  }

  // Education
  if (customizedResume.education.length > 0) {
    sections.push(
      new Paragraph({
        text: formatHeading('EDUCATION', template),
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200 * getSpacingMultiplier(template), after: 100 * getSpacingMultiplier(template) },
      })
    );

    customizedResume.education.forEach((edu) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.degree, bold: true }),
          ],
          spacing: { after: 50 },
        })
      );
      sections.push(
        new Paragraph({
          text: `${edu.institution}${edu.field ? ` | ${edu.field}` : ''}${edu.year ? ` | ${edu.year}` : ''}`,
          spacing: { after: 100 },
        })
      );
    });
  }

  const doc = new Document({
    sections: [{ children: sections }],
  });

  const buffer = await Packer.toBuffer(doc);
  const sanitizedCompany = sanitizeFilename(companyName);
  const sanitizedRole = sanitizeFilename(roleName);
  const filename = `Resume_${sanitizedCompany}_${sanitizedRole}_${Date.now()}.docx`;

  return storagePut(filename, buffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
}

/**
 * Generate PDF cover letter
 */
export async function generateCoverLetterPDF(
  coverLetter: string,
  companyName: string,
  roleName: string
): Promise<{ url: string; key: string }> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', async () => {
      try {
        const buffer = Buffer.concat(chunks);
        const sanitizedCompany = sanitizeFilename(companyName);
        const sanitizedRole = sanitizeFilename(roleName);
        const filename = `CoverLetter_${sanitizedCompany}_${sanitizedRole}_${Date.now()}.pdf`;
        
        const result = await storagePut(filename, buffer, 'application/pdf');
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });

    doc.fontSize(20).font('Helvetica-Bold').text('COVER LETTER', { align: 'center' });
    doc.moveDown(2);
    doc.fontSize(11).font('Helvetica').text(coverLetter, { align: 'left', lineGap: 5 });

    doc.end();
  });
}

/**
 * Generate DOCX cover letter
 */
export async function generateCoverLetterDOCX(
  coverLetter: string,
  companyName: string,
  roleName: string
): Promise<{ url: string; key: string }> {
  const paragraphs = coverLetter.split('\n\n').map(
    (para) =>
      new Paragraph({
        text: para.trim(),
        spacing: { after: 200 },
      })
  );

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: 'COVER LETTER',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          ...paragraphs,
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const sanitizedCompany = sanitizeFilename(companyName);
  const sanitizedRole = sanitizeFilename(roleName);
  const filename = `CoverLetter_${sanitizedCompany}_${sanitizedRole}_${Date.now()}.docx`;

  return storagePut(filename, buffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
}
