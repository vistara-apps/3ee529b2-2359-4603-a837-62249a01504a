'use client';

import { cn } from '@/lib/utils';

interface FrameContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function FrameContainer({ children, className }: FrameContainerProps) {
  return (
    <div className={cn('frame-container', className)}>
      {children}
    </div>
  );
}
