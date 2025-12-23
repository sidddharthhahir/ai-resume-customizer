import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import UploadStep from './wizard/UploadStep';
import JobDescriptionStep from './wizard/JobDescriptionStep';
import PhotoUploadStep from './wizard/PhotoUploadStep';
import MatchAnalysisStep from './wizard/MatchAnalysisStep';
import ResumePreviewStep from './wizard/ResumePreviewStep';
import DownloadStep from './wizard/DownloadStep';
import type { Resume, JobDescription, Customization } from '../../../drizzle/schema';

const STEPS = [
  { id: 1, title: 'Upload Resume', description: 'Upload your resume (PDF or DOCX)' },
  { id: 2, title: 'Job Description', description: 'Paste the job description' },
  { id: 3, title: 'Profile Photo', description: 'Optional: Add a profile photo' },
  { id: 4, title: 'Match Analysis', description: 'Review your match score and gaps' },
  { id: 5, title: 'Customized Resume', description: 'Preview optimized resume' },
  { id: 6, title: 'Download', description: 'Download your files' },
];

export default function ResumeWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [resume, setResume] = useState<Resume | null>(null);
  const [job, setJob] = useState<JobDescription | null>(null);
  const [photoData, setPhotoData] = useState<{ includePhoto: boolean; photoUrl?: string; photoKey?: string } | null>(null);
  const [customization, setCustomization] = useState<Customization | null>(null);

  const progress = (currentStep / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canGoNext = () => {
    if (currentStep === 1) return resume !== null;
    if (currentStep === 2) return job !== null;
    if (currentStep === 3) return photoData !== null;
    if (currentStep === 4) return customization !== null;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="container max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Resume Customizer</h1>
          <p className="text-lg text-gray-600">
            Optimize your resume for any job with AI-powered customization
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2 mb-4" />
          <div className="flex justify-between">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex-1 text-center ${
                  step.id === currentStep
                    ? 'text-blue-600 font-semibold'
                    : step.id < currentStep
                    ? 'text-green-600'
                    : 'text-gray-400'
                }`}
              >
                <div className="text-sm">{step.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1]?.title}</CardTitle>
            <CardDescription>{STEPS[currentStep - 1]?.description}</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[400px]">
            {currentStep === 1 && <UploadStep onComplete={setResume} />}
            {currentStep === 2 && <JobDescriptionStep onComplete={setJob} />}
            {currentStep === 3 && (
              <PhotoUploadStep
                onComplete={(includePhoto, photoUrl, photoKey) =>
                  setPhotoData({ includePhoto, photoUrl, photoKey })
                }
              />
            )}
            {currentStep === 4 && resume && job && photoData && (
              <MatchAnalysisStep
                resume={resume}
                job={job}
                photoData={photoData}
                onComplete={setCustomization}
              />
            )}
            {currentStep === 5 && customization && (
              <ResumePreviewStep customization={customization} />
            )}
            {currentStep === 6 && customization && <DownloadStep customization={customization} />}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canGoNext() || currentStep === STEPS.length}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
