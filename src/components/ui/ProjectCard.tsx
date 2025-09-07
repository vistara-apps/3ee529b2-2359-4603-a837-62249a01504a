import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { Users, DollarSign, Calendar, ExternalLink } from 'lucide-react';
import type { ProjectCardProps } from '@/types';

export function ProjectCard({ 
  project, 
  contributors = [], 
  variant = 'active',
  onClick 
}: ProjectCardProps) {
  const statusColor = getStatusColor(project.status);
  const totalContributors = contributors.length;
  const totalRevenue = project.totalRevenue || 0;
  const totalDistributed = project.totalDistributed || 0;

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-lg",
        variant === 'inactive' && "opacity-75",
        onClick && "hover:scale-[1.02]"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-heading text-textPrimary">
            {project.projectName}
          </CardTitle>
          <span className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            statusColor
          )}>
            {project.status}
          </span>
        </div>
        {project.description && (
          <p className="text-caption text-textSecondary mt-2">
            {project.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Project Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-textSecondary" />
            <span className="text-caption text-textSecondary">
              {totalContributors} contributor{totalContributors !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-textSecondary" />
            <span className="text-caption text-textSecondary">
              {formatDate(project.createdAt, 'relative')}
            </span>
          </div>
        </div>

        {/* Revenue Stats */}
        {totalRevenue > 0 && (
          <div className="bg-surface rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-caption text-textSecondary">Total Revenue</span>
              <span className="text-body font-medium text-textPrimary">
                {formatCurrency(totalRevenue)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-caption text-textSecondary">Distributed</span>
              <span className="text-body font-medium text-secondary">
                {formatCurrency(totalDistributed)}
              </span>
            </div>
            {totalRevenue > totalDistributed && (
              <div className="flex items-center justify-between">
                <span className="text-caption text-textSecondary">Pending</span>
                <span className="text-body font-medium text-accent">
                  {formatCurrency(totalRevenue - totalDistributed)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Contributors Preview */}
        {contributors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-caption font-medium text-textPrimary">
              Contributors
            </h4>
            <div className="space-y-1">
              {contributors.slice(0, 3).map((contributor) => (
                <div 
                  key={contributor.contributorId}
                  className="flex items-center justify-between text-caption"
                >
                  <span className="text-textSecondary truncate">
                    {contributor.farcasterUsername || 
                     `${contributor.walletAddress.slice(0, 6)}...${contributor.walletAddress.slice(-4)}`}
                  </span>
                  <span className="text-textPrimary font-medium">
                    {contributor.sharePercentage}%
                  </span>
                </div>
              ))}
              {contributors.length > 3 && (
                <div className="text-caption text-textSecondary">
                  +{contributors.length - 3} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        {onClick && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-4"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            View Details
            <ExternalLink className="h-3 w-3 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
