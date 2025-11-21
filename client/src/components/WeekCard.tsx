import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface WeekCardProps {
  week: number;
  tasks: string[];
  delay?: number;
}

export default function WeekCard({ week, tasks, delay = 0 }: WeekCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="p-6 space-y-4 h-full bg-card" data-testid={`week-${week}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">{week}</span>
          </div>
          <h3 className="font-semibold text-lg">Week {week}</h3>
        </div>
        
        <ul className="space-y-3">
          {tasks.map((task, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
              <span className="text-sm text-muted-foreground leading-relaxed">{task}</span>
            </li>
          ))}
        </ul>
      </Card>
    </motion.div>
  );
}
