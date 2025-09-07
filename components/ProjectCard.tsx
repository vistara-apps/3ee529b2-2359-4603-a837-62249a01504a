'use client';

import { Project } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Users, DollarSign, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
  variant?: 'active' | 'inactive';
}

export function ProjectCard({ project, onClick, variant }: ProjectCardProps) {
  return (
    <div 
      className={cn('project-card cursor-pointer', variant)}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-md">
        <div>
          <h3 className="text-lg font-semibold text-textPrimary mb-xs">
            {project.projectName}
          </h3>
          <p className="text-sm text-textSecondary">
            {project.description || 'No description provided'}
          </p>
        </div>
        <div className={cn(
          'px-sm py-xs rounded-md text-xs font-medium',
          project.status === 'active' && 'bg-green-100 text-green-800',
          project.status === 'inactive' && 'bg-gray-100 text-gray-800',
          project.status === 'pending' && 'bg-yellow-100 text-yellow-800'
        )}>
          {project.status}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-md">
        <div className="flex items-center space-x-xs">
          <DollarSign className="w-4 h-4 text-textSecondary" />
          <div>
            <p className="text-xs text-textSecondary">Revenue</p>
            <p className="text-sm font-medium text-textPrimary">
              {formatCurrency(project.totalRevenue || 0)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-xs">
          <Users className="w-4 h-4 text-textSecondary" />
          <div>
            <p className="text-xs text-textSecondary">Distributed</p>
            <p className="text-sm font-medium text-textPrimary">
              {formatCurrency(project.totalDistributed || 0)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-xs">
          <Calendar className="w-4 h-4 text-textSecondary" />
          <div>
            <p className="text-xs text-textSecondary">Created</p>
            <p className="text-sm font-medium text-textPrimary">
              {formatDate(project.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
