import { motion } from "framer-motion";

interface ProgressBarProps {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = (current / total) * 100;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground font-serif" data-testid="text-progress">
        Question {current} of {total}
      </p>
      <div className="h-2 bg-muted rounded-full overflow-hidden border">
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
}
