import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import UploadStep from './wizard/UploadStep';
import JobDescriptionStep from './wizard/JobDescriptionStep';
import PhotoUploadStep from './wizard/PhotoUploadStep';
import TemplateSelectionStep from './wizard/TemplateSelectionStep';
import MatchAnalysisStep from './wizard/MatchAnalysisStep';
import ResumePreviewStep from './wizard/ResumePreviewStep';
import DownloadStep from './wizard/DownloadStep';
import type { Resume, JobDescription, Customization } from '../../../drizzle/schema';
import type { TemplateType } from '../../../shared/templates';

const STEPS = [
  { id: 1, title: 'Upload Resume', description: 'Upload your resume (PDF or DOCX)' },
  { id: 2, title: 'Job Description', description: 'Paste the job description' },
  { id: 3, title: 'Profile Photo', description: 'Optional: Add a profile photo' },
  { id: 4, title: 'Resume Template', description: 'Choose your resume template' },
  { id: 5, title: 'Match Analysis', description: 'Review your match score and gaps' },
  { id: 6, title: 'Customized Resume', description: 'Preview optimized resume' },
  { id: 7, title: 'Download', description: 'Download your files' },
];

export default function ResumeWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [resume, setResume] = useState<Resume | null>(null);
  const [job, setJob] = useState<JobDescription | null>(null);
  const [photoData, setPhotoData] = useState<{ includePhoto: boolean; photoUrl?: string; photoKey?: string } | null>(null);
  const [templateId, setTemplateId] = useState<TemplateType | null>(null);
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
    if (currentStep === 4) return templateId !== null;
    if (currentStep === 5) return customization !== null;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-4 md:py-8">
      <div className="container max-w-5xl px-4 md:px-6">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-2">AI Resume Customizer</h1>
          <p className="text-sm md:text-lg text-gray-600">
            Optimize your resume for any job with AI-powered customization
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 md:mb-8">
          <Progress value={progress} className="h-2 mb-3 md:mb-4" />
          <div className="flex justify-between gap-1 md:gap-2 overflow-x-auto pb-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex-shrink-0 text-center ${
                  step.id === currentStep
                    ? 'text-blue-600 font-semibold'
                    : step.id < currentStep
                    ? 'text-green-600'
                    : 'text-gray-400'
                }`}
              >
                <div className="text-xs md:text-sm whitespace-nowrap">{step.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="text-xl md:text-2xl">{STEPS[currentStep - 1]?.title}</CardTitle>
            <CardDescription className="text-xs md:text-sm">{STEPS[currentStep - 1]?.description}</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[300px] md:min-h-[400px] px-3 md:px-6">
            {currentStep === 1 && <UploadStep onComplete={setResume} />}
            {currentStep === 2 && <JobDescriptionStep onComplete={setJob} />}
            {currentStep === 3 && (
              <PhotoUploadStep
                onComplete={(includePhoto, photoUrl, photoKey) =>
                  setPhotoData({ includePhoto, photoUrl, photoKey })
                }
              />
            )}
            {currentStep === 4 && <TemplateSelectionStep onComplete={setTemplateId} />}
            {currentStep === 5 && resume && job && photoData && templateId && (
              <MatchAnalysisStep
                resume={resume}
                job={job}
                photoData={photoData}
                templateId={templateId}
                onComplete={setCustomization}
              />
            )}
            {currentStep === 6 && customization && (
              <ResumePreviewStep customization={customization} />
            )}
            {currentStep === 7 && customization && <DownloadStep customization={customization} />}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between gap-2 md:gap-4 mt-4 md:mt-6 px-4 md:px-0">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-4 py-2 md:py-2 h-9 md:h-10"
          >
            <ChevronLeft className="w-3 md:w-4 h-3 md:h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="flex-1 flex items-center justify-center text-xs md:text-sm text-gray-600">
            Step {currentStep} of {STEPS.length}
          </div>
          <Button
            onClick={handleNext}
            disabled={!canGoNext() || currentStep === STEPS.length}
            className="flex items-center gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-4 py-2 md:py-2 h-9 md:h-10"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-3 md:w-4 h-3 md:h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
