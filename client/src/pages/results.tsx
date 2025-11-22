import { memo, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import WeekCard from "@/components/WeekCard";
import DeepDiveSection from "@/components/DeepDiveSection";
import ScoreOdometer from "@/components/ScoreOdometer";
import CategoryCard from "@/components/CategoryCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { useResultsData } from "@/hooks/useResultsData";
import type { CategoryScore, ImprovementWeek } from "@/types";
import type { PrecomputedResults } from "@/hooks/useBackgroundComputation";

// Helper function to clean resource descriptions
// Now handles contextual AI-generated descriptions from backend
function cleanResourceDescription(description: string | undefined, title: string): string {
  if (!description) return `Explore ${title} to improve your UX skills.`;
  
  // If description is already clean and contextual (from AI), use it as-is
  // Check if it looks like an AI-generated contextual description
  const isContextual = description.length > 30 && 
    !description.includes('* [') && 
    !description.includes('](http') &&
    !description.includes('English Español');
  
  if (isContextual) {
    return description.length > 150 ? description.slice(0, 147) + '...' : description;
  }
  
  // Otherwise, clean markdown formatting
  let cleaned = description
    .replace(/\*\s*\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links, keep text
    .replace(/\*\s*/g, '') // Remove asterisks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove any remaining markdown links
    .replace(/!\[[^\]]*\]\([^\)]+\)/g, '') // Remove images
    .replace(/=+/g, '') // Remove separator lines
    .replace(/^\d+\s+/, '') // Remove leading numbers
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  // Check if it's just a list of languages
  const languagePattern = /^(English|Español|Francais|عربي|中文|日本語)[\s\w\s\.,]*$/i;
  if (languagePattern.test(cleaned) || cleaned.length < 20) {
    return `Learn about ${title} - Available in multiple languages.`;
  }
  
  // Return cleaned description (limit to 150 chars)
  return cleaned.length > 150 ? cleaned.slice(0, 147) + '...' : cleaned;
}

// Helper function to extract domain from URL
function extractSource(url: string | undefined): string {
  if (!url) return '';
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return domain.split('.')[0] || '';
  } catch {
    return '';
  }
}

interface ResultsPageProps {
  stage: string;
  totalScore: number;
  maxScore: number;
  summary: string;
  categories: CategoryScore[];
  improvementPlan: ImprovementWeek[];
  onRestart: () => void;
  cachedResults?: PrecomputedResults | null;
}

const ResultsPage = memo(function ResultsPage({
  stage,
  totalScore,
  maxScore,
  summary,
  categories,
  improvementPlan,
  onRestart,
  cachedResults,
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
  } = useResultsData(stage, categories, totalScore, maxScore, cachedResults);

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
        className="flex flex-col items-center text-center space-y-10 py-8"
      >
        {/* Date/ID Badge */}
        <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground tracking-widest uppercase opacity-60">
          <span>{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          <span className="w-1 h-1 rounded-full bg-foreground/20" />
          <span>Assessment #{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</span>
        </div>

        <div className="relative">
          {/* Decorative Blur Behind */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <ScoreOdometer score={totalScore} maxScore={maxScore} duration={0.1} />
        </div>

        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="space-y-2">
            <h2 className="text-sm md:text-base uppercase tracking-[0.2em] text-muted-foreground font-medium">
              Assessed Level
            </h2>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-foreground tracking-tight leading-none">
              {stage}
            </h1>
          </div>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium border-l-2 border-primary/20 pl-6 py-2 italic">
            "{summary}"
          </p>
        </div>
      </motion.div>
    ),

    "stage-readup": stageReadup || isLoadingResources ? (
      stageReadup ? (
        <motion.div
          key="stage-readup"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto text-center border-t border-border/40 pt-16 space-y-6"
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
      <div key="skill-breakdown" className="space-y-12 border-t border-border/40 pt-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center space-y-3"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold">Skill Analysis</h2>
          <p className="text-muted-foreground font-medium">Your performance across key UX competencies</p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
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

    resources: resources.length > 0 ? (
      <div key="resources" className="space-y-8 border-t border-border/40 pt-16">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-serif font-bold">Curated Resources</h2>
          <p className="text-muted-foreground font-medium">Hand-picked for your specific skill gaps</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((resource, index) => {
            const displayDescription = cleanResourceDescription(resource.description, resource.title);
            const source = extractSource(resource.url);
            
            return (
              <motion.a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className="group flex flex-col gap-3 p-6 rounded-2xl border border-border/40 bg-card hover:border-foreground/20 hover:shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]"
              >
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-lg group-hover:text-primary group-hover:underline transition-colors flex-1">
                      {resource.title}
                    </h3>
                    <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity mt-1" aria-hidden="true" />
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {displayDescription}
                  </p>
                  {source && (
                    <p className="text-xs text-muted-foreground/60 capitalize mt-1">
                      {source}
                    </p>
                  )}
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    ) : isLoadingResources && !resources.length ? (
      <div key="resources-loading" className="space-y-8 border-t border-border/40 pt-16 opacity-60">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-serif font-bold">Curated Resources</h2>
          <p className="text-muted-foreground font-medium">Hand-picked for your specific skill gaps</p>
          <div className="flex justify-center mt-4">
            <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" role="status" aria-label="Loading resources" />
          </div>
        </div>
      </div>
    ) : !isLoadingResources && !resources.length ? (
      <div key="resources-empty" className="space-y-8 border-t border-border/40 pt-16 text-center">
        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-serif font-bold">Curated Resources</h2>
          <p className="text-muted-foreground">
            Resources are being prepared for your profile.
          </p>
          <p className="text-sm text-muted-foreground/70">
            Check back in a moment for personalized recommendations.
          </p>
        </div>
      </div>
    ) : null,

    "deep-dive": !isLoadingDeepDive && deepDiveTopics.length > 0 ? (
      <div key="deep-dive-wrapper" className="border-t border-border/40 pt-16">
        <DeepDiveSection
          key="deep-dive"
          topics={deepDiveTopics}
          isLoading={false}
        />
      </div>
    ) : isLoadingDeepDive ? (
      <div key="deep-dive-loading" className="space-y-8 border-t border-border/40 pt-16 text-center">
        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-serif font-bold">Deeper Learning, Curated by AI</h2>
          <p className="text-muted-foreground font-medium animate-pulse">Generating personalized study paths...</p>
          <div className="flex justify-center mt-4">
            <div className="w-8 h-8 border-4 border-foreground/20 border-t-foreground rounded-full animate-spin" />
          </div>
        </div>
      </div>
    ) : null,

    "improvement-plan": (
      <div key="improvement-plan" className="space-y-12 border-t border-border/40 pt-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center space-y-3"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold">4-Week Roadmap</h2>
          <p className="text-muted-foreground font-medium">Your personalized action plan</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr hidden md:grid">
          {improvementPlan.map((week, index) => (
            <WeekCard
              key={week.week}
              week={week.week}
              tasks={week.tasks}
              delay={0.2 + index * 0.1}
            />
          ))}
        </div>

        {/* Mobile Horizontal Scroll View */}
        <div className="flex md:hidden overflow-x-auto gap-4 pb-8 -mx-6 px-6 snap-x snap-mandatory scrollbar-hide">
          {improvementPlan.map((week, index) => (
            <div key={week.week} className="min-w-[85vw] sm:min-w-[350px] snap-center h-full">
              <WeekCard
                week={week.week}
                tasks={week.tasks}
                delay={0.2 + index * 0.1}
              />
            </div>
          ))}
        </div>
      </div>
    ),

    jobs: !isLoadingJobs && jobLinks ? (
      <div key="jobs" className="space-y-8 border-t border-border/40 pt-16">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-serif font-bold">Find Your Next Role</h2>
          <p className="text-muted-foreground font-medium text-lg">
            Based on your experience, we recommend looking for 
            <span className="font-bold text-foreground mx-1">{jobLinks.job_title}</span>
            roles.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <a
            href={jobLinks.linkedin_url}
            target="_blank"
            rel="noreferrer"
            aria-label={`Search for ${jobLinks.job_title} jobs on LinkedIn (opens in new tab)`}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-foreground text-background rounded-full font-semibold hover:bg-foreground/90 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[44px]"
          >
            Search on LinkedIn
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </a>
          
          <a
            href={jobLinks.google_url}
            target="_blank"
            rel="noreferrer"
            aria-label={`Search for ${jobLinks.job_title} jobs on Google Jobs (opens in new tab)`}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-white/95 text-gray-900 rounded-full font-semibold hover:bg-white transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[44px]"
          >
            Search on Google Jobs
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    ) : isLoadingJobs ? (
      <div key="jobs-loading" className="space-y-8 border-t border-border/40 pt-16 text-center">
        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-serif font-bold">Find Your Next Role</h2>
          <p className="text-muted-foreground font-medium animate-pulse">Finding Relevant Roles...</p>
          <div className="flex justify-center mt-4">
            <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
          </div>
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
      <div className="container mx-auto px-6 py-20 max-w-5xl">
        

        {/* Dynamic Sections */}
        {sectionOrder.map((sectionId, index) => {
          const shouldShow = sectionVisibility[sectionId] !== false;
          const section = sections[sectionId as keyof typeof sections];
          
          if (!shouldShow || !section) return null;
          
          // Add spacing between sections (except first one)
          return (
            <div key={sectionId} className={index > 0 ? "mt-24" : ""}>
              {section}
            </div>
          );
        })}


      </div>
    </div>
  );
});

export default ResultsPage;
