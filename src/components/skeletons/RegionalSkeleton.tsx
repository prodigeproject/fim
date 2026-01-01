import { Skeleton } from '@/components/ui/skeleton';

export function RegionalCardSkeleton() {
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}

export function RegionalGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <RegionalCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function RegionalFilterSkeleton() {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-20 rounded-full" />
      ))}
    </div>
  );
}
