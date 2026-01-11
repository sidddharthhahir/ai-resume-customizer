import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, Trash2, Edit2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import ApplicationStatusDialog from './ApplicationStatusDialog';

interface Application {
  id: number;
  companyName: string;
  roleName: string;
  status: string;
  appliedDate: Date;
  matchScore: number | null;
  atsScore: number | null;
  notes: string | null;
}

interface ApplicationListProps {
  applications: Application[];
  onUpdated: () => void;
}

export default function ApplicationList({ applications, onUpdated }: ApplicationListProps) {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const deleteMutation = trpc.application.delete.useMutation({
    onSuccess: () => {
      toast.success('Application deleted');
      onUpdated();
    },
    onError: () => {
      toast.error('Failed to delete application');
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'offer':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'interview':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'offer':
        return 'bg-green-100 text-green-800';
      case 'interview':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <>
      <div className="space-y-4">
        {applications.map((app) => (
          <Card key={app.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(app.status)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{app.companyName}</h3>
                    <p className="text-sm text-gray-600">{app.roleName}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge className={getStatusColor(app.status)}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </Badge>
                  {app.matchScore !== null && (
                    <Badge variant="outline">Match: {app.matchScore}%</Badge>
                  )}
                  {app.atsScore !== null && (
                    <Badge variant="outline">ATS: {app.atsScore}</Badge>
                  )}
                </div>

                {app.notes && (
                  <p className="text-sm text-gray-600 mt-3 italic">{app.notes}</p>
                )}

                <p className="text-xs text-gray-500 mt-3">
                  Applied: {new Date(app.appliedDate).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedApp(app);
                    setShowDialog(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Update
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this application?')) {
                      deleteMutation.mutate({ applicationId: app.id });
                    }
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedApp && (
        <ApplicationStatusDialog
          application={selectedApp}
          open={showDialog}
          onOpenChange={setShowDialog}
          onSuccess={() => {
            setShowDialog(false);
            onUpdated();
          }}
        />
      )}
    </>
  );
}
