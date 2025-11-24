import { useState, useMemo, useCallback, memo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import AnswerOption from "@/components/AnswerOption";
import StackedCard from "@/components/StackedCard";
import type { Question } from "@/types";

interface QuizDesktopProps {
  questions: Question[];
  onComplete: (answers: Record<string, number>) => void;
  onBack: () => void;
  onHalfwayComplete?: (partialAnswers: Record<string, number>) => void;
}

const QuizDesktop = memo(function QuizDesktop({ questions, onComplete, onBack, onHalfwayComplete }: QuizDesktopProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [shouldAnimateExit, setShouldAnimateExit] = useState(false);
  const [exitingQuestionId, setExitingQuestionId] = useState<string | null>(null);
  const halfwayTriggeredRef = useRef(false);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const cardContentRef = useRef<HTMLDivElement>(null);

  // Guard against empty or invalid questions array
  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No questions available.</p>
          <Button onClick={onBack} className="mt-4">Back to Home</Button>
        </div>
      </div>
    );
  }

  // Ensure currentIndex is within bounds
  useEffect(() => {
    const safeIndex = Math.max(0, Math.min(currentIndex, questions.length - 1));
    if (currentIndex !== safeIndex) {
      setCurrentIndex(safeIndex);
    }
  }, [currentIndex, questions.length]);

  const currentQuestion = useMemo(() => {
    const safeIndex = Math.max(0, Math.min(currentIndex, questions.length - 1));
    return questions[safeIndex];
  }, [questions, currentIndex]);
  
  // Guard against undefined currentQuestion
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Question not found.</p>
          <Button onClick={onBack} className="mt-4">Back to Home</Button>
        </div>
      </div>
    );
  }

  const isLastQuestion = useMemo(() => {
    const safeIndex = Math.max(0, Math.min(currentIndex, questions.length - 1));
    return safeIndex === questions.length - 1;
  }, [currentIndex, questions.length]);
  
  const canGoNext = useMemo(() => currentQuestion?.id && answers[currentQuestion.id] !== undefined, [answers, currentQuestion?.id]);
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
    
    // Auto-advance to next question after a short delay
    if (isLastQuestion) {
      // Auto-submit on last question
      setTimeout(() => {
        onComplete(updatedAnswers);
      }, 500);
      return;
    }
    // Advance to next question with animation
    setTimeout(() => {
      setExitingQuestionId(currentQuestion.id);
      setShouldAnimateExit(true);
      // Wait a frame to ensure state is set, then change index
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setCurrentIndex((prev) => prev + 1);
          // Reset after animation completes (400ms exit + 300ms delay = 700ms)
          setTimeout(() => {
            setShouldAnimateExit(false);
            setExitingQuestionId(null);
          }, 700);
        });
      });
    }, 300);
  }, [answers, currentQuestion.id, isLastQuestion, onComplete]);

  const handleNext = useCallback(() => {
    if (isLastQuestion && canGoNext) {
      onComplete(answers);
    } else if (canGoNext) {
      setExitingQuestionId(currentQuestion.id);
      setShouldAnimateExit(true);
      // Wait a frame to ensure state is set, then change index
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setCurrentIndex((prev) => prev + 1);
          // Reset after animation completes (400ms exit + 300ms delay = 700ms)
          setTimeout(() => {
            setShouldAnimateExit(false);
            setExitingQuestionId(null);
          }, 700);
        });
      });
    }
  }, [isLastQuestion, canGoNext, onComplete, answers]);

  const handlePrevious = useCallback(() => {
    if (canGoPrevious) {
      setShouldAnimateExit(false); // No animation for previous
      setCurrentIndex((prev) => prev - 1);
    } else {
      onBack();
    }
  }, [canGoPrevious, onBack]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div style={{ marginBottom: "60px" }}>
            <ProgressBar current={currentIndex + 1} total={questions.length} />
          </div>

          {/* Card Container - Desktop: full width, 1.0 scale */}
          <div ref={cardContainerRef} className="relative scale-100 origin-center w-full" style={{ height: "600px", maxHeight: "600px", marginBottom: "60px" }}>
            {/* Placeholder cards behind (3 cards) */}
            {[1, 2, 3].map((index) => (
              <StackedCard
                key={`placeholder-${index}`}
                isPlaceholder={true}
                stackIndex={index}
              />
            ))}

            {/* Main card with question content */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                ref={cardContentRef}
                key={currentQuestion.id}
                layout={false}
                initial={false}
                animate={{ 
                  x: 0, 
                  opacity: 1, 
                  zIndex: 10,
                }}
                exit={
                  shouldAnimateExit && exitingQuestionId === currentQuestion.id
                    ? {
                        x: "-100%",
                        opacity: 0,
                        zIndex: 0,
                        transition: {
                          x: { duration: 0.4, ease: [0.42, 0, 1, 1] }, // ease in
                          opacity: { duration: 0.4, ease: [0.42, 0, 1, 1] }, // ease in
                        },
                      }
                    : { opacity: 0, transition: { duration: 0 } }
                }
                transition={{
                  delay: shouldAnimateExit && exitingQuestionId !== currentQuestion.id ? 0.3 : 0, // 300ms delay before new card appears
                  duration: 0, // No animation for new card, instant appearance
                }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "600px",
                  maxHeight: "600px",
                  borderRadius: "24px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid rgba(0, 0, 0, 0.04)",
                  boxShadow: "0px 1px 164px 0px rgba(0, 0, 0, 0.1)",
                  willChange: "transform",
                  overflowY: "auto",
                }}
                className="md:rounded-[50px] p-6 lg:p-12 block space-y-6 lg:space-y-8"
              >
                <div className="space-y-4 text-left">
                  <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {currentQuestion.category}
                  </p>
                  <h2 id="question-text" className="text-2xl lg:text-3xl font-bold leading-tight" data-testid="text-question">
                    {currentQuestion.text}
                  </h2>
                </div>

                <div 
                  role="radiogroup" 
                  aria-labelledby="question-text"
                  className="space-y-3 lg:space-y-4 w-full"
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
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between" style={{ marginTop: "60px" }}>
            <Button
              variant="ghost"
              onClick={handlePrevious}
              className="gap-2"
              data-testid="button-previous"
            >
              <ChevronLeft className="w-4 h-4" />
              {currentIndex === 0 ? "Back to Home" : "Previous"}
            </Button>

            <div className="text-sm text-muted-foreground">
              {canGoNext ? "✓ Answer saved" : "Select an answer to continue"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default QuizDesktop;

