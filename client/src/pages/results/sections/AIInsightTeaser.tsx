/**
 * AI Insight Teaser Section
 * 
 * Displays a coming soon placeholder for future AI career insights.
 */

import { Lock, Bell, Sparkle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { AI_INSIGHT_DESCRIPTION } from "@/lib/results/stage-config";
import type { AIInsightTeaserData } from "@/lib/results/types";

interface AIInsightTeaserProps {
  data: AIInsightTeaserData;
}

export default function AIInsightTeaser({ data }: AIInsightTeaserProps) {
  const { label } = data;
  
  return (
    <div className="rounded-xl border border-border/30 bg-gradient-to-br from-card to-muted/30 p-6 md:p-8 opacity-75 text-center">
      {/* Header */}
      <div className="flex flex-col items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center">
          <Lock size={20} weight="duotone" className="text-foreground" />
        </div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">
            {label}
          </h2>
        </div>
      </div>
      
      {/* Description */}
      <p className="text-sm text-muted-foreground mb-6 max-w-xl mx-auto">
        {AI_INSIGHT_DESCRIPTION}
      </p>
      
      {/* CTA button (disabled) */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          disabled
          className="flex items-center gap-2 opacity-50 cursor-not-allowed"
        >
          <Bell size={16} weight="duotone" />
          <span>Notify Me</span>
        </Button>
      </div>
      
      {/* Tooltip hint */}
      <p className="mt-4 text-xs text-muted-foreground/50 italic">
        We're working on a deeper AI-driven career intelligence layer for you.
      </p>
    </div>
  );
}


