import { ATSPanel, type ATSAnalysisResult } from './ATSPanel';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface ATSScannerProps {
  customizationId: number;
}

export default function ATSScanner({ customizationId }: ATSScannerProps) {
  // Use tRPC query hook to fetch ATS analysis
  const { data: analysis, isLoading, error } = trpc.customization.analyzeATS.useQuery({
    customizationId,
  });

  if (error) {
    const message = error.message || 'Failed to analyze ATS compatibility';
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="font-semibold text-red-900 mb-2">ATS Analysis Error</h3>
        <p className="text-sm text-red-700">{message}</p>
      </div>
    );
  }

  if (!analysis) {
    return <ATSPanel analysis={{} as ATSAnalysisResult} isLoading={isLoading} />;
  }

  return <ATSPanel analysis={analysis} isLoading={isLoading} />;
}
