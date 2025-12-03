/**
 * Skill Analysis Section
 * 
 * Displays the 5 category skill cards in a grid layout.
 */

import { useState } from "react";
import { CaretDown, CaretUp } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { usePremiumAccess } from "@/context/PremiumAccessContext";
import PaywallEntryOverlay from "@/components/premium/PaywallEntryOverlay";
import { 
  getBandColorClass, 
  getBandBgClass 
} from "@/lib/results/scoring";
import type { 
  SkillAnalysisData, 
  CategoryScore, 
  CategoryInsight, 
  LoadingState 
} from "@/lib/results/types";

interface SkillAnalysisProps {
  data: SkillAnalysisData | null;
  status: LoadingState;
  categories: CategoryScore[];
}

/**
 * Individual skill card component
 */
function SkillCard({ 
  insight, 
  category 
}: { 
  insight?: CategoryInsight; 
  category: CategoryScore;
}) {
  const { isPremium, openPaywall } = usePremiumAccess();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const bandColorClass = getBandColorClass(category.band);
  const bandBgClass = getBandBgClass(category.band);
  
  // Limit checklist to 1 item for free users
  const limitedChecklist = isPremium ? insight?.checklist : (insight?.checklist || []).slice(0, 1);
  const hasMoreItems = insight?.checklist && insight.checklist.length > 1;
  
  return (
    <div className="rounded-xl border border-border/30 bg-card overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-foreground">
            {category.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground">
              {category.score}%
            </span>
          </div>
        </div>
        
        {/* Band tag */}
        <div className="inline-flex items-center px-3 py-1 rounded-full border border-border/30 bg-muted/50 text-muted-foreground text-sm font-medium">
          {category.band}
        </div>
        
        {/* Description */}
        {insight && (
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            {insight.description}
          </p>
        )}
      </div>
      
      {/* Expandable checklist */}
      {insight && limitedChecklist && limitedChecklist.length > 0 && (
        <>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-4 md:px-6 py-3 flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <span className="text-sm font-medium text-foreground">
              Action Items ({limitedChecklist.length} {!isPremium && hasMoreItems ? `of ${insight.checklist.length}` : ''})
            </span>
            {isExpanded ? (
              <CaretUp size={16} weight="duotone" className="text-muted-foreground" />
            ) : (
              <CaretDown size={16} weight="duotone" className="text-muted-foreground" />
            )}
          </button>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 md:px-6 py-4 space-y-3 border-t border-border relative">
                  {/* Free checklist items */}
                  {limitedChecklist.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className="mt-1 h-4 w-4 rounded border border-border flex-shrink-0" />
                      <span className="text-sm text-foreground">
                        {item.text}
                      </span>
                    </div>
                  ))}
                  
                  {/* Locked checklist items with blur overlay */}
                  {!isPremium && hasMoreItems && (
                    <div className="relative pt-2 mt-2" style={{ minHeight: '100px' }}>
                      <PaywallEntryOverlay
                        unlockType="todos"
                        onClick={() => openPaywall("todos")}
                        size="compact"
                        overlayWidth="w-full"
                        overlayHeight="h-full"
                        titleOverride="Unlock Full Checklist"
                        bodyOverride={`Get access to ${insight.checklist.length - 1} more action items for ${category.name}`}
                      >
                        {/* Blurred locked items behind */}
                        <div className="space-y-3">
                          {insight.checklist.slice(1).map((item) => (
                            <div key={item.id} className="flex items-start gap-3">
                              <div className="mt-1 h-4 w-4 rounded border border-border flex-shrink-0" />
                              <span className="text-sm text-foreground">
                                {item.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </PaywallEntryOverlay>
                    </div>
                  )}
                  
                  {/* Premium: show all items */}
                  {isPremium && insight.checklist.slice(1).map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className="mt-1 h-4 w-4 rounded border border-border flex-shrink-0" />
                      <span className="text-sm text-foreground">
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

/**
 * Skeleton loading card
 */
function SkillCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/30 bg-card p-4 md:p-6">
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-16" />
      </div>
      <Skeleton className="h-6 w-24 rounded-full" />
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export default function SkillAnalysis({ 
  data, 
  status, 
  categories 
}: SkillAnalysisProps) {
  // Loading state
  if (status === "loading" || status === "idle") {
    return (
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">
          Skill Analysis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkillCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }
  
  // Create a map of insights by category ID for easy lookup
  const insightMap = new Map<string, CategoryInsight>();
  if (data?.insights) {
    data.insights.forEach((insight) => {
      insightMap.set(insight.categoryId, insight);
    });
  }
  
  // Ensure categories is an array
  const safeCategories = Array.isArray(categories) ? categories : [];
  
  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-bold text-foreground mb-2">
          Skill Analysis
        </h2>
        <p className="text-sm text-muted-foreground">
          Based on your answers and learning patterns
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {safeCategories.map((category, index) => (
          <div
            key={category.id}
            className={index === 4 ? "md:col-span-2" : ""}
          >
            <SkillCard
              category={category}
              insight={insightMap.get(category.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}


