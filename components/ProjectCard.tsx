'use client';

import { Project } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Users, DollarSign, Calendar, TrendingUp, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
  variant?: 'active' | 'inactive';
}

export function ProjectCard({ project, onClick, variant }: ProjectCardProps) {
  const distributionPercentage = project.totalRevenue 
    ? ((project.totalDistributed || 0) / project.totalRevenue) * 100 
    : 0;

  return (
    <div 
      className={cn('project-card group', variant)}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-textPrimary truncate group-hover:text-primary-700 transition-colors">
              {project.projectName}
            </h3>
            <ArrowRight className="w-4 h-4 text-textMuted group-hover:text-primary-600 group-hover:translate-x-1 transition-all opacity-0 group-hover:opacity-100" />
          </div>
          <p className="text-sm text-textSecondary line-clamp-2">
            {project.description || 'No description provided'}
          </p>
        </div>
        <div className={cn(
          'px-3 py-1 rounded-full text-xs font-medium border flex-shrink-0 ml-3',
          project.status === 'active' && 'status-active',
          project.status === 'inactive' && 'status-inactive',
          project.status === 'pending' && 'status-pending'
        )}>
          {project.status}
        </div>
      </div>

      {/* Revenue Progress Bar */}
      {project.totalRevenue > 0 && (
        <div className="mb-4 relative z-10">
          <div className="flex items-center justify-between text-xs text-textMuted mb-1">
            <span>Distribution Progress</span>
            <span>{distributionPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(distributionPercentage, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 relative z-10">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="p-2 bg-primary-50 rounded-lg group-hover:bg-primary-100 transition-colors">
              <DollarSign className="w-4 h-4 text-primary-600" />
            </div>
          </div>
          <p className="text-xs text-textMuted mb-1">Revenue</p>
          <p className="text-sm font-semibold text-textPrimary">
            {project.totalRevenue ? `${project.totalRevenue.toFixed(3)} ETH` : '0 ETH'}
          </p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="p-2 bg-secondary-50 rounded-lg group-hover:bg-secondary-100 transition-colors">
              <TrendingUp className="w-4 h-4 text-secondary-600" />
            </div>
          </div>
          <p className="text-xs text-textMuted mb-1">Distributed</p>
          <p className="text-sm font-semibold text-textPrimary">
            {project.totalDistributed ? `${project.totalDistributed.toFixed(3)} ETH` : '0 ETH'}
          </p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="p-2 bg-accent-50 rounded-lg group-hover:bg-accent-100 transition-colors">
              <Calendar className="w-4 h-4 text-accent-600" />
            </div>
          </div>
          <p className="text-xs text-textMuted mb-1">Created</p>
          <p className="text-sm font-semibold text-textPrimary">
            {new Intl.DateTimeFormat('en-US', {
              month: 'short',
              day: 'numeric'
            }).format(project.createdAt)}
          </p>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
    </div>
  );
}
