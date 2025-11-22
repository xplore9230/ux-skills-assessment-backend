import { memo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
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
  maxScore,
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
        <div 
          onClick={() => insight && !isLoadingInsight && setModalOpen(true)}
          className={`group h-full flex flex-col justify-between p-6 rounded-2xl border border-border/40 bg-card hover:border-foreground/20 hover:shadow-sm transition-all duration-300 cursor-pointer relative overflow-hidden ${insight ? 'hover:bg-muted/30' : ''}`}
        >
          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-start gap-4">
              <h3 className="font-serif font-bold text-xl tracking-tight text-foreground">
                {name}
              </h3>
              <span className="font-mono font-bold text-lg text-foreground/60">
                {score}%
              </span>
            </div>

            {/* Progress Line */}
            <div className="h-1 w-full bg-secondary/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-foreground"
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1, delay: 0.2, ease: "circOut" }}
              />
            </div>

            {/* Brief Insight */}
            <div className="min-h-[3rem]">
              {insight && !isLoadingInsight ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-muted-foreground leading-relaxed line-clamp-2"
                >
                  {insight.brief}
                </motion.p>
              ) : isLoadingInsight ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground/50 animate-pulse">
                  <Sparkles className="w-3 h-3" />
                  <span>Analyzing performance...</span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground/40 italic">
                  Score based on assessment answers
                </p>
              )}
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-border/30 flex items-center justify-between relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
              {status.replace("-", " ")}
            </span>
            
            {insight && !isLoadingInsight && (
              <div className="flex items-center gap-1 text-xs font-medium text-foreground group-hover:translate-x-1 transition-transform">
                View Insight
                <ArrowRight className="w-3 h-3" />
              </div>
            )}
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
