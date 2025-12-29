import { AlertCircle, CheckCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export interface ATSAnalysisResult {
  atsScore: number;
  keywordAnalysis: {
    matched: string[];
    missing: string[];
    weak: string[];
  };
  formattingWarnings: string[];
  suggestions: Array<{
    original: string;
    suggestion: string;
    reason: string;
  }>;
  riskLevel: 'low' | 'medium' | 'high';
}

interface ATSPanelProps {
  analysis: ATSAnalysisResult;
  isLoading?: boolean;
}

export function ATSPanel({ analysis, isLoading }: ATSPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['keywords'])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 70) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getRiskIcon = (risk: string) => {
    if (risk === 'low') return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (risk === 'medium') return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <AlertCircle className="w-5 h-5 text-red-600" />;
  };

  if (isLoading) {
    return (
      <Card className="p-6 bg-slate-50">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-slate-600">Analyzing ATS compatibility...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 border-2 ${getScoreBgColor(analysis.atsScore)}`}>
      {/* ATS Score Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <div className={`text-4xl font-bold ${getScoreColor(analysis.atsScore)}`}>
              {analysis.atsScore}
            </div>
            <div className="text-sm text-slate-600">ATS Score</div>
          </div>
          <div className="flex items-center gap-2">
            {getRiskIcon(analysis.riskLevel)}
            <div>
              <div className="font-semibold text-slate-900 capitalize">
                {analysis.riskLevel} Risk
              </div>
              <div className="text-xs text-slate-600">
                {analysis.riskLevel === 'low'
                  ? 'Excellent ATS compatibility'
                  : analysis.riskLevel === 'medium'
                  ? 'Good compatibility with minor improvements'
                  : 'Needs optimization for ATS'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keyword Analysis Section */}
      <div className="mb-4 border rounded-lg">
        <button
          onClick={() => toggleSection('keywords')}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <div className="text-left">
              <div className="font-semibold text-slate-900">Keyword Analysis</div>
              <div className="text-sm text-slate-600">
                {analysis.keywordAnalysis.matched.length} matched •{' '}
                {analysis.keywordAnalysis.missing.length} missing
              </div>
            </div>
          </div>
          {expandedSections.has('keywords') ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>

        {expandedSections.has('keywords') && (
          <div className="border-t p-4 space-y-4 bg-white">
            {/* Matched Keywords */}
            {analysis.keywordAnalysis.matched.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-green-700 mb-2">
                  ✓ Matched Keywords ({analysis.keywordAnalysis.matched.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywordAnalysis.matched.map((keyword) => (
                    <span
                      key={keyword}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Weak Keywords */}
            {analysis.keywordAnalysis.weak.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-yellow-700 mb-2">
                  ⚠ Weakly Represented ({analysis.keywordAnalysis.weak.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywordAnalysis.weak.map((keyword) => (
                    <span
                      key={keyword}
                      className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Keywords */}
            {analysis.keywordAnalysis.missing.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-red-700 mb-2">
                  ✗ Missing Keywords ({analysis.keywordAnalysis.missing.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywordAnalysis.missing.slice(0, 10).map((keyword) => (
                    <span
                      key={keyword}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                  {analysis.keywordAnalysis.missing.length > 10 && (
                    <span className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-sm">
                      +{analysis.keywordAnalysis.missing.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Formatting Warnings Section */}
      {analysis.formattingWarnings.length > 0 && (
        <div className="mb-4 border rounded-lg">
          <button
            onClick={() => toggleSection('warnings')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div className="text-left">
                <div className="font-semibold text-slate-900">Formatting Warnings</div>
                <div className="text-sm text-slate-600">
                  {analysis.formattingWarnings.length} issues found
                </div>
              </div>
            </div>
            {expandedSections.has('warnings') ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>

          {expandedSections.has('warnings') && (
            <div className="border-t p-4 space-y-3 bg-white">
              {analysis.formattingWarnings.map((warning, idx) => (
                <div key={idx} className="flex gap-3">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-700">{warning}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Suggestions Section */}
      {analysis.suggestions.length > 0 && (
        <div className="mb-4 border rounded-lg">
          <button
            onClick={() => toggleSection('suggestions')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <div className="font-semibold text-slate-900">Optimization Suggestions</div>
                <div className="text-sm text-slate-600">
                  {analysis.suggestions.length} wording improvements
                </div>
              </div>
            </div>
            {expandedSections.has('suggestions') ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>

          {expandedSections.has('suggestions') && (
            <div className="border-t p-4 space-y-4 bg-white">
              {analysis.suggestions.slice(0, 5).map((suggestion, idx) => (
                <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-xs font-semibold text-blue-900 mb-2">
                    Suggestion {idx + 1}
                  </div>
                  <div className="mb-2">
                    <div className="text-xs text-slate-600 mb-1">Original:</div>
                    <div className="text-sm text-slate-700 italic">
                      "{suggestion.original}"
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="text-xs text-slate-600 mb-1">Improved:</div>
                    <div className="text-sm font-medium text-slate-900">
                      "{suggestion.suggestion}"
                    </div>
                  </div>
                  <div className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded inline-block">
                    {suggestion.reason}
                  </div>
                </div>
              ))}
              {analysis.suggestions.length > 5 && (
                <div className="text-sm text-slate-600 p-3 bg-slate-50 rounded">
                  +{analysis.suggestions.length - 5} more suggestions available
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6 pt-4 border-t">
        <Button variant="outline" className="flex-1">
          Download ATS Report
        </Button>
        {analysis.atsScore < 80 && (
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
            Optimize Wording
          </Button>
        )}
      </div>
    </Card>
  );
}
