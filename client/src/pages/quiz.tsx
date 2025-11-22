import { useState, useMemo, useCallback, memo, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import AnswerOption from "@/components/AnswerOption";
import type { Question } from "@/types";

interface QuizPageProps {
  questions: Question[];
  onComplete: (answers: Record<string, number>) => void;
  onBack: () => void;
  onHalfwayComplete?: (partialAnswers: Record<string, number>) => void;
}

const QuizPage = memo(function QuizPage({ questions, onComplete, onBack, onHalfwayComplete }: QuizPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [direction, setDirection] = useState(0);
  const halfwayTriggeredRef = useRef(false);

  const currentQuestion = useMemo(() => questions[currentIndex], [questions, currentIndex]);
  const isLastQuestion = useMemo(() => currentIndex === questions.length - 1, [currentIndex, questions.length]);
  const canGoNext = useMemo(() => answers[currentQuestion.id] !== undefined, [answers, currentQuestion.id]);
  const canGoPrevious = useMemo(() => currentIndex > 0, [currentIndex]);
  
  // Calculate progress percentage
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const progressPercentage = useMemo(() => (answeredCount / questions.length) * 100, [answeredCount, questions.length]);

  // Trigger precomputation when user reaches 50% completion
  useEffect(() => {
    if (
      !halfwayTriggeredRef.current &&
      progressPercentage >= 50 &&
      answeredCount >= Math.ceil(questions.length / 2) &&
      onHalfwayComplete
    ) {
      halfwayTriggeredRef.current = true;
      console.log(`🚀 Triggering precomputation at ${Math.round(progressPercentage)}% (${answeredCount}/${questions.length} answers)`);
      onHalfwayComplete(answers);
    }
  }, [progressPercentage, answeredCount, questions.length, answers, onHalfwayComplete]);

  const handleAnswer = useCallback((value: number) => {
    const updatedAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(updatedAnswers);
    
    // Immediately advance to next question
    if (isLastQuestion) {
      // Auto-complete on last question
      // Add a small delay to let the user see their selection
      setTimeout(() => {
        onComplete(updatedAnswers);
      }, 300);
      return;
    }
    setDirection(1);
    setCurrentIndex((prev) => prev + 1);
  }, [answers, currentQuestion.id, isLastQuestion, onComplete]);

  const handleNext = useCallback(() => {
    if (isLastQuestion && canGoNext) {
      onComplete(answers);
    } else if (canGoNext) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [isLastQuestion, canGoNext, onComplete, answers]);

  const handlePrevious = useCallback(() => {
    if (canGoPrevious) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    } else {
      onBack();
    }
  }, [canGoPrevious, onBack]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <ProgressBar current={currentIndex + 1} total={questions.length} />

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentQuestion.id}
              custom={direction}
              initial={{ opacity: 0, x: direction * 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -50 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-3 md:p-6 lg:p-12 space-y-4 md:space-y-6 lg:space-y-8 bg-card border">
                <div className="space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {currentQuestion.category}
                  </p>
                  <h2 id="question-text" className="text-2xl md:text-3xl font-bold leading-tight" data-testid="text-question">
                    {currentQuestion.text}
                  </h2>
                </div>

                <div 
                  role="radiogroup" 
                  aria-labelledby="question-text"
                  className="space-y-2 md:space-y-3 lg:space-y-4"
                >
                  {currentQuestion.options.map((option) => (
                    <AnswerOption
                      key={option.value}
                      value={option.value}
                      label={option.label}
                      isSelected={answers[currentQuestion.id] === option.value}
                      onClick={() => handleAnswer(option.value)}
                    />
                  ))}
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between pt-4">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              className="gap-2"
              data-testid="button-previous"
            >
              <ChevronLeft className="w-4 h-4" />
              {currentIndex === 0 ? "Back to Home" : "Previous"}
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canGoNext}
              className="gap-2"
              data-testid="button-next"
            >
              {isLastQuestion ? "View Results" : "Next"}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default QuizPage;
