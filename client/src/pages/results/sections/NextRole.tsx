/**
 * Next Role Section
 * 
 * Displays job search CTAs with links to Google Jobs and LinkedIn.
 */

import { ArrowSquareOut, Briefcase } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import type { NextRoleData } from "@/lib/results/types";

interface NextRoleProps {
  data: NextRoleData;
}

export default function NextRole({ data }: NextRoleProps) {
  const { suggestedTitle, googleJobsUrl, linkedInUrl } = data;
  
  return (
    <div className="rounded-xl border border-border/30 bg-card p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col items-center gap-3 mb-4 text-center">
        <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center">
          <Briefcase size={20} weight="duotone" className="text-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Find Your Next Role
          </h2>
          <p className="text-sm text-muted-foreground">
            Based on your current skills
          </p>
        </div>
      </div>
      
      {/* Suggested title */}
      <div className="mb-6 text-center">
        <p className="text-sm text-muted-foreground mb-1">
          Your next logical role:
        </p>
        <p className="text-xl font-bold text-foreground">
          "{suggestedTitle}"
        </p>
      </div>
      
      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          asChild
          variant="outline"
          className="flex-1"
        >
          <a
            href={googleJobsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            <span>Search on Google Jobs</span>
            <ArrowSquareOut size={16} weight="duotone" />
          </a>
        </Button>
        
        <Button
          asChild
          variant="outline"
          className="flex-1"
        >
          <a
            href={linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            <span>Search on LinkedIn</span>
            <ArrowSquareOut size={16} weight="duotone" />
          </a>
        </Button>
      </div>
    </div>
  );
}


