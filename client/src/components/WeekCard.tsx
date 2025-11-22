import { memo } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

interface WeekCardProps {
  week: number;
  tasks: string[];
  delay?: number;
}

const WeekCard = memo(function WeekCard({ week, tasks, delay = 0 }: WeekCardProps) {
  const handleTaskClick = (task: string) => {
    // Extract key terms for Google search
    const searchQuery = encodeURIComponent(task);
    const googleSearchUrl = `https://www.google.com/search?q=${searchQuery}+UX+design+tutorial`;
    window.open(googleSearchUrl, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="h-full"
    >
      <div className="h-full p-6 border border-border/30 rounded-lg hover:border-border/60 transition-all duration-300 space-y-4 bg-card/30 backdrop-blur-sm hover:shadow-lg hover:-translate-y-0.5">
        <div className="space-y-1">
          <h3 className="font-serif text-xl font-bold text-foreground">
            Week {week}
          </h3>
          <p className="text-xs text-muted-foreground/70">
            Click any task to learn more
          </p>
        </div>
        
        <ul className="space-y-3">
          {tasks.map((task, index) => (
            <li key={index}>
              <button
                onClick={() => handleTaskClick(task)}
                aria-label={`Search for: ${task}`}
                className="group flex items-start gap-3 text-left text-sm text-muted-foreground hover:text-foreground font-medium leading-relaxed w-full transition-all duration-200 rounded-md hover:bg-muted/30 p-2 -ml-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95"
              >
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary/60 group-hover:bg-primary flex-shrink-0" />
                <span className="flex-1">{task}</span>
                <ExternalLink className="w-3 h-3 mt-1 opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
});

export default WeekCard;
