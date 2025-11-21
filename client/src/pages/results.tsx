import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowRight, Download, Loader, ExternalLink } from "lucide-react";
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

interface Resource {
  title: string;
  url: string;
  description: string;
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
  improvementPlan: defaultPlan,
  onRestart,
}: ResultsPageProps) {
  const [improvementPlan, setImprovementPlan] = useState(defaultPlan);
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  const [stageReadup, setStageReadup] = useState("");
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(true);

  useEffect(() => {
    // Set default plan and resources immediately
    setIsLoadingPlan(false);
    setIsLoadingResources(false);
  }, [stage, totalScore, maxScore, categories]);
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4 max-w-3xl mx-auto"
        >
          <h2 className="text-2xl font-bold">What This Means For Your Career</h2>
          <p className="text-lg leading-relaxed text-muted-foreground italic">{summary}</p>
        </motion.div>

        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
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
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <h2 className="text-3xl font-bold mb-2">Your AI-Powered 4-Week Improvement Plan</h2>
            <p className="text-lg text-muted-foreground">
              Personalized roadmap generated based on your assessment results
            </p>
          </motion.div>
          
          {isLoadingPlan ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-6 h-6 animate-spin" />
              <span className="ml-3">Generating your personalized plan...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {improvementPlan.map((week, index) => (
                <WeekCard
                  key={week.week}
                  week={week.week}
                  tasks={week.tasks}
                  delay={0.8 + index * 0.1}
                />
              ))}
            </div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
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
