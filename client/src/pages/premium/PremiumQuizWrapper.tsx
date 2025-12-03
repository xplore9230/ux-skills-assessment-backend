import { useNavigate } from "react-router-dom";
import { useQuizQuestions } from "@/hooks/useQuizQuestions";
import PremiumQuizPage from "./quiz-premium";

export default function PremiumQuizWrapper() {
  const navigate = useNavigate();
  const questions = useQuizQuestions();

  const handleBack = () => {
    navigate("/");
  };

  const handleComplete = (answers: Record<string, number>) => {
    // Navigate to premium results page with answers
    navigate("/premium/results", { state: { answers } });
  };

  const handleHalfwayComplete = (partialAnswers: Record<string, number>) => {
    // Handle halfway completion if needed
    console.log("Halfway complete:", partialAnswers);
  };

  return (
    <PremiumQuizPage
      questions={questions}
      onComplete={handleComplete}
      onBack={handleBack}
      onHalfwayComplete={handleHalfwayComplete}
    />
  );
}

