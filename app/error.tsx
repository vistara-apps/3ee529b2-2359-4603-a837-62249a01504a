'use client';

import { FrameContainer } from '@/components/FrameContainer';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <FrameContainer>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-lg max-w-md">
          <div className="flex justify-center">
            <div className="p-lg bg-destructive/10 rounded-full">
              <AlertTriangle className="w-12 h-12 text-destructive" />
            </div>
          </div>
          
          <div className="space-y-md">
            <h2 className="text-2xl font-bold text-textPrimary">
              Something went wrong!
            </h2>
            <p className="text-textSecondary">
              We encountered an error while loading CreatorChain. This might be a temporary issue.
            </p>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="text-left mt-lg">
                <summary className="text-sm text-textSecondary cursor-pointer hover:text-textPrimary">
                  Error details (development only)
                </summary>
                <pre className="mt-sm p-sm bg-muted rounded text-xs overflow-auto">
                  {error.message}
                </pre>
              </details>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-sm justify-center">
            <Button
              onClick={reset}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Try again
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
            >
              Go home
            </Button>
          </div>
        </div>
      </div>
    </FrameContainer>
  );
}
