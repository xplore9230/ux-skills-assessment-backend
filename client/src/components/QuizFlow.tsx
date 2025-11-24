import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import QuizPage from "@/pages/quiz";
import LoadingResultsPage from "@/pages/loading-results";
import ResultsPage from "@/pages/results";
import { useQuizQuestions } from "@/hooks/useQuizQuestions";
import { useBackgroundComputation } from "@/hooks/useBackgroundComputation";
import { calculateResults } from "@/lib/scoring";
import type { AppState, ResultsData, ImprovementWeek } from "@/types";
import type { PrecomputedResults } from "@/hooks/useBackgroundComputation";

export function QuizFlow() {
  const navigate = useNavigate();
  const [appState, setAppState] = useState<AppState>("quiz");
  const [results, setResults] = useState<ResultsData | null>(null);
  const [aiRoadmap, setAiRoadmap] = useState<ImprovementWeek[]>([]);
  const [resetKey, setResetKey] = useState(0);
  const [loadingStartTime, setLoadingStartTime] = useState(0);
  const [criticalDataLoaded, setCriticalDataLoaded] = useState(false);

  // Memoized questions that persist across renders
  const questions = useQuizQuestions(resetKey);

  // Background precomputation hook
  const { 
    precomputationStatus, 
    cachedResults, 
    startPrecomputation, 
    clearCache 
  } = useBackgroundComputation();

  const handleHalfwayComplete = useCallback((partialAnswers: Record<string, number>) => {
    // Start background precomputation
    startPrecomputation(partialAnswers);
  }, [startPrecomputation]);

  const handleCompleteQuiz = useCallback(async (answers: Record<string, number>) => {
    const calculatedResults = calculateResults(answers);
    setResults(calculatedResults);
    setAppState("loading-results");
    setLoadingStartTime(Date.now());
    setCriticalDataLoaded(false);
    
    // Check if we have cached precomputed results
    if (cachedResults && cachedResults.improvementPlan) {
      console.log("✅ Using cached improvement plan from precomputation");
      setAiRoadmap(cachedResults.improvementPlan);
      setCriticalDataLoaded(true);
    } else {
      // Fetch AI-generated roadmap if not cached
      console.log("⏳ Fetching improvement plan (not cached)");
      const PYTHON_API_URL = import.meta.env.VITE_PYTHON_API_URL || "http://localhost:8000";
      try {
        const response = await fetch(`${PYTHON_API_URL}/api/generate-improvement-plan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stage: calculatedResults.stage,
            totalScore: calculatedResults.totalScore,
            maxScore: calculatedResults.maxScore,
            categories: calculatedResults.categories,
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.weeks && Array.isArray(data.weeks)) {
            setAiRoadmap(data.weeks);
          } else {
            // Fallback to static plan
            setAiRoadmap(calculatedResults.improvementPlan);
          }
        } else {
          // Fallback to static plan
          setAiRoadmap(calculatedResults.improvementPlan);
        }
      } catch (error) {
        console.error("Failed to fetch AI roadmap:", error);
        // Fallback to static plan
        setAiRoadmap(calculatedResults.improvementPlan);
      } finally {
        setCriticalDataLoaded(true);
      }
    }
  }, [cachedResults]);

  const handleLoadingComplete = useCallback(() => {
    setAppState("results");
  }, []);

  const handleRestart = useCallback(() => {
    setResults(null);
    setAiRoadmap([]);
    setCriticalDataLoaded(false);
    setLoadingStartTime(0);
    clearCache();
    // Navigate back to home
    navigate("/");
    // Increment reset key to generate new questions
    setResetKey((prev) => prev + 1);
  }, [clearCache, navigate]);

  const handleBackToLanding = useCallback(() => {
    navigate("/");
  }, [navigate]);

  if (appState === "quiz") {
    return (
      <QuizPage
        questions={questions}
        onComplete={handleCompleteQuiz}
        onBack={handleBackToLanding}
        onHalfwayComplete={handleHalfwayComplete}
      />
    );
  }

  if (appState === "loading-results" && results) {
    return (
      <LoadingResultsPage
        onComplete={handleLoadingComplete}
        stage={results.stage}
        precomputationStatus={precomputationStatus}
      />
    );
  }

  if (appState === "results" && results) {
    return (
      <ResultsPage 
        {...results} 
        improvementPlan={aiRoadmap.length > 0 ? aiRoadmap : results.improvementPlan}
        onRestart={handleRestart}
        cachedResults={cachedResults}
      />
    );
  }

  return null;
}

