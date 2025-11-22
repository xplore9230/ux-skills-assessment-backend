import { memo } from "react";
import { motion } from "framer-motion";

interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar = memo(function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = (current / total) * 100;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground font-serif" data-testid="text-progress">
        <span className="sr-only">Quiz progress: </span>
        Question {current} of {total}
      </p>
      <div 
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Quiz progress: question ${current} of ${total}`}
        className="h-2 bg-muted rounded-full overflow-hidden border"
      >
        <motion.div
          className="h-full bg-foreground"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          data-testid="progress-bar-fill"
        />
      </div>
    </div>
  );
});

export default ProgressBar;
