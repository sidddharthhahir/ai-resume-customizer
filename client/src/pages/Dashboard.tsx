import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Trash2, FileText, Calendar, Target, Zap } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import type { Customization } from '../../../drizzle/schema';

export default function Dashboard() {
  const [selectedCustomization, setSelectedCustomization] = useState<Customization | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const customizationsQuery = trpc.customization.list.useQuery();
  const deleteCustomizationMutation = trpc.customization.delete.useMutation({
    onSuccess: () => {
      toast.success('Customization deleted');
      customizationsQuery.refetch();
    },
    onError: () => {
      toast.error('Failed to delete customization');
    },
  });

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this customization?')) {
      deleteCustomizationMutation.mutate({ id });
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (customizationsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
        <div className="container max-w-6xl">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading your customizations...</p>
          </div>
        </div>
      </div>
    );
  }

  const customizations = customizationsQuery.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Customizations</h1>
          <p className="text-gray-600">View and manage all your resume customizations and cover letters</p>
        </div>

        {/* Empty State */}
        {customizations.length === 0 ? (
          <Card className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No customizations yet</h3>
            <p className="text-gray-600 mb-6">
              Start by uploading your resume and selecting a job description to create your first customization.
            </p>
            <Button asChild>
              <a href="/">Create New Customization</a>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {customizations.map((customization) => (
              <Card key={customization.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">
                        {customization.jobId ? `Resume for Job ${customization.jobId}` : 'Customization'}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(customization.createdAt)}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge
                        variant="outline"
                        className={`${getMatchScoreColor(
                          (customization.matchScore as any)?.overallScore || 0
                        )}`}
                      >
                        <Target className="w-3 h-3 mr-1" />
                        {Math.round((customization.matchScore as any)?.overallScore || 0)}% Match
                      </Badge>
                      <Badge variant="secondary">
                        <Zap className="w-3 h-3 mr-1" />
                        {customization.templateId || 'classic'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Match Score Details */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Skill Overlap</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(customization.matchScore as any)?.skillOverlap || 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold">
                          {Math.round((customization.matchScore as any)?.skillOverlap || 0)}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Experience Relevance</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${(customization.matchScore as any)?.experienceRelevance || 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold">
                          {Math.round((customization.matchScore as any)?.experienceRelevance || 0)}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Keyword Alignment</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{
                              width: `${(customization.matchScore as any)?.keywordAlignment || 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold">
                          {Math.round((customization.matchScore as any)?.keywordAlignment || 0)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCustomization(customization);
                        setShowDetails(true);
                      }}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Details
                    </Button>

                    {customization.resumePdfUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={customization.resumePdfUrl} download>
                          <Download className="w-4 h-4 mr-2" />
                          Resume PDF
                        </a>
                      </Button>
                    )}

                    {customization.coverLetterPdfUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={customization.coverLetterPdfUrl} download>
                          <Download className="w-4 h-4 mr-2" />
                          Cover Letter
                        </a>
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto"
                      onClick={() => handleDelete(customization.id)}
                      disabled={deleteCustomizationMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customization Details</DialogTitle>
            <DialogDescription>Review the details of this customization</DialogDescription>
          </DialogHeader>

          {selectedCustomization && (
            <div className="space-y-4">
              {/* Match Score */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Match Score Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Overall Match:</span>
                    <span className="font-semibold">
                      {Math.round((selectedCustomization.matchScore as any)?.overallScore || 0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Skill Overlap:</span>
                    <span className="font-semibold">
                      {Math.round((selectedCustomization.matchScore as any)?.skillOverlap || 0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Experience Relevance:</span>
                    <span className="font-semibold">
                      {Math.round((selectedCustomization.matchScore as any)?.experienceRelevance || 0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Keyword Alignment:</span>
                    <span className="font-semibold">
                      {Math.round((selectedCustomization.matchScore as any)?.keywordAlignment || 0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Explanation */}
              {selectedCustomization.explanation && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Why These Changes?</h4>
                  <div className="space-y-2 text-sm text-green-800">
                    {(selectedCustomization.explanation as any)?.skillEmphasis && (
                      <div>
                        <p className="font-medium">Skills Emphasized:</p>
                        <ul className="list-disc list-inside">
                          {(selectedCustomization.explanation as any).skillEmphasis.map(
                            (skill: string, idx: number) => (
                              <li key={idx}>{skill}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Download Options */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Download Files</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedCustomization.resumePdfUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={selectedCustomization.resumePdfUrl} download>
                        <Download className="w-4 h-4 mr-2" />
                        Resume PDF
                      </a>
                    </Button>
                  )}
                  {selectedCustomization.resumeDocxUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={selectedCustomization.resumeDocxUrl} download>
                        <Download className="w-4 h-4 mr-2" />
                        Resume DOCX
                      </a>
                    </Button>
                  )}
                  {selectedCustomization.coverLetterPdfUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={selectedCustomization.coverLetterPdfUrl} download>
                        <Download className="w-4 h-4 mr-2" />
                        Letter PDF
                      </a>
                    </Button>
                  )}
                  {selectedCustomization.coverLetterDocxUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={selectedCustomization.coverLetterDocxUrl} download>
                        <Download className="w-4 h-4 mr-2" />
                        Letter DOCX
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
