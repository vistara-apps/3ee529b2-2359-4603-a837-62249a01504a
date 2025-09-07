'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="frame-container">
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-md">
          <h2 className="text-2xl font-bold text-textPrimary">
            Something went wrong!
          </h2>
          <p className="text-textSecondary">
            We encountered an error while loading CreatorChain.
          </p>
          <button
            onClick={reset}
            className="btn btn-primary"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
