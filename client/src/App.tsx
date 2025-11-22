import { useState, useCallback } from "react";
import { MotionConfig } from "framer-motion";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "@/pages/landing";
import QuizPage from "@/pages/quiz";
import LoadingResultsPage from "@/pages/loading-results";
import ResultsPage from "@/pages/results";
import { useQuizQuestions } from "@/hooks/useQuizQuestions";
import { useBackgroundComputation } from "@/hooks/useBackgroundComputation";
import { calculateResults } from "@/lib/scoring";
import type { AppState, ResultsData, ImprovementWeek } from "@/types";

function App() {
  const [appState, setAppState] = useState<AppState>("landing");
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

  const handleStartQuiz = useCallback(() => {
    setAppState("quiz");
  }, []);

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
    setAppState("landing");
    // Clear precomputation cache
    clearCache();
    // Increment reset key to generate new questions
    setResetKey((prev) => prev + 1);
  }, [clearCache]);

  const handleBackToLanding = useCallback(() => {
    setAppState("landing");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <TooltipProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-foreground focus:text-background focus:rounded-lg focus:font-semibold focus:shadow-lg"
          >
            Skip to main content
          </a>
          <Toaster />
          <main id="main-content">
            {appState === "landing" && <LandingPage onStart={handleStartQuiz} />}
            {appState === "quiz" && (
              <QuizPage
                questions={questions}
                onComplete={handleCompleteQuiz}
                onBack={handleBackToLanding}
                onHalfwayComplete={handleHalfwayComplete}
              />
            )}
            {appState === "loading-results" && results && (
              <LoadingResultsPage
                onComplete={handleLoadingComplete}
                stage={results.stage}
                precomputationStatus={precomputationStatus}
              />
            )}
            {appState === "results" && results && (
              <ResultsPage 
                {...results} 
                improvementPlan={aiRoadmap.length > 0 ? aiRoadmap : results.improvementPlan}
                onRestart={handleRestart}
                cachedResults={cachedResults}
              />
            )}
          </main>
        </TooltipProvider>
      </MotionConfig>
    </QueryClientProvider>
  );
}

export default App;
