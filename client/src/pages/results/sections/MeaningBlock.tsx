import { Sparkle } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import type { MeaningData, LoadingState } from "@/lib/results/types";

interface MeaningBlockProps {
  data: MeaningData | null;
  status: LoadingState;
}

export default function MeaningBlock({ data, status }: MeaningBlockProps) {
  // Loading state
  if (status === "loading" || status === "idle") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="rounded-xl border border-muted/40 bg-card/50 p-6">
          <div className="flex items-start gap-3">
            <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Error or no data
  if (status === "error" || !data) {
    return null;
  }
  
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div
        className="
          rounded-xl 
          border 
          border-border/30
          bg-card
          p-6 md:p-8 
          relative 
          overflow-hidden
        "
      >
        {/* Header */}
        <div className="flex flex-col items-center gap-2 mb-4 relative z-10">
          <Sparkle size={20} weight="duotone" className="text-muted-foreground" />
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            What This Means For You
          </h2>
        </div>
        
        {/* Meaning text */}
        <p className="text-base md:text-lg text-foreground leading-relaxed relative z-10 text-center">
          {data.meaning}
        </p>
        
        {/* Footer */}
        <p className="mt-4 text-xs text-muted-foreground/70 relative z-10 text-center">
          Based on your answers and learning patterns
        </p>
      </div>
    </div>
  );
}
