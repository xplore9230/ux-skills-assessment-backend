export function SkeletonCard() {
  return (
    <div className="h-full p-6 rounded-xl border border-border/30 bg-muted/20 animate-pulse space-y-4">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 space-y-2">
          <div className="h-6 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted/70 rounded w-1/2" />
        </div>
        <div className="h-6 w-12 bg-muted rounded" />
      </div>
      <div className="h-16 bg-muted/50 rounded" />
      <div className="space-y-2">
        <div className="h-0.5 bg-muted/40 rounded-full" />
        <div className="h-4 bg-muted/50 rounded w-1/3" />
      </div>
    </div>
  );
}

