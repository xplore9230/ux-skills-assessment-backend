/**
 * Results Page Entry Point
 * 
 * Orchestrates data fetching and renders the results page.
 * Receives quiz answers from router state and calculates results.
 */

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { initializeCache } from "@/lib/results/cache";
import { 
  useScoreCalculation,
  useMeaning,
  useSkillAnalysis,
  useResources,
  useDeepInsights,
  useImprovementPlan,
  useJobSearchLinks,
} from "@/hooks/results";
import { getTitleForStage, getAIInsightTeaserData } from "@/lib/results/stage-config";
import { getTopPodcastsData } from "@/data/podcasts";
import type { QuizAnswers } from "@/lib/results/types";
import ResultsPage from "./ResultsPage";

/**
 * Router state type
 */
interface LocationState {
  answers?: QuizAnswers;
}

const SHOW_MEANING_BLOCK = false;

/**
 * Results page entry component
 */
export default function ResultsEntry() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  
  // Initialize cache on mount
  useEffect(() => {
    initializeCache();
  }, []);
  
  // Get answers from router state
  const answers = state?.answers;
  
  // Calculate quiz results (client-side)
  const { results, isValid, error: scoreError } = useScoreCalculation(answers);
  
  // Track if main sections are ready (for lazy loading improvement plan)
  const [mainSectionsReady, setMainSectionsReady] = useState(false);
  
  // Redirect to home if no valid answers
  useEffect(() => {
    if (!answers || !isValid) {
      // Small delay to allow for state restoration
      const timer = setTimeout(() => {
        if (!answers || !isValid) {
          navigate("/", { replace: true });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [answers, isValid, navigate]);
  
  // Hooks are always called (with enabled flag to control fetching)
  const hasResults = !!results;
  
  // Meaning hook (AI-generated)
  const meaningHook = useMeaning({
    stage: results?.stage || "Practitioner",
    totalScore: results?.totalScore || 0,
    strongCategories: results?.strongestCategories || [],
    weakCategories: results?.weakestCategories || [],
    enabled: hasResults,
  });
  
  // Skill analysis hook (AI-generated)
  const skillAnalysisHook = useSkillAnalysis({
    categories: results?.categories || [],
    stage: results?.stage || "Practitioner",
    totalScore: results?.totalScore || 0,
    enabled: hasResults,
  });
  
  // Resources hook (knowledge bank + AI)
  const resourcesHook = useResources({
    stage: results?.stage || "Practitioner",
    totalScore: results?.totalScore || 0,
    weakCategories: results?.weakestCategories || [],
    enabled: hasResults,
  });
  
  // Deep insights hook (knowledge bank + AI)
  const deepInsightsHook = useDeepInsights({
    stage: results?.stage || "Practitioner",
    totalScore: results?.totalScore || 0,
    strongCategories: results?.strongestCategories || [],
    weakCategories: results?.weakestCategories || [],
    enabled: hasResults,
  });
  
  // Job search links hook (static)
  const jobSearchHook = useJobSearchLinks({
    stage: results?.stage || "Practitioner",
  });
  
  // Check if main sections are ready to trigger improvement plan
  useEffect(() => {
    // Only update if not already ready (prevent infinite loop)
    if (mainSectionsReady) return;
    
    // We consider sections ready if they are success OR error (meaning they are settled)
    // With the new fallbacks, they should mostly be "success" even on API failure.
    const isSettled = (status: string) => status === "success" || status === "error";
    
    if (
      isSettled(meaningHook.status) &&
      isSettled(skillAnalysisHook.status) &&
      isSettled(resourcesHook.status) &&
      isSettled(deepInsightsHook.status)
    ) {
      setMainSectionsReady(true);
    }
  }, [
    mainSectionsReady,
    meaningHook.status,
    skillAnalysisHook.status,
    resourcesHook.status,
    deepInsightsHook.status,
  ]);
  
  // Improvement plan hook (AI-generated, lazy loaded)
  const improvementPlanHook = useImprovementPlan({
    stage: results?.stage || "Practitioner",
    strongCategories: results?.strongestCategories || [],
    weakCategories: results?.weakestCategories || [],
    enabled: hasResults && mainSectionsReady,
  });
  
  // If no valid results, show nothing (will redirect)
  if (!results) {
    return null;
  }
  
  // Get static data
  const titleData = getTitleForStage(results.stage);
  const aiInsightTeaserData = getAIInsightTeaserData();
  const topPodcastsData = getTopPodcastsData();
  
  return (
    <ResultsPage
      // Core results
      quizResults={results}
      
      // Section 1: Score Hero
      scoreHero={{
        totalScore: results.totalScore,
        stage: results.stage,
      }}
      
      // Section 2A: Title (static)
      title={titleData}
      
      // Section 2B: Meaning (AI)
      meaning={SHOW_MEANING_BLOCK ? meaningHook.data : null}
      meaningStatus={SHOW_MEANING_BLOCK ? meaningHook.status : "success"}
      
      // Section 3: Skill Analysis (AI)
      skillAnalysis={skillAnalysisHook.data}
      skillAnalysisStatus={skillAnalysisHook.status}
      
      // Section 4: Curated Resources
      resources={resourcesHook.data}
      resourcesStatus={resourcesHook.status}
      
      // Section 5: Deep Insights
      deepInsights={deepInsightsHook.data}
      deepInsightsStatus={deepInsightsHook.status}
      
      // Section 6: Improvement Plan (lazy)
      improvementPlan={improvementPlanHook.data}
      improvementPlanStatus={improvementPlanHook.status}
      
      // Section 7: Top Podcasts
      topPodcasts={topPodcastsData}
      
      // Section 7: Next Role
      nextRole={jobSearchHook.data}
      
      // Section 8: AI Insight Teaser
      aiInsightTeaser={aiInsightTeaserData}
    />
  );
}


