import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import type { Customization } from '../../../../drizzle/schema';

interface DownloadStepProps {
  customization: Customization;
}

export default function DownloadStep({ customization }: DownloadStepProps) {
  const [generating, setGenerating] = useState(false);
  const [files, setFiles] = useState<{
    resumePdfUrl: string;
    resumeDocxUrl: string;
    coverLetterPdfUrl: string;
    coverLetterDocxUrl: string;
  } | null>(
    customization.resumePdfUrl
      ? {
          resumePdfUrl: customization.resumePdfUrl,
          resumeDocxUrl: customization.resumeDocxUrl!,
          coverLetterPdfUrl: customization.coverLetterPdfUrl!,
          coverLetterDocxUrl: customization.coverLetterDocxUrl!,
        }
      : null
  );

  const generateFilesMutation = trpc.customization.generateFiles.useMutation({
    onSuccess: (result) => {
      setFiles(result);
      toast.success('Files generated successfully!');
      setGenerating(false);
    },
    onError: (error) => {
      toast.error(`File generation failed: ${error.message}`);
      setGenerating(false);
    },
  });

  const handleGenerate = () => {
    setGenerating(true);
    generateFilesMutation.mutate({
      customizationId: customization.id,
    });
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!files) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Ready to Download</h3>
          <p className="text-gray-600 mb-6">
            Generate PDF and DOCX files for your customized resume and cover letter
          </p>
          <Button onClick={handleGenerate} disabled={generating} size="lg" className="w-full max-w-md">
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Files...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Generate Download Files
              </>
            )}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-green-50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-green-900">Files Ready for Download</h3>
        </div>
        <p className="text-gray-700">
          Your customized resume and cover letter are ready. Download them in your preferred format.
        </p>
      </Card>

      {/* Resume Downloads */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Customized Resume
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => handleDownload(files.resumePdfUrl, 'Resume.pdf')}
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
          >
            <Download className="w-6 h-6" />
            <div>
              <div className="font-semibold">Download PDF</div>
              <div className="text-xs text-gray-500">Best for printing</div>
            </div>
          </Button>
          <Button
            onClick={() => handleDownload(files.resumeDocxUrl, 'Resume.docx')}
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
          >
            <Download className="w-6 h-6" />
            <div>
              <div className="font-semibold">Download DOCX</div>
              <div className="text-xs text-gray-500">Editable format</div>
            </div>
          </Button>
        </div>
      </Card>

      {/* Cover Letter Downloads */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600" />
          Cover Letter
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => handleDownload(files.coverLetterPdfUrl, 'CoverLetter.pdf')}
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
          >
            <Download className="w-6 h-6" />
            <div>
              <div className="font-semibold">Download PDF</div>
              <div className="text-xs text-gray-500">Best for printing</div>
            </div>
          </Button>
          <Button
            onClick={() => handleDownload(files.coverLetterDocxUrl, 'CoverLetter.docx')}
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
          >
            <Download className="w-6 h-6" />
            <div>
              <div className="font-semibold">Download DOCX</div>
              <div className="text-xs text-gray-500">Editable format</div>
            </div>
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-blue-50 border-blue-200">
        <h4 className="font-semibold mb-2 text-blue-900">Next Steps</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Review the downloaded files before submitting</li>
          <li>Customize further if needed using the DOCX format</li>
          <li>Use the PDF format for final submissions</li>
          <li>Keep your original resume for future customizations</li>
        </ul>
      </Card>
    </div>
  );
}
