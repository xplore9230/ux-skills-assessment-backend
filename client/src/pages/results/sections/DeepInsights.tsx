/**
 * Deep Insights Section
 * 
 * Displays advanced learning resources in a mixed grid layout.
 */

import { ArrowSquareOut, Clock, BookOpen, Video, Headphones } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import type { DeepInsightsData, DeepInsight, LoadingState } from "@/lib/results/types";

interface DeepInsightsProps {
  data: DeepInsightsData | null;
  status: LoadingState;
}

/**
 * Get icon for resource type
 */
function getResourceTypeIcon(type: string) {
  switch (type) {
    case "video":
      return <Video size={16} weight="duotone" />;
    case "podcast":
      return <Headphones size={16} weight="duotone" />;
    default:
      return <BookOpen size={16} weight="duotone" />;
  }
}

/**
 * Get CTA text for resource type
 */
function getCtaText(type: string) {
  switch (type) {
    case "video":
      return "Watch";
    case "podcast":
      return "Listen";
    default:
      return "Read";
  }
}

/**
 * Deep insight card component
 */
function InsightCard({ insight }: { insight: DeepInsight }) {
  return (
    <a
      href={insight.url}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-xl border border-border/30 bg-card p-5 hover:border-foreground/20 transition-colors group"
    >
      {/* Header badges */}
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/50 text-muted-foreground text-xs font-medium">
          {getResourceTypeIcon(insight.type)}
          <span className="capitalize">{insight.type}</span>
        </span>
        <span className="inline-flex items-center px-2 py-1 rounded-full bg-muted/50 border border-border/30 text-muted-foreground text-xs font-medium capitalize">
          {insight.level}
        </span>
      </div>
      
      {/* Title */}
      <h3 className="text-base font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-foreground/80">
        {insight.title}
      </h3>
      
      {/* Summary */}
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
        {insight.summary}
      </p>
      
      {/* Why this for you */}
      {insight.whyThisForYou && (
        <p className="text-xs text-muted-foreground/70 italic mb-4 line-clamp-2">
          "{insight.whyThisForYou}"
        </p>
      )}
      
      {/* Footer */}
      <div className="flex items-center justify-between">
        {insight.duration && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock size={12} weight="duotone" />
            {insight.duration}
          </span>
        )}
        <div className="flex items-center gap-1 text-sm font-medium text-foreground group-hover:text-foreground/80">
          <span>{getCtaText(insight.type)}</span>
          <ArrowSquareOut size={14} weight="duotone" />
        </div>
      </div>
    </a>
  );
}

/**
 * Skeleton loading card
 */
function InsightCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/30 bg-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-5 w-full mb-2" />
      <Skeleton className="h-5 w-3/4 mb-3" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

export default function DeepInsights({ data, status }: DeepInsightsProps) {
  // Loading state
  if (status === "loading" || status === "idle") {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
            Deep AI Insights – Advanced Knowledge Hub
          </h2>
          <p className="text-sm text-muted-foreground">
            Strategic content to accelerate your growth
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <InsightCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }
  
  // No data
  if (!data || !data.insights || data.insights.length === 0) {
    return null;
  }
  
  return (
    <div>
      {/* Section header */}
      <div className="mb-6 text-center">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
          Deep AI Insights – Advanced Knowledge Hub
        </h2>
        <p className="text-sm text-muted-foreground">
          Strategic content to accelerate your growth
        </p>
      </div>
      
      {/* Mixed grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {data.insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>
    </div>
  );
}


