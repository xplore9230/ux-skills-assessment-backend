/**
 * Results Page Layout
 * 
 * Renders all 8 sections of the results page.
 * Uses existing UI patterns from the codebase.
 */

import { motion } from "framer-motion";
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
import ScoreHero from "./sections/ScoreHero";
import TitleBlock from "./sections/TitleBlock";
import MeaningBlock from "./sections/MeaningBlock";
import SkillAnalysis from "./sections/SkillAnalysis";
import CuratedResources from "./sections/CuratedResources";
import DeepInsights from "./sections/DeepInsights";
import ImprovementPlan from "./sections/ImprovementPlan";
import TopPodcasts from "./sections/TopPodcasts";
import NextRole from "./sections/NextRole";
import AIInsightTeaser from "./sections/AIInsightTeaser";

/**
 * Results page props
 */
interface ResultsPageProps {
  // Core results
  quizResults: QuizResults;
  
  // Section 1
  scoreHero: ScoreHeroData;
  
  // Section 2A
  title: TitleData;
  
  // Section 2B
  meaning: MeaningData | null;
  meaningStatus: LoadingState;
  
  // Section 3
  skillAnalysis: SkillAnalysisData | null;
  skillAnalysisStatus: LoadingState;
  
  // Section 4
  resources: CuratedResourcesData | null;
  resourcesStatus: LoadingState;
  
  // Section 5
  deepInsights: DeepInsightsData | null;
  deepInsightsStatus: LoadingState;
  
  // Section 6
  improvementPlan: ImprovementPlanData | null;
  improvementPlanStatus: LoadingState;
  
  // Section 6B
  topPodcasts: TopPodcastsData;
  
  // Section 7
  nextRole: NextRoleData;
  
  // Section 8
  aiInsightTeaser: AIInsightTeaserData;
}

/**
 * Animation variants for staggered reveal
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
 * Results page component
 */
export default function ResultsPage({
  quizResults,
  scoreHero,
  title,
  meaning,
  meaningStatus,
  skillAnalysis,
  skillAnalysisStatus,
  resources,
  resourcesStatus,
  deepInsights,
  deepInsightsStatus,
  improvementPlan,
  improvementPlanStatus,
  topPodcasts,
  nextRole,
  aiInsightTeaser,
}: ResultsPageProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Main content container */}
      <motion.div
        className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12 lg:py-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Section 1: Score Hero */}
        <motion.section variants={sectionVariants} className="mb-8 md:mb-12">
          <ScoreHero data={scoreHero} />
        </motion.section>
        
        {/* Section 2A: Title Block */}
        <motion.section variants={sectionVariants} className="mb-6 md:mb-8">
          <TitleBlock data={title} />
        </motion.section>
        
        {/* Section 2B: Meaning Block (AI) */}
        <motion.section variants={sectionVariants} className="mb-12 md:mb-16">
          <MeaningBlock data={meaning} status={meaningStatus} />
        </motion.section>
        
        {/* Section 3: Skill Analysis */}
        <motion.section variants={sectionVariants} className="mb-12 md:mb-16">
          <SkillAnalysis 
            data={skillAnalysis} 
            status={skillAnalysisStatus}
            categories={quizResults.categories}
          />
        </motion.section>
        
        {/* Section 4: 3-Week Improvement Plan */}
        <motion.section variants={sectionVariants} className="mb-12 md:mb-16">
          <ImprovementPlan data={improvementPlan} status={improvementPlanStatus} />
        </motion.section>
        
        {/* Section 5: Curated Resources */}
        <motion.section variants={sectionVariants} className="mb-12 md:mb-16">
          <CuratedResources data={resources} status={resourcesStatus} />
        </motion.section>
        
        {/* Section 6: Deep Insights */}
        <motion.section variants={sectionVariants} className="mb-12 md:mb-16">
          <DeepInsights data={deepInsights} status={deepInsightsStatus} />
        </motion.section>
        
        {/* Section 7: Top Podcasts */}
        <motion.section variants={sectionVariants} className="mb-12 md:mb-16">
          <TopPodcasts data={topPodcasts} />
        </motion.section>
        
        {/* Section 8: Next Role */}
        <motion.section variants={sectionVariants} className="mb-12 md:mb-16">
          <NextRole data={nextRole} />
        </motion.section>
        
        {/* Section 9: AI Insight Teaser */}
        <motion.section variants={sectionVariants} className="mb-8">
          <AIInsightTeaser data={aiInsightTeaser} />
        </motion.section>
      </motion.div>
    </div>
  );
}


