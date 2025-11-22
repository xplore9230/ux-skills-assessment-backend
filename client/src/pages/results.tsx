import { memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { ArrowRight, Download, ExternalLink, Sparkles } from "lucide-react";
import WeekCard from "@/components/WeekCard";
import DeepDiveSection from "@/components/DeepDiveSection";
import ScoreOdometer from "@/components/ScoreOdometer";
import CategoryCard from "@/components/CategoryCard";
import { useResultsData } from "@/hooks/useResultsData";
import type { CategoryScore, ImprovementWeek } from "@/types";

interface ResultsPageProps {
  stage: string;
  totalScore: number;
  maxScore: number;
  summary: string;
  categories: CategoryScore[];
  improvementPlan: ImprovementWeek[];
  onRestart: () => void;
}

const ResultsPage = memo(function ResultsPage({
  stage,
  totalScore,
  maxScore,
  summary,
  categories,
  improvementPlan,
  onRestart,
}: ResultsPageProps) {
  const {
    stageReadup,
    resources,
    deepDiveTopics,
    jobLinks,
    layoutStrategy,
    categoryInsights,
    isLoadingResources,
    isLoadingDeepDive,
    isLoadingJobs,
    isLoadingLayout,
    isLoadingInsights,
  } = useResultsData(stage, categories, totalScore, maxScore);

  // Map category insights by category name for easy lookup
  const insightsMap = useMemo(() => {
    const map = new Map();
    categoryInsights.forEach(insight => {
      map.set(insight.category, insight);
    });
    return map;
  }, [categoryInsights]);

  // Define all sections as components
  const sections = useMemo(() => ({
    hero: (
      <motion.div
        key="hero"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center text-center space-y-8"
      >
        <div className="mb-4">
          <ScoreOdometer score={totalScore} maxScore={maxScore} duration={0.3} />
        </div>

        <div className="space-y-6">
          <Badge variant="outline" className="text-xs font-bold uppercase tracking-widest px-4 py-1.5 border-foreground/20 text-foreground/60 rounded-full">
            Assessment Complete
          </Badge>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-foreground tracking-tight leading-none">
            {stage}
          </h1>
        </div>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed font-medium">
          {summary}
        </p>
      </motion.div>
    ),

    "stage-readup": stageReadup || isLoadingResources ? (
      stageReadup ? (
        <motion.div
          key="stage-readup"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto text-center border-t border-b border-border/40 py-16 space-y-6"
        >
          <h2 className="text-2xl font-serif font-bold italic">What this means for you</h2>
          <p className="text-lg leading-relaxed text-muted-foreground/90 font-medium">
            {stageReadup}
          </p>
        </motion.div>
      ) : (
        <motion.div
          key="stage-readup-loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-3xl mx-auto text-center py-12 space-y-4"
        >
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-foreground/20 border-t-foreground rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground animate-pulse">AI analyzing your career stage...</p>
        </motion.div>
      )
    ) : null,

    "skill-breakdown": (
      <div key="skill-breakdown" className="space-y-12">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center space-y-3"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold">Skill Analysis</h2>
          <p className="text-muted-foreground font-medium">Your performance across key UX competencies</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="h-full"
            >
              <CategoryCard 
                {...category}
                insight={insightsMap.get(category.name)}
                isLoadingInsight={isLoadingInsights}
              />
            </motion.div>
          ))}
        </div>
      </div>
    ),

    resources: !isLoadingResources && resources.length > 0 ? (
      <div key="resources" className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-serif font-bold mb-2">Curated Resources</h2>
          <p className="text-muted-foreground">Hand-picked for your specific skill gaps</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((resource, index) => (
            <motion.a
              key={index}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              className="p-6 border border-border rounded-lg hover:border-foreground/30 transition-colors group bg-card"
            >
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors mb-2">
                {resource.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {resource.description}
              </p>
            </motion.a>
          ))}
        </div>
      </div>
    ) : isLoadingResources ? (
      <div key="resources-loading" className="space-y-8 opacity-60">
        <div className="text-center">
          <h2 className="text-3xl font-serif font-bold mb-2">Curated Resources</h2>
          <div className="flex justify-center mt-4">
            <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
          </div>
        </div>
      </div>
    ) : null,

    "deep-dive": !isLoadingDeepDive && deepDiveTopics.length > 0 ? (
      <DeepDiveSection
        key="deep-dive"
        topics={deepDiveTopics}
        isLoading={false}
      />
    ) : isLoadingDeepDive ? (
      <div key="deep-dive-loading" className="space-y-8 text-center py-12">
        <h2 className="text-3xl font-serif font-bold">Deep Dive Topics</h2>
        <p className="text-muted-foreground animate-pulse">Generating personalized study paths...</p>
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-foreground/20 border-t-foreground rounded-full animate-spin" />
        </div>
      </div>
    ) : null,

    "improvement-plan": (
      <div key="improvement-plan" className="space-y-12">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center space-y-3"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold">4-Week Roadmap</h2>
          <p className="text-muted-foreground font-medium">Your personalized action plan</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {improvementPlan.map((week, index) => (
            <WeekCard
              key={week.week}
              week={week.week}
              tasks={week.tasks}
              delay={0.2 + index * 0.1}
            />
          ))}
        </div>
      </div>
    ),

    jobs: !isLoadingJobs && jobLinks ? (
      <div key="jobs" className="space-y-8 border-t border-border/40 pt-16">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-serif font-bold">Find Your Next Role</h2>
          <p className="text-muted-foreground">
            Based on your experience, we recommend looking for 
            <span className="font-bold text-foreground mx-1">{jobLinks.job_title}</span>
            roles.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a
            href={jobLinks.linkedin_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-[#0077b5] text-white rounded-lg font-semibold hover:bg-[#006097] transition-colors shadow-sm"
          >
            Search on LinkedIn
            <ExternalLink className="w-4 h-4" />
          </a>
          
          <a
            href={jobLinks.google_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-white border border-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-sm"
          >
            Search on Google Jobs
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    ) : isLoadingJobs ? (
      <div key="jobs-loading" className="space-y-8 border-t border-border/40 pt-16 text-center">
        <h2 className="text-2xl font-serif font-bold">Finding Relevant Roles...</h2>
        <div className="flex justify-center mt-4">
          <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
        </div>
      </div>
    ) : null,
  }), [stage, totalScore, maxScore, summary, categories, improvementPlan, stageReadup, resources, deepDiveTopics, jobLinks, insightsMap, isLoadingResources, isLoadingDeepDive, isLoadingJobs, isLoadingInsights]);

  // Get section order from layout strategy or use default
  const sectionOrder = layoutStrategy?.section_order || [
    "hero",
    "stage-readup",
    "skill-breakdown",
    "resources",
    "deep-dive",
    "improvement-plan",
    "jobs"
  ];

  // Get section visibility from layout strategy or show all by default
  const sectionVisibility = layoutStrategy?.section_visibility || {
    hero: true,
    "stage-readup": true,
    "skill-breakdown": true,
    resources: true,
    "deep-dive": true,
    "improvement-plan": true,
    jobs: true,
  };

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-foreground/10">
      <div className="container mx-auto px-6 py-20 max-w-5xl space-y-24">
        
        {/* AI Priority Message */}
        {layoutStrategy && layoutStrategy.priority_message && !isLoadingLayout && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Alert className="border-primary/20 bg-primary/5">
              <Sparkles className="h-4 w-4 text-primary" />
              <AlertDescription className="text-sm font-medium">
                {layoutStrategy.priority_message}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Dynamic Sections */}
        {sectionOrder.map((sectionId) => {
          const shouldShow = sectionVisibility[sectionId] !== false;
          const section = sections[sectionId as keyof typeof sections];
          
          if (!shouldShow || !section) return null;
          
          return section;
        })}

        {/* Footer Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12 pb-20"
        >
          <Button
            variant="outline"
            size="lg"
            className="rounded-full px-8 border-foreground/20 hover:bg-foreground/5 text-foreground/80 font-semibold"
            onClick={() => console.log('Download report')}
          >
            <Download className="w-4 h-4 mr-2" />
            Save Report
          </Button>
          
          <Button
            size="lg"
            className="rounded-full px-8 bg-foreground text-background hover:bg-foreground/90 font-bold"
            onClick={onRestart}
          >
            Retake Assessment
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>

      </div>
    </div>
  );
});

export default ResultsPage;
