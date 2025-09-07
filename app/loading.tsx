import { FrameContainer } from '@/components/FrameContainer';
import { SkeletonCard, SkeletonStats } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <FrameContainer>
      <div className="space-y-xl py-lg">
        {/* Header skeleton */}
        <div className="text-center space-y-md">
          <div className="h-8 w-48 bg-muted rounded mx-auto animate-pulse"></div>
          <div className="h-4 w-64 bg-muted rounded mx-auto animate-pulse"></div>
          
          {/* Wallet connection skeleton */}
          <div className="h-10 w-32 bg-muted rounded mx-auto animate-pulse mt-md"></div>
        </div>

        {/* Stats skeleton */}
        <SkeletonStats />

        {/* Projects section skeleton */}
        <div className="space-y-md">
          <div className="flex items-center justify-between">
            <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
            <div className="h-10 w-28 bg-muted rounded animate-pulse"></div>
          </div>

          {/* Project cards skeleton */}
          <div className="space-y-md">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    </FrameContainer>
  );
}
