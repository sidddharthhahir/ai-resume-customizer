import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface ApplicationFormProps {
  customizationId?: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ApplicationForm({ customizationId, onSuccess, onCancel }: ApplicationFormProps) {
  const [formData, setFormData] = useState({
    customizationId: customizationId || 0,
    companyName: '',
    roleName: '',
    notes: '',
  });

  const createMutation = trpc.application.create.useMutation({
    onSuccess: () => {
      toast.success('Application logged successfully!');
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to log application');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName.trim() || !formData.roleName.trim()) {
      toast.error('Please fill in company and role name');
      return;
    }

    createMutation.mutate({
      customizationId: formData.customizationId,
      companyName: formData.companyName,
      roleName: formData.roleName,
      notes: formData.notes || undefined,
    });
  };

  return (
    <Card className="p-6 border-2 border-blue-200">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Log New Application</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name *
            </label>
            <Input
              placeholder="e.g., Google, Microsoft"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role Name *
            </label>
            <Input
              placeholder="e.g., Senior Engineer"
              value={formData.roleName}
              onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <Textarea
            placeholder="Add any notes about this application..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {createMutation.isPending ? 'Logging...' : 'Log Application'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
