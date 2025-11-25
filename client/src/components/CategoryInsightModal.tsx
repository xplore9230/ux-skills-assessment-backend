import { memo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Target } from "lucide-react";
import type { CategoryInsight } from "@/types";

interface CategoryInsightModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  insight: CategoryInsight | null;
  score: number;
  maxScore: number;
}

const CategoryInsightModal = memo(function CategoryInsightModal({
  open,
  onOpenChange,
  insight,
  score,
  maxScore,
}: CategoryInsightModalProps) {
  if (!insight) return null;

  // Score is already a percentage (0-100), so use it directly
  const percentage = score;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-serif mb-2">
                {insight.category}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm">
                  {percentage}% Score
                </Badge>
                <Badge variant="secondary" className="text-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI Analysis
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Brief Summary */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Quick Take
            </h3>
            <p className="text-base leading-relaxed">
              {insight.brief}
            </p>
          </div>

          {/* Detailed Analysis */}
          <div className="space-y-2 border-t border-border pt-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Detailed Analysis
            </h3>
            <p className="text-base leading-relaxed text-muted-foreground">
              {insight.detailed}
            </p>
          </div>

          {/* Actionable Steps */}
          <div className="space-y-3 border-t border-border pt-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
              <Target className="w-4 h-4" />
              Actionable Next Steps
            </h3>
            <ul className="space-y-3">
              {insight.actionable.map((action, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="text-sm leading-relaxed pt-0.5">
                    {action}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default CategoryInsightModal;

