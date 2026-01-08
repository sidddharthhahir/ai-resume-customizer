import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import BatchOptimizer from '@/components/BatchOptimizer';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';

export default function BatchPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  // Get user's resumes
  const { data: resumes, isLoading } = trpc.resume.list.useQuery();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4">Please log in</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to use batch optimization.</p>
          <Button onClick={() => navigate('/')} className="w-full">
            Go to Home
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!resumes || resumes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">No Resumes Found</h1>
            <p className="text-gray-600 mb-6">
              You need to upload a resume first before using batch optimization.
            </p>
            <Button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700">
              Upload Resume
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Batch Optimization</h1>
          <p className="text-lg text-gray-600">
            Customize your resume for multiple jobs at once and compare results side-by-side
          </p>
        </div>

        {/* Resume Selection */}
        <Card className="p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Select Resume</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <div className="font-semibold text-gray-900">{resume.originalFileName}</div>
                <div className="text-sm text-gray-500 mt-1">
                  Uploaded: {new Date(resume.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Batch Optimizer */}
        {resumes.length > 0 && (
          <BatchOptimizer resumeId={resumes[0].id} templateId="classic" />
        )}
      </div>
    </div>
  );
}
