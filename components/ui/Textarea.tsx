'use client';

import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-xs">
        {label && (
          <label className="block text-sm font-medium text-textPrimary">
            {label}
          </label>
        )}
        <textarea
          className={cn('input-field textarea', error && 'border-red-500', className)}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
