'use client';

import { Contributor } from '@/lib/types';
import { formatAddress } from '@/lib/utils';
import { User, Percent, CheckCircle, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContributorRowProps {
  contributor: Contributor;
  onEdit?: () => void;
  onRemove?: () => void;
  showActions?: boolean;
}

export function ContributorRow({ 
  contributor, 
  onEdit, 
  onRemove, 
  showActions = false 
}: ContributorRowProps) {
  const statusIcons = {
    confirmed: CheckCircle,
    pending: Clock,
    declined: XCircle,
  };

  const statusColors = {
    confirmed: 'text-green-500',
    pending: 'text-yellow-500',
    declined: 'text-red-500',
  };

  const StatusIcon = statusIcons[contributor.status];

  return (
    <div className="contributor-row">
      <div className="flex items-center space-x-md flex-1">
        <div className="flex items-center space-x-sm">
          <User className="w-4 h-4 text-textSecondary" />
          <div>
            <p className="text-sm font-medium text-textPrimary">
              {contributor.name || formatAddress(contributor.walletAddress)}
            </p>
            <p className="text-xs text-textSecondary">
              {contributor.role}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-xs">
          <Percent className="w-3 h-3 text-textSecondary" />
          <span className="text-sm font-medium text-textPrimary">
            {contributor.sharePercentage}%
          </span>
        </div>

        <StatusIcon className={cn('w-4 h-4', statusColors[contributor.status])} />
      </div>

      {showActions && (
        <div className="flex items-center space-x-xs">
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-sm py-xs text-xs text-primary hover:bg-primary/10 rounded-md transition-colors duration-200"
            >
              Edit
            </button>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              className="px-sm py-xs text-xs text-red-500 hover:bg-red-50 rounded-md transition-colors duration-200"
            >
              Remove
            </button>
          )}
        </div>
      )}
    </div>
  );
}
