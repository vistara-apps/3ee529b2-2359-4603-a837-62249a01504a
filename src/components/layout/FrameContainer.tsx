import React from 'react';
import { cn } from '@/lib/utils';
import type { FrameContainerProps } from '@/types';

export function FrameContainer({ 
  children, 
  title, 
  subtitle, 
  className 
}: FrameContainerProps) {
  return (
    <div className={cn(
      "max-w-lg w-full mx-auto px-4 py-6 bg-background min-h-screen",
      className
    )}>
      {(title || subtitle) && (
        <div className="mb-6 text-center">
          {title && (
            <h1 className="text-display font-bold text-textPrimary mb-2">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-body text-textSecondary">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}
