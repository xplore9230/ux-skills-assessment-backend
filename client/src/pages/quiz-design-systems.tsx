import { useState, useMemo, useCallback, memo, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, CheckCircle2, XCircle } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import AnswerOption from "@/components/AnswerOption";
import type { LearningQuestion } from "@/types";

interface DesignSystemsQuizPageProps {
  questions: LearningQuestion[];
  onComplete: (answers: Record<string, number>, questions: LearningQuestion[]) => void;
  onBack: () => void;
  onHalfwayComplete?: (partialAnswers: Record<string, number>) => void;
}

const DesignSystemsQuizPage = memo(function DesignSystemsQuizPage({ 
  questions, 
  onComplete, 
  onBack, 
  onHalfwayComplete 
}: DesignSystemsQuizPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [direction, setDirection] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const halfwayTriggeredRef = useRef(false);

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
          <p className="text-muted-foreground">Loading question...</p>
          <Button onClick={onBack} className="mt-4">Back to Home</Button>
        </div>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex === questions.length - 1;
  const userAnswer = answers[currentQuestion.id];
  const hasAnswer = userAnswer !== undefined;
  const isCorrect = hasAnswer && userAnswer === currentQuestion.correctAnswerIndex;
  
  // Reset feedback state when question changes
  useEffect(() => {
    // Show feedback if answer exists for current question
    setShowFeedback(hasAnswer);
  }, [currentIndex, hasAnswer]);

  // Check if we're halfway through
  useEffect(() => {
    if (onHalfwayComplete && !halfwayTriggeredRef.current && currentIndex >= Math.floor(questions.length / 2)) {
      halfwayTriggeredRef.current = true;
      onHalfwayComplete(answers);
    }
  }, [currentIndex, questions.length, answers, onHalfwayComplete]);

  const handleAnswer = useCallback((value: number) => {
    // Don't allow changing answer once selected for this question
    if (hasAnswer) return;
    
    const updatedAnswers = {
      ...answers,
      [currentQuestion.id]: value
    };
    
    setAnswers(updatedAnswers);
    setShowFeedback(true);
    
    // Auto-advance after showing feedback and explanation
    // Give user time to read the explanation (4 seconds)
    const delay = 4000;
    
    if (isLastQuestion) {
      // On last question, auto-submit after delay
      setTimeout(() => {
        onComplete(updatedAnswers, questions);
      }, delay);
    } else {
      // Advance to next question after delay
      setTimeout(() => {
        setDirection(1);
        setCurrentIndex(prevIndex => Math.min(prevIndex + 1, questions.length - 1));
      }, delay);
    }
  }, [currentQuestion.id, isLastQuestion, onComplete, questions, answers, hasAnswer]);

  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      // Submit quiz
      onComplete(answers);
    } else {
      setDirection(1);
      setCurrentIndex(prev => Math.min(prev + 1, questions.length - 1));
    }
  }, [isLastQuestion, answers, onComplete, questions.length]);

  const handlePrevious = useCallback(() => {
    if (!isFirstQuestion) {
      setDirection(-1);
      setCurrentIndex(prev => Math.max(prev - 1, 0));
    }
  }, [isFirstQuestion]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
      scale: 0.95
    })
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Design Systems Quiz</h1>
          <p className="text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar value={progress} />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Card className="p-6 md:p-8 mb-8">
              <h2 className="text-xl md:text-2xl font-semibold mb-6 leading-relaxed">
                {currentQuestion.text}
              </h2>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = userAnswer === option.value;
                  const isCorrectAnswer = index === currentQuestion.correctAnswerIndex;
                  const showCorrect = showFeedback && isCorrectAnswer;
                  const showWrong = showFeedback && isSelected && !isCorrect;
                  
                  return (
                    <motion.div
                      key={option.value}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <AnswerOption
                        value={option.value}
                        label={option.label}
                        isSelected={isSelected}
                        onClick={() => handleAnswer(option.value)}
                        disabled={showFeedback}
                        className={showFeedback ? (
                          showCorrect ? "!bg-green-500/20 !border-green-500" :
                          showWrong ? "!bg-red-500/20 !border-red-500" :
                          isCorrectAnswer ? "!bg-green-500/10 !border-green-500/50" :
                          ""
                        ) : ""}
                      />
                    </motion.div>
                  );
                })}
              </div>
              
              {/* Feedback and Explanation */}
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`mt-6 p-4 rounded-lg border-2 ${
                    isCorrect 
                      ? "bg-green-500/10 border-green-500/50" 
                      : "bg-red-500/10 border-red-500/50"
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    {isCorrect ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h3 className={`font-semibold text-lg mb-2 ${
                        isCorrect ? "text-green-400" : "text-red-400"
                      }`}>
                        {isCorrect ? "Correct!" : "Incorrect"}
                      </h3>
                      <p className="text-foreground/90 leading-relaxed">
                        {currentQuestion.explanation}
                      </p>
                      {currentQuestion.relatedSection && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Related: {currentQuestion.relatedSection}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation - Only Previous button, auto-advance on answer selection */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstQuestion}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            {hasAnswer ? "✓ Answer saved" : "Select an answer to continue"}
          </div>
        </div>
      </div>
    </div>
  );
});

export default DesignSystemsQuizPage;

