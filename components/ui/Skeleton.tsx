'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ 
  className, 
  variant = 'default',
  width,
  height,
  style,
  ...props 
}: SkeletonProps) {
  const baseClasses = 'skeleton';
  
  const variantClasses = {
    default: 'h-4 w-full',
    text: 'h-4 w-3/4',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  const combinedStyle = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
    ...style,
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
      style={combinedStyle}
      {...props}
    />
  );
}

// Skeleton components for common patterns
export function SkeletonCard() {
  return (
    <div className="bg-surface rounded-lg p-lg border border-border space-y-md">
      <div className="flex items-start justify-between">
        <div className="space-y-sm flex-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton variant="text" className="h-4 w-full" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      
      <div className="grid grid-cols-3 gap-md">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-xs">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-3 gap-md">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="text-center p-md bg-surface rounded-lg border border-border">
          <Skeleton variant="circular" className="w-8 h-8 mx-auto mb-sm" />
          <Skeleton className="h-6 w-16 mx-auto mb-xs" />
          <Skeleton className="h-3 w-20 mx-auto" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonContributor() {
  return (
    <div className="contributor-row">
      <div className="flex items-center space-x-sm">
        <Skeleton variant="circular" className="w-4 h-4" />
        <div className="space-y-xs">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="flex items-center space-x-xs">
        <Skeleton variant="circular" className="w-3 h-3" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}
