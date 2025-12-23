import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, Image as ImageIcon, Loader2, CheckCircle2, X } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface PhotoUploadStepProps {
  onComplete: (includePhoto: boolean, photoUrl?: string, photoKey?: string) => void;
}

export default function PhotoUploadStep({ onComplete }: PhotoUploadStepProps) {
  const [includePhoto, setIncludePhoto] = useState<'yes' | 'no' | null>(null);
  const [uploading, setUploading] = useState(false);
  const [photoData, setPhotoData] = useState<{ url: string; key: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.customization.uploadPhoto.useMutation({
    onSuccess: (data) => {
      setPhotoData({ url: data.photoUrl, key: data.photoKey });
      toast.success('Photo uploaded successfully!');
      setUploading(false);
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
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPG or PNG image');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo size must be less than 5MB');
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

  const handleContinue = () => {
    if (includePhoto === 'yes' && photoData) {
      onComplete(true, photoData.url, photoData.key);
    } else if (includePhoto === 'no') {
      onComplete(false);
    }
  };

  const canContinue = includePhoto === 'no' || (includePhoto === 'yes' && photoData !== null);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Do you want to include a photo in your resume?</h3>
        
        <RadioGroup
          value={includePhoto || ''}
          onValueChange={(value) => setIncludePhoto(value as 'yes' | 'no')}
        >
          <div className="flex items-center space-x-2 mb-3">
            <RadioGroupItem value="yes" id="yes" />
            <Label htmlFor="yes" className="cursor-pointer">
              Yes, include my photo
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="no" />
            <Label htmlFor="no" className="cursor-pointer">
              No, skip photo
            </Label>
          </div>
        </RadioGroup>
      </Card>

      {includePhoto === 'yes' && (
        <>
          {!photoData ? (
            <Card
              className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="p-12 text-center">
                <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upload Your Photo</h3>
                <p className="text-gray-600 mb-4">
                  Click to browse or drag and drop your profile photo
                </p>
                <p className="text-sm text-gray-500">
                  JPG or PNG (max 5MB) • Professional headshot recommended
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </Card>
          ) : (
            <Card className="border-green-200 bg-green-50">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">
                      Photo Uploaded Successfully
                    </h3>
                    <div className="flex items-center gap-4">
                      <img
                        src={photoData.url}
                        alt="Profile"
                        className="w-24 h-24 object-cover rounded border-2 border-green-300"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 mb-2">
                          Your photo will appear in the top-right corner of your resume.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPhotoData(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Remove Photo
                        </Button>
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
              <span>Uploading your photo...</span>
            </div>
          )}
        </>
      )}

      {includePhoto === 'no' && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800">
            Your resume will be generated without a photo. You can always add one later by creating a new customization.
          </p>
        </Card>
      )}

      <Button
        onClick={handleContinue}
        disabled={!canContinue}
        className="w-full"
        size="lg"
      >
        Continue
      </Button>
    </div>
  );
}
