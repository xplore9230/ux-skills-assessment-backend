import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import AnswerOption from "@/components/AnswerOption";

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
                  <p className="text-sm font-semibold uppercase tracking-wide">
                    {currentQuestion.category}
                  </p>
                  <h2 className="text-2xl md:text-3xl font-bold leading-tight" data-testid="text-question">
                    {currentQuestion.text}
                  </h2>
                </div>

                <div className="space-y-2 md:space-y-3 lg:space-y-4">
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
}
