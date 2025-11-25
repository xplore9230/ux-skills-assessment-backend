import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LoadingResultsPage from "./loading-results";
import ResultsPage from "./results";
import type { CategoryScore, ImprovementWeek } from "@/types";
import type { PrecomputedResults, PrecomputationStatus } from "@/hooks/useBackgroundComputation";

interface ResultsLocationState {
  stage: string;
  totalScore: number;
  maxScore: number;
  summary: string;
  categories: CategoryScore[];
  improvementPlan: ImprovementWeek[];
  cachedResults?: PrecomputedResults | null;
  precomputationStatus?: PrecomputationStatus;
  timestamp?: number; // Timestamp to detect stale data
}

// Validate that state has all required fields
function isValidResultsState(state: any): state is ResultsLocationState {
  return (
    state &&
    typeof state.stage === "string" &&
    typeof state.totalScore === "number" &&
    typeof state.maxScore === "number" &&
    typeof state.summary === "string" &&
    Array.isArray(state.categories) &&
    Array.isArray(state.improvementPlan)
  );
}

export default function ResultsWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLoading, setShowLoading] = useState(true);

  // Get results from location state
  const rawState = location.state as ResultsLocationState | null;

  // Validate state structure and check for stale data
  useEffect(() => {
    if (!rawState || !isValidResultsState(rawState)) {
      // Invalid or missing state - redirect to home
      navigate("/", { replace: true });
      return;
    }

    // Check for stale data (older than 1 hour)
    if (rawState.timestamp) {
      const age = Date.now() - rawState.timestamp;
      const oneHour = 60 * 60 * 1000;
      if (age > oneHour) {
        // Stale data - redirect to home
        navigate("/", { replace: true });
        return;
      }
    }
  }, [rawState, navigate]);

  // If no valid state, don't render anything
  if (!rawState || !isValidResultsState(rawState)) {
    return null;
  }

  const state = rawState;

  // If no state, don't render anything
  if (!state) {
    return null;
  }

  const handleRestart = () => {
    navigate("/quiz");
  };

  const handleLoadingComplete = () => {
    setShowLoading(false);
  };

  // Show loading page first, then results
  if (showLoading) {
    return (
      <LoadingResultsPage
        onComplete={handleLoadingComplete}
        stage={state.stage}
        precomputationStatus={state.precomputationStatus || 'idle'}
      />
    );
  }

  return (
    <ResultsPage
      stage={state.stage}
      totalScore={state.totalScore}
      maxScore={state.maxScore}
      summary={state.summary}
      categories={state.categories}
      improvementPlan={state.improvementPlan}
      onRestart={handleRestart}
      cachedResults={state.cachedResults || null}
    />
  );
}

