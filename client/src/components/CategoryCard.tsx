import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface CategoryCardProps {
  name: string;
  score: number;
  maxScore: number;
  status: "strong" | "decent" | "needs-work";
}

export default function CategoryCard({
  name,
  score,
  maxScore,
  status,
}: CategoryCardProps) {
  const percentage = (score / maxScore) * 100;
  
  const statusColors = {
    "strong": "bg-chart-3",
    "decent": "bg-chart-1",
    "needs-work": "bg-chart-2"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="p-6 space-y-4 bg-card" data-testid={`category-${name.toLowerCase().replace(/\s+/g, '-')}`}>
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">{name}</h3>
          <p className="text-2xl font-bold text-foreground">
            {score}/{maxScore}
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${statusColors[status]}`}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </div>
          <p className="text-sm text-muted-foreground capitalize">
            {status.replace("-", " ")}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
