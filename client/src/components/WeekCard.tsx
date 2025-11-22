import { memo } from "react";
import { motion } from "framer-motion";

interface WeekCardProps {
  week: number;
  tasks: string[];
  delay?: number;
}

const WeekCard = memo(function WeekCard({ week, tasks, delay = 0 }: WeekCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="h-full"
    >
      <div className="h-full p-6 border-l-2 border-border/40 hover:border-foreground/40 transition-all duration-300 space-y-4 bg-gradient-to-r from-muted/5 to-transparent">
        <h3 className="font-serif text-xl font-bold text-foreground">
          Week {week}
        </h3>
        
        <ul className="space-y-4">
          {tasks.map((task, index) => (
            <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground font-medium leading-relaxed">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
              <span>{task}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
});

export default WeekCard;
