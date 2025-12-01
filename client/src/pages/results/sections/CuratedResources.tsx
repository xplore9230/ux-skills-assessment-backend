/**
 * Curated Resources Section
 * 
 * Displays beginner learning resources in a horizontal carousel.
 */

import { ArrowSquareOut, Clock, BookOpen, Video, Headphones } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import type { CuratedResourcesData, CuratedResource, LoadingState } from "@/lib/results/types";

interface CuratedResourcesProps {
  data: CuratedResourcesData | null;
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
 * Resource card component
 */
function ResourceCard({ resource }: { resource: CuratedResource }) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex-shrink-0 w-72 md:w-80 rounded-xl border border-border/30 bg-card p-5 hover:border-foreground/20 transition-colors group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/50 text-muted-foreground text-xs font-medium">
          {getResourceTypeIcon(resource.type)}
          <span className="capitalize">{resource.level}</span>
        </span>
        {resource.duration && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock size={12} weight="duotone" />
            {resource.duration}
          </span>
        )}
      </div>
      
      {/* Title */}
      <h3 className="text-base font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-foreground/80">
        {resource.title}
      </h3>
      
      {/* Summary */}
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
        {resource.summary}
      </p>
      
      {/* Reason selected */}
      {resource.reasonSelected && (
        <p className="text-xs text-muted-foreground/70 italic mb-4 line-clamp-2">
          "{resource.reasonSelected}"
        </p>
      )}
      
      {/* CTA */}
      <div className="flex items-center gap-1 text-sm font-medium text-foreground group-hover:text-foreground/80">
        <span>Read Now</span>
        <ArrowSquareOut size={14} weight="duotone" />
      </div>
    </a>
  );
}

/**
 * Skeleton loading card
 */
function ResourceCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-72 md:w-80 rounded-xl border border-border/30 bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-5 w-full mb-2" />
      <Skeleton className="h-5 w-3/4 mb-3" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

export default function CuratedResources({ data, status }: CuratedResourcesProps) {
  // Loading state
  if (status === "loading" || status === "idle") {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
            Start Here – Build Your Core UX Foundations
          </h2>
          <p className="text-sm text-muted-foreground">
            Curated based on your weakest skill areas
          </p>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {[1, 2, 3, 4, 5].map((i) => (
            <ResourceCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }
  
  // No data
  if (!data || !data.resources || data.resources.length === 0) {
    return null;
  }
  
  return (
    <div>
      {/* Section header */}
      <div className="mb-6 text-center">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
          Start Here – Build Your Core UX Foundations
        </h2>
        <p className="text-sm text-muted-foreground">
          Curated based on your weakest skill areas
        </p>
      </div>
      
      {/* Horizontal scroll carousel */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {data.resources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    </div>
  );
}


