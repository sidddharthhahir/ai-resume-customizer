import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Mail, Lightbulb } from 'lucide-react';
import type { Customization } from '../../../../drizzle/schema';

interface ResumePreviewStepProps {
  customization: Customization;
}

export default function ResumePreviewStep({ customization }: ResumePreviewStepProps) {
  const { customizedResume, coverLetter, explanation } = customization;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="resume" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resume" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Customized Resume
          </TabsTrigger>
          <TabsTrigger value="cover" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Cover Letter
          </TabsTrigger>
          <TabsTrigger value="explanation" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Explanation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resume" className="space-y-4 mt-4">
          {/* Summary */}
          <Card className="p-4">
            <h3 className="font-semibold mb-2 text-sm text-gray-600">PROFESSIONAL SUMMARY</h3>
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-gray-700 line-through">{customizedResume.summary.original}</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <p className="text-sm text-gray-700">{customizedResume.summary.revised}</p>
              </div>
              <p className="text-xs text-gray-600 italic">
                <strong>Why:</strong> {customizedResume.summary.reason}
              </p>
            </div>
          </Card>

          {/* Experience */}
          {customizedResume.experience.map((exp, expIndex) => (
            <Card key={expIndex} className="p-4">
              <div className="mb-3">
                <h3 className="font-semibold text-lg">{exp.role}</h3>
                <p className="text-sm text-gray-600">
                  {exp.company} {exp.duration && `| ${exp.duration}`}
                </p>
              </div>
              <div className="space-y-4">
                {exp.bullets.map((bullet, bulletIndex) => (
                  <div key={bulletIndex} className="space-y-2">
                    <div className="bg-red-50 border border-red-200 rounded p-2">
                      <p className="text-sm text-gray-700 line-through">• {bullet.original}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded p-2">
                      <p className="text-sm text-gray-700">• {bullet.revised}</p>
                    </div>
                    <p className="text-xs text-gray-600 italic pl-4">
                      <strong>Why:</strong> {bullet.reason}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          ))}

          {/* Skills (Preserved) */}
          <Card className="p-4">
            <h3 className="font-semibold mb-2 text-sm text-gray-600">SKILLS (PRESERVED)</h3>
            <div className="flex flex-wrap gap-2">
              {customizedResume.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="cover" className="mt-4">
          <Card className="p-6">
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-gray-700">{coverLetter}</div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="explanation" className="mt-4 space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              Skill Emphasis
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              {explanation.skillEmphasis.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              Wording Changes
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              {explanation.wordingChanges.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-green-600" />
              ATS Improvements
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              {explanation.atsImprovements.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
