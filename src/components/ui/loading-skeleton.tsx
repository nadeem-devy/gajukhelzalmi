"use client";

export default function LoadingSkeleton() {
  return (
    <div className="container-page animate-pulse">
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="space-y-3">
          <div className="h-8 bg-warmgray-200 rounded-lg w-48" />
          <div className="h-4 bg-warmgray-100 rounded w-64" />
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-4 space-y-2">
              <div className="h-3 bg-warmgray-100 rounded w-20" />
              <div className="h-6 bg-warmgray-200 rounded w-24" />
            </div>
          ))}
        </div>

        {/* Cards skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="h-5 bg-warmgray-200 rounded w-40" />
              <div className="h-3 bg-warmgray-100 rounded w-full" />
              <div className="h-3 bg-warmgray-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
