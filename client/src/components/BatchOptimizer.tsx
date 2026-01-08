import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, Zap, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface BatchJob {
  id: string;
  companyName: string;
  roleName: string;
  description: string;
}

interface BatchOptimzerProps {
  resumeId: number;
  templateId?: string;
}

export default function BatchOptimizer({ resumeId, templateId = 'classic' }: BatchOptimzerProps) {
  const [jobs, setJobs] = useState<BatchJob[]>([
    {
      id: '1',
      companyName: '',
      roleName: '',
      description: '',
    },
  ]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const batchOptimizeMutation = trpc.customization.batchOptimize.useMutation();

  const addJob = () => {
    const newId = Math.max(...jobs.map((j) => parseInt(j.id)), 0) + 1;
    setJobs([
      ...jobs,
      {
        id: newId.toString(),
        companyName: '',
        roleName: '',
        description: '',
      },
    ]);
  };

  const removeJob = (id: string) => {
    if (jobs.length > 1) {
      setJobs(jobs.filter((j) => j.id !== id));
    } else {
      toast.error('You must have at least one job description');
    }
  };

  const updateJob = (id: string, field: keyof BatchJob, value: string) => {
    setJobs(
      jobs.map((j) =>
        j.id === id
          ? { ...j, [field]: value }
          : j
      )
    );
  };

  const handleProcessBatch = async () => {
    // Validate all jobs have required fields
    const allValid = jobs.every(
      (j) => j.companyName.trim() && j.roleName.trim() && j.description.trim()
    );

    if (!allValid) {
      toast.error('Please fill in all fields for each job');
      return;
    }

    try {
      setIsProcessing(true);
      const response = await batchOptimizeMutation.mutateAsync({
        resumeId,
        jobs,
        templateId,
      });
      setResults(response);
      toast.success(`Successfully optimized for ${jobs.length} job descriptions`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process batch';
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (results) {
    return <BatchComparisonView results={results} onReset={() => setResults(null)} />;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Batch Optimization</h2>
            <p className="text-sm text-gray-600">
              Customize your resume for multiple jobs at once and compare results
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {jobs.map((job, index) => (
          <Card key={job.id} className="p-6 border-2 border-gray-200 hover:border-blue-300 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Job #{index + 1}</h3>
              {jobs.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeJob(job.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <Input
                  placeholder="e.g., Google, Microsoft, Startup Inc"
                  value={job.companyName}
                  onChange={(e) => updateJob(job.id, 'companyName', e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Name
                </label>
                <Input
                  placeholder="e.g., Senior Engineer, Product Manager"
                  value={job.roleName}
                  onChange={(e) => updateJob(job.id, 'roleName', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description
              </label>
              <Textarea
                placeholder="Paste the full job description here..."
                value={job.description}
                onChange={(e) => updateJob(job.id, 'description', e.target.value)}
                rows={6}
                className="w-full font-mono text-sm"
              />
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={addJob}
          className="flex-1"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Another Job
        </Button>
        <Button
          onClick={handleProcessBatch}
          disabled={isProcessing}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Processing...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Optimize All ({jobs.length})
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

interface BatchComparisonViewProps {
  results: any;
  onReset: () => void;
}

function BatchComparisonView({ results, onReset }: BatchComparisonViewProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Batch Results</h2>
              <p className="text-sm text-gray-600">
                Optimized {results.results.length} resumes with comparison metrics
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={onReset}>
            Start Over
          </Button>
        </div>
      </Card>

      {/* Comparison Summary */}
      {results.comparison && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Summary Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">
                {results.comparison.totalJobs}
              </div>
              <div className="text-sm text-gray-600">Total Jobs</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                {results.comparison.averageMatchScore.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Avg Match Score</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">
                {results.comparison.averageAtsScore.toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">Avg ATS Score</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">
                {(results.comparison.scoreRange.max - results.comparison.scoreRange.min).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">Score Range</div>
            </div>
          </div>
        </Card>
      )}

      {/* Results Table */}
      <Card className="p-6 overflow-x-auto">
        <h3 className="font-semibold text-lg mb-4">Detailed Results</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-3 font-semibold">Company</th>
              <th className="text-left py-2 px-3 font-semibold">Role</th>
              <th className="text-center py-2 px-3 font-semibold">Match %</th>
              <th className="text-center py-2 px-3 font-semibold">ATS Score</th>
              <th className="text-center py-2 px-3 font-semibold">Keywords</th>
            </tr>
          </thead>
          <tbody>
            {results.results.map((result: any, idx: number) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="py-3 px-3 font-medium">{result.companyName}</td>
                <td className="py-3 px-3">{result.roleName}</td>
                <td className="py-3 px-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    result.matchScore >= 80 ? 'bg-green-100 text-green-800' :
                    result.matchScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {result.matchScore.toFixed(0)}%
                  </span>
                </td>
                <td className="py-3 px-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    result.atsScore >= 80 ? 'bg-green-100 text-green-800' :
                    result.atsScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {result.atsScore}
                  </span>
                </td>
                <td className="py-3 px-3 text-center text-xs">
                  {result.keywords.matched.length} matched
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Common Keywords */}
      {results.commonKeywords && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Universal Keywords</h3>
          <p className="text-sm text-gray-600 mb-3">
            Keywords that appear in all job descriptions
          </p>
          <div className="flex flex-wrap gap-2">
            {results.commonKeywords.universal.length > 0 ? (
              results.commonKeywords.universal.map((keyword: string) => (
                <span
                  key={keyword}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                >
                  {keyword}
                </span>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No universal keywords found</p>
            )}
          </div>
        </Card>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onReset} className="flex-1">
          Optimize Different Jobs
        </Button>
        <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
          Download All Results
        </Button>
      </div>
    </div>
  );
}
