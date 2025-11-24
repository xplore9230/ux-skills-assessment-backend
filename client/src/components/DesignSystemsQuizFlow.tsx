import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DesignSystemsQuizPage from "@/pages/quiz-design-systems";
import LoadingResultsPage from "@/pages/loading-results";
import LearningResultsPage from "@/pages/results-design-systems-learning";
import { getDesignSystemQuestions, clearDesignSystemQuestionsCache } from "@/data/designSystemQuestions";
import { calculateLearningQuizScore } from "@/lib/designSystemLearningScoring";
import type { AppState } from "@/types";
import type { LearningQuestion } from "@/types";
import type { LearningQuizResult } from "@/lib/designSystemLearningScoring";

export function DesignSystemsQuizFlow() {
  const navigate = useNavigate();
  const [appState, setAppState] = useState<AppState>("quiz");
  const [questions, setQuestions] = useState<LearningQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<LearningQuizResult | null>(null);
  const [loadingStartTime, setLoadingStartTime] = useState(0);
  const [criticalDataLoaded, setCriticalDataLoaded] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  // Load questions on mount
  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoadingQuestions(true);
        const loadedQuestions = await getDesignSystemQuestions();
        setQuestions(loadedQuestions);
      } catch (error) {
        console.error("Failed to load questions:", error);
      } finally {
        setLoadingQuestions(false);
      }
    }
    loadQuestions();
  }, []);

  const handleCompleteQuiz = useCallback(async (
    userAnswers: Record<string, number>,
    quizQuestions: LearningQuestion[]
  ) => {
    // Calculate learning quiz results
    const calculatedResult = calculateLearningQuizScore(userAnswers, quizQuestions);
    setAnswers(userAnswers);
    setResult(calculatedResult);
    setAppState("loading-results");
    setLoadingStartTime(Date.now());
    setCriticalDataLoaded(false);
    
    // Simulate loading time (can be removed or adjusted)
    setTimeout(() => {
      setCriticalDataLoaded(true);
    }, 1500);
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setAppState("results");
  }, []);

  const handleRestart = useCallback(() => {
    setResult(null);
    setAnswers({});
    setCriticalDataLoaded(false);
    setLoadingStartTime(0);
    setQuestions([]);
    clearDesignSystemQuestionsCache();
    navigate("/");
  }, [navigate]);

  const handleBackToLanding = useCallback(() => {
    navigate("/");
  }, [navigate]);

  if (loadingQuestions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (appState === "quiz") {
    return (
      <DesignSystemsQuizPage
        questions={questions}
        onComplete={handleCompleteQuiz}
        onBack={handleBackToLanding}
      />
    );
  }

  if (appState === "loading-results" && result) {
    return (
      <LoadingResultsPage
        onComplete={handleLoadingComplete}
        stage={result.performanceLevel}
        precomputationStatus="cached"
      />
    );
  }

  if (appState === "results" && result && questions.length > 0) {
    return (
      <LearningResultsPage
        result={result}
        questions={questions}
        answers={answers}
        onRestart={handleRestart}
      />
    );
  }

  return null;
}

