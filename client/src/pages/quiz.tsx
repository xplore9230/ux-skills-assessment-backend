import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import QuizProgressDots from "@/components/QuizProgressDots";
import RadioOption from "@/components/RadioOption";

interface Question {
  id: string;
  text: string;
  category: string;
  options: { value: number; label: string }[];
}

interface QuizPageProps {
  questions: Question[];
  onComplete: (answers: Record<string, number>) => void;
  onBack: () => void;
}

export default function QuizPage({ questions, onComplete, onBack }: QuizPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [direction, setDirection] = useState(0);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const canGoNext = answers[currentQuestion.id] !== undefined;
  const canGoPrevious = currentIndex > 0;

  const handleAnswer = (value: number) => {
    const updatedAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(updatedAnswers);
    
    // Immediately advance to next question
    if (isLastQuestion) {
      // Auto-complete on last question
      onComplete(updatedAnswers);
      return;
    }
    setDirection(1);
    setCurrentIndex(currentIndex + 1);
  };

  const handleNext = () => {
    if (isLastQuestion && canGoNext) {
      onComplete(answers);
    } else if (canGoNext) {
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (canGoPrevious) {
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
    } else {
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl perspective">
        <div className="space-y-6">
          <QuizProgressDots current={currentIndex + 1} total={questions.length} />

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentQuestion.id}
              custom={direction}
              initial={{
                opacity: 0,
                x: direction * 200,
                y: -50,
                rotateY: direction * -35,
                scale: 0.8,
              }}
              animate={{
                opacity: 1,
                x: 0,
                y: 0,
                rotateY: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                x: direction * -500,
                y: 100,
                rotateY: direction * 45,
                scale: 0.6,
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{
                perspective: 1200,
              }}
            >
              {/* Stacked card effect */}
              <div className="relative">
                {/* Back card 2 */}
                <div className="absolute inset-0 bg-card border border-border rounded-2xl transform translate-y-4 translate-x-4 shadow-lg" />
                
                {/* Back card 1 */}
                <div className="absolute inset-0 bg-card border border-border rounded-2xl transform translate-y-2 translate-x-2 shadow-md" />
                
                {/* Main card */}
                <Card className="relative p-6 md:p-8 lg:p-10 space-y-6 bg-card border-2 shadow-lg">
                  {/* Progress dots */}
                  <div className="flex gap-1.5 justify-center">
                    {Array.from({ length: questions.length }).map((_, index) => (
                      <div
                        key={index}
                        className={`h-2 rounded-full transition-all ${
                          index < currentIndex
                            ? "bg-primary w-5"
                            : index === currentIndex
                            ? "bg-primary w-5"
                            : "bg-muted w-2"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Question number */}
                  <p className="text-sm font-mono text-muted-foreground">
                    Q.{String(currentIndex + 1).padStart(2, "0")}
                  </p>

                  {/* Question text */}
                  <h2 className="text-2xl md:text-3xl font-bold leading-tight" data-testid="text-question">
                    {currentQuestion.text}
                  </h2>

                  {/* Options instruction */}
                  <p className="text-xs md:text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    SELECT ONLY 1
                  </p>

                  {/* Options */}
                  <div className="space-y-3 md:space-y-4">
                    {currentQuestion.options.map((option) => (
                      <RadioOption
                        key={option.value}
                        value={option.value}
                        label={option.label}
                        isSelected={answers[currentQuestion.id] === option.value}
                        onClick={() => handleAnswer(option.value)}
                      />
                    ))}
                  </div>

                  {/* Navigation buttons */}
                  <div className="flex items-center justify-between gap-4 pt-6 border-t border-border">
                    <Button
                      variant="ghost"
                      onClick={handlePrevious}
                      className="gap-2"
                      data-testid="button-previous"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">
                        {currentIndex === 0 ? "Back" : "Previous"}
                      </span>
                    </Button>

                    <Button
                      onClick={handleNext}
                      disabled={!canGoNext}
                      className="gap-2 ml-auto"
                      data-testid="button-next"
                    >
                      <span className="hidden sm:inline">
                        {isLastQuestion ? "View Results" : "Next"}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
