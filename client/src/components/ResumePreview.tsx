import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getTemplate, formatHeading, formatBullet } from '@shared/templates';
import type { CustomizedResume } from '../../../drizzle/schema';
import type { TemplateType } from '@shared/templates';

interface ResumePreviewProps {
  resume: CustomizedResume;
  templateId: TemplateType;
  photoUrl?: string;
}

export default function ResumePreview({ resume, templateId, photoUrl }: ResumePreviewProps) {
  const template = getTemplate(templateId);

  const previewStyle = useMemo(() => {
    return {
      fontFamily: template.fontFamily === 'serif' ? 'Georgia, serif' : 'Arial, sans-serif',
      color: template.colors.text,
    };
  }, [template]);

  const headingStyle = useMemo(() => {
    const style: React.CSSProperties = {
      color: template.colors.heading,
      fontWeight: 'bold',
      marginTop: '12px',
      marginBottom: '6px',
      fontSize: '14px',
    };
    if (template.headingStyle === 'bold-uppercase') {
      style.textTransform = 'uppercase';
    }
    return style;
  }, [template]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Resume Preview</h3>
        <Badge variant="outline">{template.name} Template</Badge>
      </div>

      {/* Preview Container */}
      <Card className="p-8 bg-white shadow-lg overflow-auto max-h-[600px]" style={previewStyle as React.CSSProperties}>
        {/* Header with Photo */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">RESUME</h1>
          </div>
          {photoUrl && (
            <div className="ml-4 flex-shrink-0">
              <img
                src={photoUrl}
                alt="Profile"
                className="w-24 h-24 object-cover rounded border-2"
                style={{ borderColor: template.colors.accent }}
              />
            </div>
          )}
        </div>

        {/* Professional Summary */}
        <div className="mb-4">
          <h2 style={headingStyle}>{formatHeading('PROFESSIONAL SUMMARY', template)}</h2>
          <p className="text-sm leading-relaxed text-justify">{resume.summary.revised}</p>
        </div>

        {/* Skills */}
        {resume.skills.length > 0 && (
          <div className="mb-4">
            <h2 style={headingStyle}>{formatHeading('SKILLS', template)}</h2>
            <p className="text-sm leading-relaxed flex flex-wrap gap-2">
              {resume.skills.map((skill, idx) => (
                <span key={idx}>
                  {skill}
                  {idx < resume.skills.length - 1 && ' •'}
                </span>
              ))}
            </p>
          </div>
        )}

        {/* Experience */}
        {resume.experience.length > 0 && (
          <div className="mb-4">
            <h2 style={headingStyle}>{formatHeading('EXPERIENCE', template)}</h2>
            {resume.experience.map((exp, idx) => (
              <div key={idx} className="mb-3">
                <div className="font-semibold text-sm">{exp.role}</div>
                <div className="text-xs italic text-gray-600">
                  {exp.company}
                  {exp.duration && ` | ${exp.duration}`}
                </div>
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="text-sm mt-1 ml-4 space-y-1">
                    {exp.bullets.map((bullet, bidx) => {
                      const bulletText = typeof bullet === 'string' ? bullet : bullet.revised;
                      return (
                        <li key={bidx} className="list-disc text-xs">
                          {bulletText}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {resume.projects && resume.projects.length > 0 && (
          <div className="mb-4">
            <h2 style={headingStyle}>{formatHeading('PROJECTS', template)}</h2>
            {resume.projects.map((project, idx) => (
              <div key={idx} className="mb-2">
                <div className="font-semibold text-sm">{project.name}</div>
                <p className="text-xs text-gray-700">{project.description}</p>
                {project.technologies && (
                  <p className="text-xs text-gray-600 italic">
                    <span className="font-medium">Technologies:</span> {project.technologies.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {resume.education.length > 0 && (
          <div className="mb-4">
            <h2 style={headingStyle}>{formatHeading('EDUCATION', template)}</h2>
            {resume.education.map((edu, idx) => (
              <div key={idx} className="mb-2">
                <div className="font-semibold text-sm">{edu.degree}</div>
                <div className="text-xs text-gray-700">
                  {edu.institution}
                  {edu.field && ` | ${edu.field}`}
                  {edu.year && ` | ${edu.year}`}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500">
          <p>
            <span className="font-medium">Template:</span> {template.name} (ATS Score: {template.atsScore}/100)
          </p>
          <p>
            <span className="font-medium">Font:</span> {template.fontFamily} • <span className="font-medium">Spacing:</span>{' '}
            {template.sectionSpacing}
          </p>
        </div>
      </Card>

      {/* Info Box */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">Preview Note:</span> This is a simplified preview. The actual PDF/DOCX download will
          include proper formatting, spacing, and all styling details specific to the {template.name} template.
        </p>
      </Card>
    </div>
  );
}
