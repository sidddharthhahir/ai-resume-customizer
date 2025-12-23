import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import type { JobDescription } from '../../../../drizzle/schema';

interface JobDescriptionStepProps {
  onComplete: (job: JobDescription) => void;
}

export default function JobDescriptionStep({ onComplete }: JobDescriptionStepProps) {
  const [description, setDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [roleName, setRoleName] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const createJobMutation = trpc.job.create.useMutation({
    onSuccess: (job) => {
      onComplete(job);
      toast.success('Job description analyzed successfully!');
      setAnalyzing(false);
    },
    onError: (error) => {
      toast.error(`Analysis failed: ${error.message}`);
      setAnalyzing(false);
    },
  });

  const handleAnalyze = () => {
    if (!description.trim()) {
      toast.error('Please enter a job description');
      return;
    }

    setAnalyzing(true);
    createJobMutation.mutate({
      description: description.trim(),
      companyName: companyName.trim() || undefined,
      roleName: roleName.trim() || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="company">Company Name (Optional)</Label>
            <Input
              id="company"
              placeholder="e.g., Google"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={analyzing}
            />
          </div>
          <div>
            <Label htmlFor="role">Role Name (Optional)</Label>
            <Input
              id="role"
              placeholder="e.g., Senior Software Engineer"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              disabled={analyzing}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Job Description</Label>
          <Textarea
            id="description"
            placeholder="Paste the full job description here..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={analyzing}
            rows={15}
            className="font-mono text-sm"
          />
          <p className="text-sm text-gray-500 mt-2">
            Include requirements, responsibilities, and qualifications for best results
          </p>
        </div>
      </div>

      <Button
        onClick={handleAnalyze}
        disabled={!description.trim() || analyzing}
        className="w-full"
        size="lg"
      >
        {analyzing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing Job Description...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Analyze with AI
          </>
        )}
      </Button>
    </div>
  );
}
