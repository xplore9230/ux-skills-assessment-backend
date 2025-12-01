import { memo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import QuizMobile from "./quiz-mobile";
import QuizDesktop from "./quiz-desktop";
import type { Question } from "@/types";

interface QuizPageProps {
  questions: Question[];
  onComplete: (answers: Record<string, number>) => void;
  onBack: () => void;
  onHalfwayComplete?: (partialAnswers: Record<string, number>) => void;
}

const QuizPage = memo(function QuizPage({ questions, onComplete, onBack, onHalfwayComplete }: QuizPageProps) {
  const isMobile = useIsMobile();

  // Render appropriate component based on screen size
  if (isMobile) {
    return (
      <QuizMobile
        questions={questions}
        onComplete={onComplete}
        onBack={onBack}
        onHalfwayComplete={onHalfwayComplete}
      />
    );
  }

  return (
    <QuizDesktop
      questions={questions}
      onComplete={onComplete}
      onBack={onBack}
      onHalfwayComplete={onHalfwayComplete}
    />
  );
});

export default QuizPage;
