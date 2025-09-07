import React from 'react';
import { Button } from '@/components/ui/button';
import { cn, formatAddress, formatPercentage, getStatusColor } from '@/lib/utils';
import { Edit, Trash2, User, Wallet } from 'lucide-react';
import type { ContributorRowProps } from '@/types';

export function ContributorRow({ 
  contributor, 
  onEdit, 
  onRemove, 
  showActions = true 
}: ContributorRowProps) {
  const statusColor = getStatusColor(contributor.status);

  return (
    <div className="flex items-center justify-between p-4 bg-surface rounded-lg border">
      <div className="flex-1 space-y-2">
        {/* Contributor Identity */}
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              {contributor.farcasterUsername ? (
                <span className="text-body font-medium text-textPrimary truncate">
                  @{contributor.farcasterUsername}
                </span>
              ) : (
                <span className="text-body font-medium text-textPrimary">
                  {formatAddress(contributor.walletAddress)}
                </span>
              )}
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium",
                statusColor
              )}>
                {contributor.status}
              </span>
            </div>
            <div className="flex items-center space-x-4 mt-1">
              <div className="flex items-center space-x-1">
                <Wallet className="h-3 w-3 text-textSecondary" />
                <span className="text-caption text-textSecondary">
                  {formatAddress(contributor.walletAddress, 3)}
                </span>
              </div>
              {contributor.role && (
                <span className="text-caption text-textSecondary">
                  {contributor.role}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Percentage */}
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <div className="text-heading font-semibold text-textPrimary">
            {formatPercentage(contributor.sharePercentage)}
          </div>
          <div className="text-caption text-textSecondary">
            share
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center space-x-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(contributor)}
                className="h-8 w-8"
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
            {onRemove && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(contributor.contributorId)}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
