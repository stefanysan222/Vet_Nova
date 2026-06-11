function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-surface-200 dark:bg-surface-800/60 ${className}`}
    />
  );
}

function SkeletonText({ className = "" }: { className?: string }) {
  return <Skeleton className={`h-4 rounded-md ${className}`} />;
}

function SkeletonStatCard() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-2">
          <SkeletonText className="w-1/2" />
          <Skeleton className="h-7 w-1/3 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div
      className={`grid gap-4 ${
        count === 3
          ? "grid-cols-2 sm:grid-cols-3"
          : count === 2
            ? "grid-cols-2"
            : "grid-cols-2 sm:grid-cols-4"
      }`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonStatCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex gap-4">
        <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <SkeletonText className="w-28" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <SkeletonText className="w-40" />
          <SkeletonText className="w-24" />
        </div>
        <Skeleton className="h-5 w-24 shrink-0 rounded-md" />
      </div>
    </div>
  );
}

export function SkeletonCardList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonBanner() {
  return <Skeleton className="h-[110px] w-full rounded-2xl" />;
}

export function SkeletonTableRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <Skeleton className="mb-4 h-10 w-full rounded-xl" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-2 py-2">
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <SkeletonText className="w-32" />
          <SkeletonText className="w-24" />
          <SkeletonText className="w-20" />
          <Skeleton className="ml-auto h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}
