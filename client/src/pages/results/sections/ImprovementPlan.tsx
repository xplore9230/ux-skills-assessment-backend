/**
 * Improvement Plan Section
 * 
 * Displays the 3-week personalized improvement plan.
 * Lazy loaded after other sections complete.
 */

import { useState } from "react";
import { CaretDown, CaretUp, Clock, Target, Lightning } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import type { ImprovementPlanData, PlanWeek, LoadingState } from "@/lib/results/types";

interface ImprovementPlanProps {
  data: ImprovementPlanData | null;
  status: LoadingState;
}

/**
 * Week card component
 */
function WeekCard({ week }: { week: PlanWeek }) {
  const [isExpanded, setIsExpanded] = useState(week.weekNumber === 1);
  
  return (
    <div className="rounded-xl border border-border/30 bg-card overflow-hidden">
      {/* Week header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 md:p-6 flex items-center justify-between hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-foreground/10 flex items-center justify-center">
            <span className="text-lg font-bold text-foreground">{week.weekNumber}</span>
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-foreground">
              Week {week.weekNumber} — {week.theme}
            </h3>
            <p className="text-sm text-muted-foreground">
              Focus: {week.focusAreas.slice(0, 2).join(" · ")}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <CaretUp size={20} weight="duotone" className="text-muted-foreground" />
        ) : (
          <CaretDown size={20} weight="duotone" className="text-muted-foreground" />
        )}
      </button>
      
      {/* Expandable content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 md:px-6 pb-6 space-y-6 border-t border-border pt-6">
              {/* Daily tasks */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Lightning size={16} weight="duotone" className="text-amber-400" />
                  <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                    Daily Tasks
                  </h4>
                </div>
                <div className="space-y-3">
                  {week.dailyTasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-3">
                      <div className="mt-1 h-4 w-4 rounded border border-border flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {task.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {task.description}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock size={12} weight="duotone" />
                            {task.duration}
                          </span>
                          {task.category && (
                            <span className="text-xs text-muted-foreground">
                              {task.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Deep work tasks */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Target size={16} weight="duotone" className="text-purple-400" />
                  <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                    Deep Work Sessions
                  </h4>
                </div>
                <div className="space-y-3">
                  {week.deepWorkTasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-3">
                      <div className="mt-1 h-4 w-4 rounded border border-border flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {task.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {task.description}
                        </p>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5">
                          <Clock size={12} weight="duotone" />
                          {task.duration}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Expected outcome */}
              <div className="rounded-lg bg-muted/30 p-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Expected Outcome
                </h4>
                <p className="text-sm text-foreground">
                  {week.expectedOutcome}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Loading skeleton for week card
 */
function WeekCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/30 bg-card p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-5 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
  );
}

export default function ImprovementPlan({ data, status }: ImprovementPlanProps) {
  // Loading state
  if (status === "loading") {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
            Your 3-Week Improvement Plan
          </h2>
          <p className="text-sm text-muted-foreground">
            Generating your personalized roadmap...
          </p>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <WeekCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }
  
  // Idle - waiting for main sections
  if (status === "idle") {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
            Your 3-Week Improvement Plan
          </h2>
          <p className="text-sm text-muted-foreground">
            Loading...
          </p>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <WeekCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }
  
  // Error state
  if (status === "error") {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
            Your 3-Week Improvement Plan
          </h2>
        </div>
        
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-muted-foreground">
            Unable to generate your improvement plan. Please try again later.
          </p>
        </div>
      </div>
    );
  }
  
  // No data
  if (!data || !data.weeks || data.weeks.length === 0) {
    return null;
  }
  
  return (
    <div>
      {/* Section header */}
      <div className="mb-6 text-center">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
          Your 3-Week Improvement Plan
        </h2>
        <p className="text-sm text-muted-foreground">
          A personalized roadmap designed just for you
        </p>
      </div>
      
      {/* Week cards */}
      <div className="space-y-4">
        {data.weeks.map((week) => (
          <WeekCard key={week.weekNumber} week={week} />
        ))}
      </div>
    </div>
  );
}


