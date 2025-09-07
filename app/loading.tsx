import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function Loading() {
  return (
    <div className="frame-container">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-8 animate-fade-in w-full max-w-md">
          <div className="space-y-4">
            <LoadingSpinner size="lg" />
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-textPrimary">Loading CreatorChain</h2>
              <p className="text-textMuted">Preparing your collaborative workspace...</p>
            </div>
          </div>
          
          {/* Loading skeleton cards */}
          <div className="space-y-4">
            <div className="skeleton h-8 rounded-lg w-3/4 mx-auto"></div>
            <div className="space-y-3">
              <div className="skeleton h-4 rounded"></div>
              <div className="skeleton h-4 rounded w-5/6"></div>
              <div className="skeleton h-4 rounded w-4/6"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="skeleton h-20 rounded-xl"></div>
              <div className="skeleton h-20 rounded-xl"></div>
              <div className="skeleton h-20 rounded-xl sm:block hidden"></div>
            </div>
            <div className="space-y-3">
              <div className="skeleton h-24 rounded-xl"></div>
              <div className="skeleton h-20 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
