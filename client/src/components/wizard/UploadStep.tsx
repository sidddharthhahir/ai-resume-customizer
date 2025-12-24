import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import type { Resume } from '../../../../drizzle/schema';

interface UploadStepProps {
  onComplete: (resume: Resume) => void;
}

export default function UploadStep({ onComplete }: UploadStepProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedResume, setUploadedResume] = useState<Resume | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.resume.upload.useMutation({
    onSuccess: (resume) => {
      setUploadedResume(resume);
      onComplete(resume);
      toast.success('Resume uploaded and parsed successfully!');
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
      setUploading(false);
    },
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];

    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF or DOCX file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploading(true);

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result?.toString().split(',')[1];
      if (!base64) {
        toast.error('Failed to read file');
        setUploading(false);
        return;
      }

      uploadMutation.mutate({
        fileName: file.name,
        fileData: base64,
        mimeType: file.type,
      });
    };

    reader.onerror = () => {
      toast.error('Failed to read file');
      setUploading(false);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {!uploadedResume ? (
        <Card
          className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="p-6 md:p-12 text-center">
            <Upload className="w-12 md:w-16 h-12 md:h-16 mx-auto text-gray-400 mb-3 md:mb-4" />
            <h3 className="text-base md:text-lg font-semibold mb-2">Upload Your Resume</h3>
            <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
              Click to browse or drag and drop your resume here
            </p>
            <p className="text-xs md:text-sm text-gray-500">Supports PDF and DOCX (max 10MB)</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </Card>
      ) : (
        <Card className="border-green-200 bg-green-50">
          <div className="p-4 md:p-6">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Resume Uploaded Successfully
                </h3>
                <div className="flex items-center gap-2 text-gray-700 mb-4">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">{uploadedResume.originalFileName}</span>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold mb-2">Parsed Information:</h4>
                  <div className="text-sm space-y-1 text-gray-700">
                    <p>
                      <strong>Skills:</strong> {uploadedResume.parsedContent.skills.length} found
                    </p>
                    <p>
                      <strong>Experience:</strong> {uploadedResume.parsedContent.experience.length}{' '}
                      positions
                    </p>
                    <p>
                      <strong>Projects:</strong> {uploadedResume.parsedContent.projects.length}
                    </p>
                    <p>
                      <strong>Education:</strong> {uploadedResume.parsedContent.education.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {uploading && (
        <div className="flex items-center justify-center gap-3 text-blue-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Uploading and parsing your resume...</span>
        </div>
      )}
    </div>
  );
}
