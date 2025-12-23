import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import type { Resume, JobDescription, Customization } from '../../../../drizzle/schema';

interface MatchAnalysisStepProps {
  resume: Resume;
  job: JobDescription;
  photoData: { includePhoto: boolean; photoUrl?: string; photoKey?: string };
  templateId: string;
  onComplete: (customization: Customization) => void;
}

export default function MatchAnalysisStep({ resume, job, photoData, templateId, onComplete }: MatchAnalysisStepProps) {
  const [customization, setCustomization] = useState<Customization | null>(null);
  const [generating, setGenerating] = useState(false);

  const createCustomizationMutation = trpc.customization.create.useMutation({
    onSuccess: (result) => {
      setCustomization(result);
      onComplete(result);
      toast.success('Resume customized successfully!');
      setGenerating(false);
    },
    onError: (error) => {
      toast.error(`Customization failed: ${error.message}`);
      setGenerating(false);
    },
  });

  useEffect(() => {
    // Auto-start customization when component mounts
    if (!customization && !generating) {
      setGenerating(true);
      createCustomizationMutation.mutate({
        resumeId: resume.id,
        jobId: job.id,
        templateId,
        includePhoto: photoData.includePhoto,
        photoUrl: photoData.photoUrl,
        photoKey: photoData.photoKey,
      });
    }
  }, []);

  if (generating || !customization) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <h3 className="text-lg font-semibold mb-2">Analyzing Your Match...</h3>
        <p className="text-gray-600 text-center max-w-md">
          Our AI is comparing your resume with the job requirements, calculating match scores, and
          preparing customizations.
        </p>
      </div>
    );
  }

  const matchScore = customization.matchScore;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Overall Match Score */}
      <Card className={`${getScoreBgColor(matchScore.overallMatch)} border-2`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold">Overall Match</h3>
            <div className={`text-5xl font-bold ${getScoreColor(matchScore.overallMatch)}`}>
              {matchScore.overallMatch}%
            </div>
          </div>
          <Progress value={matchScore.overallMatch} className="h-3" />
        </div>
      </Card>

      {/* Detailed Scores */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="p-4 text-center">
            <p className="text-sm text-gray-600 mb-2">Skill Overlap</p>
            <p className={`text-3xl font-bold ${getScoreColor(matchScore.skillOverlap)}`}>
              {matchScore.skillOverlap}%
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <p className="text-sm text-gray-600 mb-2">Experience Relevance</p>
            <p className={`text-3xl font-bold ${getScoreColor(matchScore.experienceRelevance)}`}>
              {matchScore.experienceRelevance}%
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <p className="text-sm text-gray-600 mb-2">Keyword Alignment</p>
            <p className={`text-3xl font-bold ${getScoreColor(matchScore.keywordAlignment)}`}>
              {matchScore.keywordAlignment}%
            </p>
          </div>
        </Card>
      </div>

      {/* Strengths */}
      {matchScore.strengths.length > 0 && (
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold">Your Strengths</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {matchScore.strengths.map((strength, index) => (
                <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                  {strength}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Skill Gaps */}
      {matchScore.gaps.length > 0 && (
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold">Skill Gaps</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {matchScore.gaps.map((gap, index) => (
                <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800">
                  {gap}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Note: These skills are not in your resume and will NOT be added to maintain
              truthfulness.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
