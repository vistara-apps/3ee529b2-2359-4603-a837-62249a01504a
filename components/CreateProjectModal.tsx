'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { CreateProjectData } from '@/lib/types';
import { validateWalletAddress, validateSharePercentages } from '@/lib/utils';
import { Plus, Trash2 } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProjectData) => void;
  isLoading?: boolean;
}

interface ContributorForm {
  walletAddress: string;
  sharePercentage: number;
  role: string;
  name: string;
}

export function CreateProjectModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading = false 
}: CreateProjectModalProps) {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [contributors, setContributors] = useState<ContributorForm[]>([
    { walletAddress: '', sharePercentage: 100, role: 'Creator', name: '' }
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addContributor = () => {
    setContributors([
      ...contributors,
      { walletAddress: '', sharePercentage: 0, role: '', name: '' }
    ]);
  };

  const removeContributor = (index: number) => {
    if (contributors.length > 1) {
      setContributors(contributors.filter((_, i) => i !== index));
    }
  };

  const updateContributor = (index: number, field: keyof ContributorForm, value: string | number) => {
    const updated = [...contributors];
    updated[index] = { ...updated[index], [field]: value };
    setContributors(updated);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    }

    contributors.forEach((contributor, index) => {
      if (!contributor.walletAddress.trim()) {
        newErrors[`contributor-${index}-address`] = 'Wallet address is required';
      } else if (!validateWalletAddress(contributor.walletAddress)) {
        newErrors[`contributor-${index}-address`] = 'Invalid wallet address';
      }

      if (!contributor.role.trim()) {
        newErrors[`contributor-${index}-role`] = 'Role is required';
      }

      if (contributor.sharePercentage <= 0) {
        newErrors[`contributor-${index}-share`] = 'Share percentage must be greater than 0';
      }
    });

    if (!validateSharePercentages(contributors)) {
      newErrors.shares = 'Total share percentages must equal 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const data: CreateProjectData = {
      projectName: projectName.trim(),
      description: description.trim(),
      contributors: contributors.map(c => ({
        walletAddress: c.walletAddress.trim(),
        sharePercentage: c.sharePercentage,
        role: c.role.trim(),
        name: c.name.trim() || undefined,
      })),
    };

    onSubmit(data);
  };

  const totalPercentage = contributors.reduce((sum, c) => sum + c.sharePercentage, 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project">
      <div className="space-y-lg">
        <Input
          label="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Enter project name"
          error={errors.projectName}
        />

        <Textarea
          label="Description (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your project"
          rows={3}
        />

        <div>
          <div className="flex items-center justify-between mb-md">
            <h3 className="text-lg font-semibold text-textPrimary">Contributors</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={addContributor}
              className="flex items-center space-x-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </Button>
          </div>

          <div className="space-y-md">
            {contributors.map((contributor, index) => (
              <div key={index} className="p-md border border-gray-200 rounded-md space-y-sm">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-textPrimary">
                    Contributor {index + 1}
                  </h4>
                  {contributors.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeContributor(index)}
                      className="text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-sm">
                  <Input
                    label="Name (Optional)"
                    value={contributor.name}
                    onChange={(e) => updateContributor(index, 'name', e.target.value)}
                    placeholder="Contributor name"
                  />
                  <Input
                    label="Role"
                    value={contributor.role}
                    onChange={(e) => updateContributor(index, 'role', e.target.value)}
                    placeholder="e.g., Creator, Artist"
                    error={errors[`contributor-${index}-role`]}
                  />
                </div>

                <Input
                  label="Wallet Address"
                  value={contributor.walletAddress}
                  onChange={(e) => updateContributor(index, 'walletAddress', e.target.value)}
                  placeholder="0x..."
                  error={errors[`contributor-${index}-address`]}
                />

                <Input
                  label="Share Percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={contributor.sharePercentage}
                  onChange={(e) => updateContributor(index, 'sharePercentage', parseFloat(e.target.value) || 0)}
                  error={errors[`contributor-${index}-share`]}
                />
              </div>
            ))}
          </div>

          <div className="mt-md p-sm bg-gray-50 rounded-md">
            <p className="text-sm text-textSecondary">
              Total: {totalPercentage.toFixed(2)}% 
              {totalPercentage !== 100 && (
                <span className="text-red-500 ml-xs">
                  (Must equal 100%)
                </span>
              )}
            </p>
          </div>

          {errors.shares && (
            <p className="text-sm text-red-500">{errors.shares}</p>
          )}
        </div>

        <div className="flex space-x-sm">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1"
            disabled={isLoading || totalPercentage !== 100}
          >
            {isLoading ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
