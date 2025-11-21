import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowRight, Download } from "lucide-react";
import CategoryCard from "@/components/CategoryCard";
import WeekCard from "@/components/WeekCard";

interface CategoryScore {
  name: string;
  score: number;
  maxScore: number;
  status: "strong" | "decent" | "needs-work";
}

interface ImprovementWeek {
  week: number;
  tasks: string[];
}

interface ResultsPageProps {
  stage: string;
  totalScore: number;
  maxScore: number;
  summary: string;
  categories: CategoryScore[];
  improvementPlan: ImprovementWeek[];
  onRestart: () => void;
}

export default function ResultsPage({
  stage,
  totalScore,
  maxScore,
  summary,
  categories,
  improvementPlan,
  onRestart,
}: ResultsPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16 space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6 max-w-3xl mx-auto"
        >
          <Badge className="text-base px-6 py-2" data-testid="badge-stage">
            Your UX Career Stage
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold" data-testid="text-stage">
            {stage}
          </h1>
          
          <p className="text-xl text-muted-foreground leading-relaxed">
            {summary}
          </p>
          
          <div className="flex items-center justify-center gap-4 pt-4">
            <div className="text-center">
              <p className="text-5xl font-bold font-mono">{totalScore}</p>
              <p className="text-sm text-muted-foreground font-mono">out of {maxScore}</p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold mb-8">Your Skill Breakdown</h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              >
                <CategoryCard {...category} />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-2">Your 4-Week Improvement Plan</h2>
            <p className="text-lg text-muted-foreground">
              A personalized roadmap to level up your UX skills
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {improvementPlan.map((week, index) => (
              <WeekCard
                key={week.week}
                week={week.week}
                tasks={week.tasks}
                delay={0.7 + index * 0.1}
              />
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
        >
          <Button
            variant="outline"
            size="lg"
            className="gap-2"
            onClick={() => console.log('Download report')}
            data-testid="button-download"
          >
            <Download className="w-4 h-4" />
            Download Report
          </Button>
          
          <Button
            size="lg"
            className="gap-2"
            onClick={onRestart}
            data-testid="button-retake"
          >
            Retake Assessment
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
