import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowRight, Download, Loader, ExternalLink } from "lucide-react";
import CategoryCard from "@/components/CategoryCard";
import WeekCard from "@/components/WeekCard";
import DeepDiveSection from "@/components/DeepDiveSection";
import ScoreOdometer from "@/components/ScoreOdometer";
import { getStageIcon, getStageColor, getStageBgColor } from "@/lib/stageIcons";

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

interface DeepDiveResource {
  title: string;
  type: "article" | "video" | "guide";
  estimated_read_time: string;
  source: string;
  url: string;
  tags: string[];
}

interface DeepDiveTopic {
  name: string;
  pillar: string;
  level: string;
  summary: string;
  practice_points: string[];
  resources: DeepDiveResource[];
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
  const [deepDiveTopics, setDeepDiveTopics] = useState<DeepDiveTopic[]>([]);
  const [isLoadingDeepDive, setIsLoadingDeepDive] = useState(true);

  useEffect(() => {
    setIsLoadingPlan(false);
    setIsLoadingResources(false);
    setIsLoadingDeepDive(true);

    const generateResources = async () => {
      try {
        const response = await fetch("/api/generate-resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stage,
            categories,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          if (data.readup) {
            setStageReadup(data.readup);
          }
          if (data.resources) {
            setResources(data.resources);
          }
        }
      } catch (error) {
        console.error("Failed to generate resources:", error);
      }
    };

    const generateDeepDive = async () => {
      try {
        const response = await fetch("/api/generate-deep-dive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stage,
            categories,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          if (data.topics) {
            setDeepDiveTopics(data.topics);
          }
        }
      } catch (error) {
        console.error("Failed to generate deep dive:", error);
      } finally {
        setIsLoadingDeepDive(false);
      }
    };

    generateResources();
    generateDeepDive();
  }, [stage, totalScore, maxScore, categories]);

  const StageIcon = getStageIcon(stage);
  const stageColor = getStageColor(stage);
  const stageBgColor = getStageBgColor(stage);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16 space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`text-center space-y-8 max-w-3xl mx-auto rounded-lg p-8 md:p-12 border-2 border-border ${stageBgColor}`}
        >
          <div className="flex justify-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
              className={`p-4 rounded-full bg-background`}
            >
              <StageIcon className={`w-12 h-12 ${stageColor}`} />
            </motion.div>
          </div>

          <div>
            <Badge className="text-sm px-4 py-1 mb-4" data-testid="badge-stage">
              Your UX Career Stage
            </Badge>
            <h1
              className="text-5xl md:text-6xl font-bold mb-4"
              data-testid="text-stage"
            >
              {stage}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {summary}
            </p>
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center pt-4"
          >
            <ScoreOdometer score={totalScore} maxScore={maxScore} />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="rounded-lg p-8 border-2 border-border bg-muted/30 max-w-3xl mx-auto space-y-4"
        >
          <h2 className="text-2xl font-bold">What This Means For Your Career</h2>
          {stageReadup && (
            <p className="text-lg leading-relaxed text-foreground">{stageReadup}</p>
          )}
        </motion.div>

        {resources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-3xl font-bold mb-4">Recommended Learning Resources</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resources.map((resource, index) => (
                  <motion.a
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                    className="p-4 border border-border rounded-lg hover-elevate transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold group-hover:text-foreground text-foreground mb-1">
                          {resource.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {resource.description}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        )}

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


        <DeepDiveSection
          topics={deepDiveTopics}
          isLoading={isLoadingDeepDive}
        />

        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
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
