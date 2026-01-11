import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface Application {
  id: number;
  status: string;
  notes: string | null;
}

interface ApplicationStatusDialogProps {
  application: Application;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function ApplicationStatusDialog({
  application,
  open,
  onOpenChange,
  onSuccess,
}: ApplicationStatusDialogProps) {
  const [status, setStatus] = useState(application.status);
  const [notes, setNotes] = useState(application.notes || '');
  const [outcome, setOutcome] = useState('');

  const updateMutation = trpc.application.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('Application updated');
      onSuccess();
    },
    onError: () => {
      toast.error('Failed to update application');
    },
  });

  const handleSubmit = () => {
    updateMutation.mutate({
      applicationId: application.id,
      status: status as any,
      notes: notes || undefined,
      outcome: outcome || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Application Status</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <Textarea
              placeholder="Add notes about this application..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {status === 'interview' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interview Date
              </label>
              <Input
                type="date"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
              />
            </div>
          )}

          {(status === 'offer' || status === 'rejected') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Outcome Details
              </label>
              <Textarea
                placeholder="Add details about the outcome..."
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {updateMutation.isPending ? 'Updating...' : 'Update'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
