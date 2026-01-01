import { Skeleton } from '@/components/ui/skeleton';

export function FAQItemSkeleton() {
  return (
    <div className="border border-border rounded-lg p-4 space-y-2">
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

export function FAQListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <FAQItemSkeleton key={i} />
      ))}
    </div>
  );
}
