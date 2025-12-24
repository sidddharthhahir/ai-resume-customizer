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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-4 md:py-8">
        <div className="container max-w-6xl px-4 md:px-6">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading your customizations...</p>
          </div>
        </div>
      </div>
    );
  }

  const customizations = customizationsQuery.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-4 md:py-8">
      <div className="container max-w-6xl px-4 md:px-6">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-2">My Customizations</h1>
          <p className="text-sm md:text-base text-gray-600">View and manage all your resume customizations and cover letters</p>
        </div>

        {/* Empty State */}
        {customizations.length === 0 ? (
          <Card className="text-center py-8 md:py-12 px-4 md:px-6">
            <FileText className="w-12 md:w-16 h-12 md:h-16 mx-auto text-gray-300 mb-3 md:mb-4" />
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">No customizations yet</h3>
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
              Start by uploading your resume and selecting a job description to create your first customization.
            </p>
            <Button asChild>
              <a href="/">Create New Customization</a>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-3 md:gap-4">
            {customizations.map((customization) => (
              <Card key={customization.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2 md:pb-3">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg md:text-xl truncate">
                        {customization.jobId ? `Resume for Job ${customization.jobId}` : 'Customization'}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1 text-xs md:text-sm">
                        <Calendar className="w-3 md:w-4 h-3 md:h-4 flex-shrink-0" />
                        <span className="truncate">{formatDate(customization.createdAt)}</span>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={`text-xs md:text-sm ${getMatchScoreColor(
                          (customization.matchScore as any)?.overallScore || 0
                        )}`}
                      >
                        <Target className="w-2 md:w-3 h-2 md:h-3 mr-1" />
                        {Math.round((customization.matchScore as any)?.overallScore || 0)}%
                      </Badge>
                      <Badge variant="secondary" className="text-xs md:text-sm">
                        <Zap className="w-2 md:w-3 h-2 md:h-3 mr-1" />
                        {customization.templateId || 'classic'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-3 md:px-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-3 md:mb-4">
                    {/* Match Score Details */}
                    <div className="space-y-2">
                      <p className="text-xs md:text-sm font-medium text-gray-700">Skill Overlap</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(customization.matchScore as any)?.skillOverlap || 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs md:text-sm font-semibold">
                          {Math.round((customization.matchScore as any)?.skillOverlap || 0)}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs md:text-sm font-medium text-gray-700">Experience Relevance</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${(customization.matchScore as any)?.experienceRelevance || 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs md:text-sm font-semibold">
                          {Math.round((customization.matchScore as any)?.experienceRelevance || 0)}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs md:text-sm font-medium text-gray-700">Keyword Alignment</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{
                              width: `${(customization.matchScore as any)?.keywordAlignment || 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs md:text-sm font-semibold">
                          {Math.round((customization.matchScore as any)?.keywordAlignment || 0)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-3 md:pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCustomization(customization);
                        setShowDetails(true);
                      }}
                      className="text-xs md:text-sm px-2 md:px-3 py-1 md:py-2 h-8 md:h-9"
                    >
                      <FileText className="w-3 md:w-4 h-3 md:h-4 mr-1" />
                      <span className="hidden sm:inline">View</span>
                    </Button>

                    {customization.resumePdfUrl && (
                      <Button variant="outline" size="sm" asChild className="text-xs md:text-sm px-2 md:px-3 py-1 md:py-2 h-8 md:h-9">
                        <a href={customization.resumePdfUrl} download>
                          <Download className="w-3 md:w-4 h-3 md:h-4 mr-1" />
                          <span className="hidden sm:inline">PDF</span>
                        </a>
                      </Button>
                    )}

                    {customization.coverLetterPdfUrl && (
                      <Button variant="outline" size="sm" asChild className="text-xs md:text-sm px-2 md:px-3 py-1 md:py-2 h-8 md:h-9">
                        <a href={customization.coverLetterPdfUrl} download>
                          <Download className="w-3 md:w-4 h-3 md:h-4 mr-1" />
                          <span className="hidden sm:inline">Letter</span>
                        </a>
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto text-xs md:text-sm px-2 md:px-3 py-1 md:py-2 h-8 md:h-9"
                      onClick={() => handleDelete(customization.id)}
                      disabled={deleteCustomizationMutation.isPending}
                    >
                      <Trash2 className="w-3 md:w-4 h-3 md:h-4" />
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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto px-4 md:px-6">
          <DialogHeader>
            <DialogTitle>Customization Details</DialogTitle>
            <DialogDescription>Review the details of this customization</DialogDescription>
          </DialogHeader>

          {selectedCustomization && (
            <div className="space-y-4">
              {/* Match Score */}
              <div className="bg-blue-50 p-3 md:p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2 text-sm md:text-base">Match Score Breakdown</h4>
                <div className="space-y-2 text-xs md:text-sm">
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

              {/* Download Options */}
              <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm md:text-base">Download Files</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedCustomization.resumePdfUrl && (
                    <Button variant="outline" size="sm" asChild className="text-xs md:text-sm">
                      <a href={selectedCustomization.resumePdfUrl} download>
                        <Download className="w-3 md:w-4 h-3 md:h-4 mr-1" />
                        Resume PDF
                      </a>
                    </Button>
                  )}
                  {selectedCustomization.resumeDocxUrl && (
                    <Button variant="outline" size="sm" asChild className="text-xs md:text-sm">
                      <a href={selectedCustomization.resumeDocxUrl} download>
                        <Download className="w-3 md:w-4 h-3 md:h-4 mr-1" />
                        Resume DOCX
                      </a>
                    </Button>
                  )}
                  {selectedCustomization.coverLetterPdfUrl && (
                    <Button variant="outline" size="sm" asChild className="text-xs md:text-sm">
                      <a href={selectedCustomization.coverLetterPdfUrl} download>
                        <Download className="w-3 md:w-4 h-3 md:h-4 mr-1" />
                        Letter PDF
                      </a>
                    </Button>
                  )}
                  {selectedCustomization.coverLetterDocxUrl && (
                    <Button variant="outline" size="sm" asChild className="text-xs md:text-sm">
                      <a href={selectedCustomization.coverLetterDocxUrl} download>
                        <Download className="w-3 md:w-4 h-3 md:h-4 mr-1" />
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
