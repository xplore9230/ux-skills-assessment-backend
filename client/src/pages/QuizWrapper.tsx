import { useNavigate } from "react-router-dom";
import { useQuizQuestions } from "@/hooks/useQuizQuestions";
import QuizPage from "./quiz";

export default function QuizWrapper() {
  const navigate = useNavigate();
  const questions = useQuizQuestions();

  const handleBack = () => {
    navigate("/");
  };

  const handleComplete = (answers: Record<string, number>) => {
    // Navigate to results page with answers
    navigate("/results", { state: { answers } });
  };

  const handleHalfwayComplete = (partialAnswers: Record<string, number>) => {
    // TODO: Handle halfway completion if needed
    console.log("Halfway complete:", partialAnswers);
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

