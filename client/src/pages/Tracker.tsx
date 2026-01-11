import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Plus, TrendingUp, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import ApplicationForm from '@/components/ApplicationForm';
import ApplicationList from '@/components/ApplicationList';
import TrackerStats from '@/components/TrackerStats';

export default function TrackerPage() {
  const [, navigate] = useLocation();
  const [showForm, setShowForm] = useState(false);

  const { data: applications, isLoading: appsLoading, refetch: refetchApps } = trpc.application.list.useQuery();
  const { data: stats, isLoading: statsLoading } = trpc.application.stats.useQuery();

  const handleApplicationAdded = () => {
    setShowForm(false);
    refetchApps();
  };

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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Application Tracker</h1>
          <p className="text-lg text-gray-600">
            Monitor your job applications and track outcomes to optimize your strategy
          </p>
        </div>

        {/* Statistics Cards */}
        {!statsLoading && stats && <TrackerStats stats={stats} />}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Application List */}
          <div className="lg:col-span-2">
            {showForm ? (
              <ApplicationForm onSuccess={handleApplicationAdded} onCancel={() => setShowForm(false)} />
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Applications</h2>
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Log Application
                  </Button>
                </div>

                {appsLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : applications && applications.length > 0 ? (
                  <ApplicationList applications={applications} onUpdated={refetchApps} />
                ) : (
                  <Card className="p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Yet</h3>
                    <p className="text-gray-600 mb-6">
                      Start tracking your job applications to see insights about your success rate
                    </p>
                    <Button
                      onClick={() => setShowForm(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Log Your First Application
                    </Button>
                  </Card>
                )}
              </>
            )}
          </div>

          {/* Quick Stats Sidebar */}
          <div className="space-y-4">
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div className="text-sm text-gray-600">Offers</div>
              </div>
              <div className="text-3xl font-bold text-green-600">{stats?.offer || 0}</div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <div className="text-sm text-gray-600">Interviews</div>
              </div>
              <div className="text-3xl font-bold text-blue-600">{stats?.interview || 0}</div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
              <div className="flex items-center gap-3 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <div className="text-sm text-gray-600">Rejected</div>
              </div>
              <div className="text-3xl font-bold text-red-600">{stats?.rejected || 0}</div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
              <div className="text-3xl font-bold text-purple-600">{stats?.successRate || 0}%</div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
