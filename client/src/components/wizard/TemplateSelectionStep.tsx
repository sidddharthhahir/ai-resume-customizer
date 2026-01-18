import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Zap } from 'lucide-react';
import { TEMPLATE_LIST } from '@shared/templates';
import type { TemplateType } from '@shared/templates';

interface TemplateSelectionStepProps {
  onComplete: (templateId: TemplateType) => void;
}

export default function TemplateSelectionStep({ onComplete }: TemplateSelectionStepProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('classic');

  const handleContinue = () => {
    onComplete(selectedTemplate);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Choose Your Resume Template</h3>
        <p className="text-gray-600">
          Select a professional, ATS-friendly template that matches your industry and style.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TEMPLATE_LIST.map((template) => (
          <Card
            key={template.id}
            className={`p-4 cursor-pointer transition-all border-2 ${
              selectedTemplate === template.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{template.icon}</span>
                <div>
                  <h4 className="font-semibold text-lg">{template.name}</h4>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </div>
              </div>
              {selectedTemplate === template.id && (
                <Check className="w-6 h-6 text-blue-600 flex-shrink-0" />
              )}
            </div>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">
                ATS Score: {template.atsScore}/100
              </span>
              {template.atsScore >= 95 && (
                <Badge variant="secondary" className="ml-auto">
                  Best for ATS
                </Badge>
              )}
            </div>

            <div className="mt-3 text-xs text-gray-600 space-y-1">
              <p>
                <span className="font-medium">Font:</span> {template.fontFamily}
              </p>
              <p>
                <span className="font-medium">Spacing:</span> {template.sectionSpacing}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Template Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • <span className="font-medium">Minimal template:</span> Highest ATS compatibility, perfect for large
            applicant tracking systems
          </li>
          <li>
            • <span className="font-medium">Classic template:</span> Traditional format trusted by recruiters across all
            industries
          </li>
          <li>
            • <span className="font-medium">Technical template:</span> Emphasizes skills section, ideal for engineering
            roles
          </li>
          <li>
            • <span className="font-medium">Professional Sidebar:</span> Two-column layout with profile photo, perfect for tech professionals
          </li>
          <li>
            • <span className="font-medium">Modern/Creative:</span> Great for design, marketing, and creative fields
          </li>
        </ul>
      </div>

      <Button onClick={handleContinue} className="w-full" size="lg">
        Continue with {TEMPLATE_LIST.find((t) => t.id === selectedTemplate)?.name} Template
      </Button>
    </div>
  );
}
