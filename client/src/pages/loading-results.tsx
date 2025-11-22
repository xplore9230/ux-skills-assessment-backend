import { memo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";

interface LoadingResultsPageProps {
  onComplete: () => void;
  stage: string;
}

const messages = [
  "Analyzing your responses...",
  "Generating personalized insights...",
  "Building your custom roadmap...",
  "Finding relevant opportunities...",
  "Preparing your results..."
];

const LoadingResultsPage = memo(function LoadingResultsPage({
  onComplete,
  stage,
}: LoadingResultsPageProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loaderAnimation, setLoaderAnimation] = useState<any>(null);

  // Load Lottie animation
  useEffect(() => {
    fetch("/loader.json")
      .then((res) => res.json())
      .then((data) => setLoaderAnimation(data))
      .catch((err) => console.error("Failed to load animation:", err));
  }, []);

  useEffect(() => {
    // Cycle through messages
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => {
        if (prev < messages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1500);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 95) {
          return prev + 5;
        }
        return prev;
      });
    }, 200);

    // Minimum display time of 3 seconds, then complete
    const completeTimer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        onComplete();
      }, 500);
    }, 3000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full px-6 text-center space-y-8">
        {/* Lottie Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-64 h-64 mx-auto"
        >
          {loaderAnimation ? (
            <Lottie
              animationData={loaderAnimation}
              loop={true}
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          )}
        </motion.div>

        {/* Messages */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.h2
              key={currentMessageIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="text-2xl md:text-3xl font-serif font-bold text-foreground"
            >
              {messages[currentMessageIndex]}
            </motion.h2>
          </AnimatePresence>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground"
          >
            Crafting your personalized {stage} roadmap
          </motion.p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="h-1 w-full bg-muted/40 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{progress}%</p>
        </div>

        {/* Subtle hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-xs text-muted-foreground/60"
        >
          Using AI to analyze your unique skill profile
        </motion.p>
      </div>
    </div>
  );
});

export default LoadingResultsPage;

