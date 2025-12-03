import { memo, useEffect } from "react";
import { useLocation } from "wouter";
import { PremiumAccessProvider, usePremiumAccess } from "@/context/PremiumAccessContext";
import QuizPage from "@/pages/quiz";
import PremiumPaywall from "@/components/PremiumPaywall";
import { motion } from "framer-motion";
import type { Question } from "@/types";

interface PremiumQuizPageProps {
  questions: Question[];
  onComplete: (answers: Record<string, number>) => void;
  onBack: () => void;
  onHalfwayComplete?: (partialAnswers: Record<string, number>) => void;
}

// Inner component that uses the premium context
const PremiumQuizContent = memo(function PremiumQuizContent({
  questions,
  onComplete,
  onBack,
  onHalfwayComplete,
}: PremiumQuizPageProps) {
  const { canTakePremiumQuiz, requirePayment, incrementAttempts, isLoading, attemptCount } = usePremiumAccess();
  const [, setLocation] = useLocation();

  // Handle quiz completion - increment attempts and navigate
  const handleComplete = async (answers: Record<string, number>) => {
    // Increment attempts before navigating to results
    await incrementAttempts();
    
    // Call the original onComplete handler
    onComplete(answers);
  };

  // Show loading state while checking access
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex p-4 rounded-full bg-primary/10 animate-pulse">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground">Checking access...</p>
        </motion.div>
      </div>
    );
  }

  // Show paywall if user has exhausted free attempts
  if (requirePayment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="font-serif font-bold text-4xl">You've Used Your Free Attempts</h1>
              <p className="text-muted-foreground text-lg">
                You've completed {attemptCount} free quiz attempts. Unlock premium to continue.
              </p>
            </div>

            {/* Paywall */}
            <PremiumPaywall
              variant="full"
              title="Unlock Unlimited Access"
              description="Get unlimited quiz attempts plus full access to personalized insights, curated resources, and advanced learning content."
              features={[
                "Comprehensive Design System PDF (150+ pages)",
                "Interactive Quiz Learning modules",
                "Unlimited quiz attempts",
                "Full personalized results and insights",
                "All curated articles and resources",
                "Deep insights and advanced content",
                "Exclusive podcasts and learning paths",
                "Interactive skill checklists",
              ]}
              redirectTo="/premium/quiz"
            />

            {/* Back button */}
            <div className="text-center pt-4">
              <button
                onClick={onBack}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to Home
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // User can take the quiz - show the normal quiz interface
  return (
    <QuizPage
      questions={questions}
      onComplete={handleComplete}
      onBack={onBack}
      onHalfwayComplete={onHalfwayComplete}
    />
  );
});

// Wrapper component that provides the premium context
const PremiumQuizPage = memo(function PremiumQuizPage(props: PremiumQuizPageProps) {
  return (
    <PremiumAccessProvider>
      <PremiumQuizContent {...props} />
    </PremiumAccessProvider>
  );
});

export default PremiumQuizPage;

