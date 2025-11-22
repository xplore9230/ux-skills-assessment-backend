import { memo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ChevronRight } from "lucide-react";
import CategoryInsightModal from "./CategoryInsightModal";
import type { CategoryInsight } from "@/types";

interface CategoryCardProps {
  name: string;
  score: number;
  maxScore: number;
  status: "strong" | "decent" | "needs-work";
  insight?: CategoryInsight | null;
  isLoadingInsight?: boolean;
}

const CategoryCard = memo(function CategoryCard({
  name,
  score,
  maxScore, // is 100
  status,
  insight,
  isLoadingInsight = false,
}: CategoryCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="h-full"
      >
        <div className="h-full flex flex-col justify-between p-6 rounded-xl border border-border/30 hover:border-border/50 bg-muted/20 hover:bg-muted/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <h3 className="font-serif font-semibold text-xl tracking-wide text-foreground leading-tight mb-1">
                  {name}
                </h3>
                {insight && (
                  <Badge variant="secondary" className="text-xs flex items-center gap-1 w-fit">
                    <Sparkles className="w-3 h-3" />
                    AI Insight
                  </Badge>
                )}
              </div>
              <span className="font-mono font-bold text-lg text-foreground/80">
                {score}%
              </span>
            </div>

            {/* Brief Insight */}
            {insight && !isLoadingInsight && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="text-sm text-muted-foreground leading-relaxed"
              >
                {insight.brief}
              </motion.p>
            )}

            {isLoadingInsight && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
                <div className="w-3 h-3 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
                Generating insight...
              </div>
            )}
          </div>
          
          <div className="space-y-3 mt-auto">
            <div className="h-0.5 w-full bg-muted/40 overflow-hidden rounded-full">
              <motion.div
                className="h-full bg-foreground"
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1, delay: 0.2, ease: "circOut" }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {status.replace("-", " ")}
              </p>
              
              {insight && !isLoadingInsight && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setModalOpen(true)}
                  aria-label={`View detailed analysis for ${name}`}
                  className="text-xs min-h-11 px-3 hover:bg-muted/50 active:scale-95 transition-transform"
                >
                  See Detailed Analysis
                  <ChevronRight className="w-3 h-3 ml-1" aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <CategoryInsightModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        insight={insight || null}
        score={score}
        maxScore={maxScore}
      />
    </>
  );
});

export default CategoryCard;
