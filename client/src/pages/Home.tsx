import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import ResumeWizard from "@/components/ResumeWizard";
import { Loader2, LogOut, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.reload();
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center max-w-2xl px-4">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">AI Resume Customizer</h1>
          <p className="text-xl text-gray-600 mb-8">
            Optimize your resume for any job with AI-powered customization while maintaining complete truthfulness
          </p>
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-center gap-3 text-gray-700">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span>AI-powered resume parsing and analysis</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-gray-700">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span>Job-specific resume customization</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-gray-700">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span>Professional cover letter generation</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-gray-700">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span>Download in PDF and DOCX formats</span>
            </div>
          </div>
          <Button asChild size="lg" className="text-lg px-8">
            <a href={getLoginUrl()}>Get Started</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header buttons */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/batch')}
          className="flex items-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Batch Optimize
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="flex items-center gap-2"
        >
          {logoutMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          Logout
        </Button>
      </div>

      <ResumeWizard />
    </div>
  );
}
