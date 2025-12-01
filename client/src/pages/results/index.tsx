/**
 * Results Page Entry Point
 * 
 * Orchestrates data fetching and renders the results page.
 * Supports two modes:
 * 1. Fresh results: Receives quiz answers from router state
 * 2. Restored results: Loads from localStorage via URL parameter
 */

import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { initializeCache } from "@/lib/results/cache";
import { 
  generateResultId, 
  saveResult, 
  loadResult 
} from "@/lib/results/storage";
import { calculateQuizResults } from "@/lib/results/scoring";
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
import type { QuizAnswers, QuizResults } from "@/lib/results/types";
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
  const { resultId } = useParams<{ resultId?: string }>();
  const state = location.state as LocationState | null;
  
  // Track if we've initialized
  const [initialized, setInitialized] = useState(false);
  
  // Store the resolved answers and results
  const [resolvedAnswers, setResolvedAnswers] = useState<QuizAnswers | null>(null);
  const [restoredResults, setRestoredResults] = useState<QuizResults | null>(null);
  
  // Initialize cache on mount
  useEffect(() => {
    initializeCache();
  }, []);
  
  // Resolve answers from either router state or localStorage
  useEffect(() => {
    if (initialized) return;
    
    // Case 1: Fresh results from quiz submission
    if (state?.answers) {
      const answers = state.answers;
      const newId = generateResultId();
      
      // Calculate results to save
      const results = calculateQuizResults(answers);
      
      // Save to localStorage
      saveResult(newId, answers, results);
      
      // Update URL without triggering navigation (replace state)
      navigate(`/results/${newId}`, { replace: true });
      
      setResolvedAnswers(answers);
      setInitialized(true);
      return;
    }
    
    // Case 2: Restored results from URL parameter
    if (resultId) {
      const stored = loadResult(resultId);
      if (stored) {
        setResolvedAnswers(stored.answers);
        setRestoredResults(stored.results);
        setInitialized(true);
        return;
      }
    }
    
    // Case 3: No valid source, redirect to home
    navigate("/", { replace: true });
    setInitialized(true);
  }, [state, resultId, navigate, initialized]);
  
  // Calculate quiz results (client-side) - only if not restored
  const { results: calculatedResults, isValid } = useScoreCalculation(
    restoredResults ? null : resolvedAnswers
  );
  
  // Use restored results if available, otherwise use calculated
  const results = restoredResults || calculatedResults;
  
  // Track if main sections are ready (for lazy loading improvement plan)
  const [mainSectionsReady, setMainSectionsReady] = useState(false);
  
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
  
  // If not initialized or no valid results, show nothing (will redirect)
  if (!initialized || !results) {
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
