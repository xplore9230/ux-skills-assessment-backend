/**
 * Premium Results Page Wrapper
 * 
 * Wraps the existing ResultsPage with premium access controls.
 * Shows inline unlock cards in the same sections as gated content.
 */

import { memo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { House } from "@phosphor-icons/react";
import { PremiumAccessProvider, usePremiumAccess } from "@/context/PremiumAccessContext";
import PremiumPaywall from "@/components/PremiumPaywall";
import type { 
  QuizResults,
  ScoreHeroData,
  TitleData,
  MeaningData,
  SkillAnalysisData,
  CuratedResourcesData,
  DeepInsightsData,
  ImprovementPlanData,
  TopPodcastsData,
  NextRoleData,
  AIInsightTeaserData,
  LoadingState,
} from "@/lib/results/types";

// Import section components
import ScoreHero from "@/pages/results/sections/ScoreHero";
import TitleBlock from "@/pages/results/sections/TitleBlock";
import MeaningBlock from "@/pages/results/sections/MeaningBlock";
import ImprovementPlan from "@/pages/results/sections/ImprovementPlan";
import NextRole from "@/pages/results/sections/NextRole";
import AIInsightTeaser from "@/pages/results/sections/AIInsightTeaser";
import PremiumDesignSystem from "@/pages/results/sections/PremiumDesignSystem";

// Import components for rendering cards manually
import { ArrowSquareOut, Clock, BookOpen, Video, Headphones, Radio, Lock, Sparkle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { CaretDown, CaretUp } from "@phosphor-icons/react";
import { AnimatePresence } from "framer-motion";
import { getBandColorClass, getBandBgClass } from "@/lib/results/scoring";
import type { CuratedResource, DeepInsight, CategoryInsight, CategoryScore } from "@/lib/results/types";

interface PremiumResultsPageProps {
  quizResults: QuizResults;
  scoreHero: ScoreHeroData;
  title: TitleData;
  meaning: MeaningData | null;
  meaningStatus: LoadingState;
  skillAnalysis: SkillAnalysisData | null;
  skillAnalysisStatus: LoadingState;
  resources: CuratedResourcesData | null;
  resourcesStatus: LoadingState;
  deepInsights: DeepInsightsData | null;
  deepInsightsStatus: LoadingState;
  improvementPlan: ImprovementPlanData | null;
  improvementPlanStatus: LoadingState;
  topPodcasts: TopPodcastsData;
  nextRole: NextRoleData;
  aiInsightTeaser: AIInsightTeaserData;
}

/**
 * Animation variants
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

/**
 * Premium gated results page component (with inline unlock cards)
 */
const PremiumGatedResultsPage = memo(function PremiumGatedResultsPage(props: PremiumResultsPageProps) {
  const { premiumUnlocked } = usePremiumAccess();
  const navigate = useNavigate();
  
  const handleGoHome = () => {
    navigate("/");
  };

  // Get resource icon
  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video size={16} weight="duotone" />;
      case "podcast":
        return <Headphones size={16} weight="duotone" />;
      default:
        return <BookOpen size={16} weight="duotone" />;
    }
  };

  // Resource card component
  const ResourceCard = ({ resource }: { resource: CuratedResource }) => (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex-shrink-0 w-72 md:w-80 rounded-xl border border-border/30 bg-card p-5 hover:border-foreground/20 transition-colors group"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/50 text-muted-foreground text-xs font-medium">
          {getResourceTypeIcon(resource.type)}
          <span className="capitalize">{resource.level}</span>
        </span>
        {resource.duration && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock size={12} weight="duotone" />
            {resource.duration}
          </span>
        )}
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-foreground/80">
        {resource.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
        {resource.summary}
      </p>
      {resource.reasonSelected && (
        <p className="text-xs text-muted-foreground/70 italic mb-4 line-clamp-2">
          "{resource.reasonSelected}"
        </p>
      )}
      <div className="flex items-center gap-1 text-sm font-medium text-foreground group-hover:text-foreground/80">
        <span>Read Now</span>
        <ArrowSquareOut size={14} weight="duotone" />
      </div>
    </a>
  );

  // Unlock card for resources (inline in carousel)
  const ResourcesUnlockCard = () => (
    <div className="flex-shrink-0 w-72 md:w-80 rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-5 flex flex-col justify-center items-center text-center min-h-[280px]">
      <div className="mb-4">
        <div className="inline-flex p-3 rounded-full bg-primary/10 mb-3">
          <Lock size={24} weight="duotone" className="text-primary" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-2">
          Unlock More Resources
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Get access to all curated articles and resources
        </p>
        <PremiumPaywall variant="inline" redirectTo="/premium/results" />
      </div>
    </div>
  );

  // Deep insight card
  const InsightCard = ({ insight }: { insight: DeepInsight }) => (
    <a
      href={insight.url}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-xl border border-border/30 bg-card p-5 hover:border-foreground/20 transition-colors group"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/50 text-muted-foreground text-xs font-medium">
          {getResourceTypeIcon(insight.type)}
          <span className="capitalize">{insight.type}</span>
        </span>
        <span className="inline-flex items-center px-2 py-1 rounded-full bg-muted/50 border border-border/30 text-muted-foreground text-xs font-medium capitalize">
          {insight.level}
        </span>
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-foreground/80">
        {insight.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
        {insight.summary}
      </p>
      {insight.whyThisForYou && (
        <p className="text-xs text-muted-foreground/70 italic mb-4 line-clamp-2">
          "{insight.whyThisForYou}"
        </p>
      )}
      <div className="flex items-center justify-between">
        {insight.duration && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock size={12} weight="duotone" />
            {insight.duration}
          </span>
        )}
        <div className="flex items-center gap-1 text-sm font-medium text-foreground group-hover:text-foreground/80">
          <span>{insight.type === "video" ? "Watch" : insight.type === "podcast" ? "Listen" : "Read"}</span>
          <ArrowSquareOut size={14} weight="duotone" />
        </div>
      </div>
    </a>
  );

  // Unlock card for deep insights (inline in grid)
  const DeepInsightsUnlockCard = () => (
    <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-5 flex flex-col justify-center items-center text-center min-h-[280px]">
      <div className="inline-flex p-3 rounded-full bg-primary/10 mb-3">
        <Lock size={24} weight="duotone" className="text-primary" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2">
        Unlock Deep Insights
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Get access to advanced strategic content
      </p>
      <PremiumPaywall variant="inline" redirectTo="/premium/results" />
    </div>
  );

  // Podcast card
  const PodcastCard = ({ podcast }: { podcast: any }) => (
    <a
      key={podcast.id}
      href={podcast.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group rounded-xl border border-border/30 bg-card p-5 hover:border-foreground/20 transition-colors"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center">
          <Radio size={20} weight="duotone" className="text-foreground" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground group-hover:text-foreground/80">
            {podcast.name}
          </h3>
          <p className="text-xs text-muted-foreground">{podcast.focus}</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        {podcast.description}
      </p>
      <div className="flex items-center gap-1 text-sm font-medium text-foreground group-hover:text-foreground/80">
        <span>Listen now</span>
        <ArrowSquareOut size={14} weight="duotone" />
      </div>
    </a>
  );

  // Unlock card for podcasts (inline in grid)
  const PodcastsUnlockCard = () => (
    <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-5 flex flex-col justify-center items-center text-center min-h-[200px]">
      <div className="inline-flex p-3 rounded-full bg-primary/10 mb-3">
        <Lock size={24} weight="duotone" className="text-primary" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2">
        Unlock More Podcasts
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Access all curated podcast recommendations
      </p>
      <PremiumPaywall variant="inline" redirectTo="/premium/results" />
    </div>
  );

  // Skill card with limited checklist
  const SkillCard = ({ insight, category }: { insight?: CategoryInsight; category: CategoryScore }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const bandColorClass = getBandColorClass(category.band);
    const bandBgClass = getBandBgClass(category.band);
    const limitedChecklist = premiumUnlocked ? insight?.checklist : (insight?.checklist || []).slice(0, 2);
    const hasMoreItems = insight?.checklist && insight.checklist.length > 2;

    return (
      <div className="rounded-xl border border-border/30 bg-card overflow-hidden">
        <div className="p-4 md:p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-foreground">
              {category.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">
                {category.score}%
              </span>
            </div>
          </div>
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-border/30 bg-muted/50 text-muted-foreground text-sm font-medium">
            {category.band}
          </div>
          {insight && (
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              {insight.description}
            </p>
          )}
        </div>
        {insight && limitedChecklist && limitedChecklist.length > 0 && (
          <>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full px-4 md:px-6 py-3 flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <span className="text-sm font-medium text-foreground">
                Action Items ({limitedChecklist.length} {!premiumUnlocked && hasMoreItems ? `of ${insight.checklist.length}` : ''})
              </span>
              {isExpanded ? (
                <CaretUp size={16} weight="duotone" className="text-muted-foreground" />
              ) : (
                <CaretDown size={16} weight="duotone" className="text-muted-foreground" />
              )}
            </button>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 md:px-6 py-4 space-y-3 border-t border-border">
                    {limitedChecklist.map((item) => (
                      <div key={item.id} className="flex items-start gap-3">
                        <div className="mt-1 h-4 w-4 rounded border border-border flex-shrink-0" />
                        <span className="text-sm text-foreground">
                          {item.text}
                        </span>
                      </div>
                    ))}
                    {!premiumUnlocked && hasMoreItems && (
                      <div className="pt-2 mt-2 border-t border-border">
                        <PremiumPaywall 
                          variant="inline" 
                          title="Unlock Full Checklist"
                          description={`Get access to ${insight.checklist.length - 2} more action items for ${category.name}`}
                          redirectTo="/premium/results"
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    );
  };

  // Show free resources (2) + unlock card
  const freeResources = props.resources?.resources ? props.resources.resources.slice(0, 2) : [];
  const showResourcesUnlock = !premiumUnlocked && props.resources && props.resources.resources.length > 2;

  // Show free insights (1) + unlock card
  const freeInsights = props.deepInsights?.insights ? props.deepInsights.insights.slice(0, 1) : [];
  const showInsightsUnlock = !premiumUnlocked && props.deepInsights && props.deepInsights.insights.length > 1;

  // Show free podcasts (1) + unlock card
  const freePodcasts = props.topPodcasts?.podcasts ? props.topPodcasts.podcasts.slice(0, 1) : [];
  const showPodcastsUnlock = !premiumUnlocked && props.topPodcasts && props.topPodcasts.podcasts.length > 1;

  return (
    <div className="min-h-screen bg-background">
      <motion.button
        onClick={handleGoHome}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-foreground text-background shadow-lg flex items-center justify-center hover:bg-foreground/90 transition-colors"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Go to home page"
        title="Go to home"
      >
        <House size={24} weight="duotone" />
      </motion.button>

      <motion.div
        className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12 lg:py-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Section 1: Score Hero */}
        <motion.section variants={sectionVariants} className="mb-8 md:mb-12">
          <ScoreHero data={props.scoreHero} />
        </motion.section>
        
        {/* Section 2A: Title Block */}
        <motion.section variants={sectionVariants} className="mb-6 md:mb-8">
          <TitleBlock data={props.title} />
        </motion.section>
        
        {/* Section 2B: Meaning Block */}
        <motion.section variants={sectionVariants} className="mb-12 md:mb-16">
          <MeaningBlock data={props.meaning} status={props.meaningStatus} />
        </motion.section>
        
        {/* Section 3: Skill Analysis */}
        {props.skillAnalysis && (
          <motion.section variants={sectionVariants} className="mb-12 md:mb-16">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">
                Skill Analysis
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {props.skillAnalysis.insights.map((insight) => {
                  const category = props.quizResults.categories.find(c => c.name === insight.categoryName);
                  if (!category) return null;
                  return (
                    <SkillCard key={insight.categoryId} insight={insight} category={category} />
                  );
                })}
              </div>
            </div>
          </motion.section>
        )}
        
        {/* Section 4: Improvement Plan */}
        <motion.section variants={sectionVariants} className="mb-12 md:mb-16">
          <ImprovementPlan data={props.improvementPlan} status={props.improvementPlanStatus} />
        </motion.section>
        
        {/* Section 4.5: Premium Design System (Premium Exclusive) */}
        <motion.section variants={sectionVariants} className="mb-12 md:mb-16">
          <PremiumDesignSystem isPremium={premiumUnlocked} />
        </motion.section>
        
        {/* Section 5: Curated Resources (with inline unlock card) */}
        {props.resourcesStatus !== "loading" && props.resourcesStatus !== "idle" && props.resources && (
          <motion.section variants={sectionVariants} className="mb-12 md:mb-16 overflow-visible">
            <div className="overflow-visible">
              <div className="mb-6 text-center">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                  Start Here – Build Your Core UX Foundations
                </h2>
                <p className="text-sm text-muted-foreground">
                  Curated based on your weakest skill areas
                </p>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-8 pt-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent" style={{ overflowY: 'visible', minHeight: 'fit-content' }}>
                {premiumUnlocked 
                  ? props.resources.resources.map((resource) => (
                      <ResourceCard key={resource.id} resource={resource} />
                    ))
                  : (
                    <>
                      {freeResources.map((resource) => (
                        <ResourceCard key={resource.id} resource={resource} />
                      ))}
                      {showResourcesUnlock && <ResourcesUnlockCard />}
                    </>
                  )
                }
              </div>
            </div>
          </motion.section>
        )}
        
        {/* Section 6: Deep Insights (with inline unlock card) */}
        {props.deepInsightsStatus !== "loading" && props.deepInsightsStatus !== "idle" && props.deepInsights && (
          <motion.section variants={sectionVariants} className="mb-12 md:mb-16">
            <div>
              <div className="mb-6 text-center">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                  Deep Insights to Level Up
                </h2>
                <p className="text-sm text-muted-foreground">
                  Advanced resources to accelerate your UX career
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {premiumUnlocked
                  ? props.deepInsights.insights.map((insight) => (
                      <InsightCard key={insight.id} insight={insight} />
                    ))
                  : (
                    <>
                      {freeInsights.map((insight) => (
                        <InsightCard key={insight.id} insight={insight} />
                      ))}
                      {showInsightsUnlock && <DeepInsightsUnlockCard />}
                    </>
                  )
                }
              </div>
            </div>
          </motion.section>
        )}
        
        {/* Section 7: Top Podcasts (with inline unlock card) */}
        {props.topPodcasts && props.topPodcasts.podcasts.length > 0 && (
          <motion.section variants={sectionVariants} className="mb-12 md:mb-16">
            <div>
              <div className="mb-6 flex flex-col gap-2 items-center text-center">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2 md:mb-1">
                    Top Podcasts to Stay Sharp
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Follow these shows to keep new ideas, leadership lessons, and practical tips on rotation.
                  </p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {premiumUnlocked
                  ? props.topPodcasts.podcasts.map((podcast) => (
                      <PodcastCard key={podcast.id} podcast={podcast} />
                    ))
                  : (
                    <>
                      {freePodcasts.map((podcast) => (
                        <PodcastCard key={podcast.id} podcast={podcast} />
                      ))}
                      {showPodcastsUnlock && <PodcastsUnlockCard />}
                    </>
                  )
                }
              </div>
            </div>
          </motion.section>
        )}
        
        {/* Section 8: Next Role */}
        <motion.section variants={sectionVariants} className="mb-12 md:mb-16">
          <NextRole data={props.nextRole} />
        </motion.section>
        
        {/* Section 9: AI Insight Teaser */}
        <motion.section variants={sectionVariants} className="mb-8">
          <AIInsightTeaser data={props.aiInsightTeaser} />
        </motion.section>
      </motion.div>
    </div>
  );
});

/**
 * Inner component that uses premium context
 */
const PremiumResultsContent = memo(function PremiumResultsContent(props: PremiumResultsPageProps) {
  const { premiumUnlocked, isLoading } = usePremiumAccess();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex p-4 rounded-full bg-primary/10 animate-pulse">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground">Loading your results...</p>
        </motion.div>
      </div>
    );
  }

  // Always show the gated version (it handles premium vs free internally)
  return <PremiumGatedResultsPage {...props} />;
});

/**
 * Wrapper component that provides premium context
 */
const PremiumResultsPage = memo(function PremiumResultsPage(props: PremiumResultsPageProps) {
  return (
    <PremiumAccessProvider>
      <PremiumResultsContent {...props} />
    </PremiumAccessProvider>
  );
});

export default PremiumResultsPage;
