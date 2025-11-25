import { useNavigate } from "react-router-dom";
import { useQuizQuestions } from "@/hooks/useQuizQuestions";
import { useBackgroundComputation } from "@/hooks/useBackgroundComputation";
import { calculateResults } from "@/lib/scoring";
import QuizPage from "./quiz";

export default function QuizWrapper() {
  const navigate = useNavigate();
  const questions = useQuizQuestions();
  const { startPrecomputation, cachedResults, precomputationStatus } = useBackgroundComputation();

  const handleBack = () => {
    navigate("/");
  };

  const handleComplete = (answers: Record<string, number>) => {
    // Calculate results
    const results = calculateResults(answers);
    
    // Navigate to results page with state
    // Add timestamp to detect stale data on refresh
    navigate("/results", {
      state: {
        ...results,
        cachedResults: cachedResults,
        precomputationStatus: precomputationStatus,
        timestamp: Date.now(), // Add timestamp to prevent stale data
      },
      replace: false, // Allow back navigation
    });
  };

  const handleHalfwayComplete = (partialAnswers: Record<string, number>) => {
    // Trigger background precomputation
    startPrecomputation(partialAnswers);
  };

  return (
    <QuizPage
      questions={questions}
      onComplete={handleComplete}
      onBack={handleBack}
      onHalfwayComplete={handleHalfwayComplete}
    />
  );
}

