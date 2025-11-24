import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { useEffect, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "@/pages/landing";
import BlogPage from "@/pages/blog.tsx";
import { QuizFlow } from "@/components/QuizFlow";
import { DesignSystemsQuizFlow } from "@/components/DesignSystemsQuizFlow";

// Conditionally load Analytics component
function ConditionalAnalytics() {
  const [AnalyticsComponent, setAnalyticsComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    // Only load Analytics in production
    if (import.meta.env.PROD) {
      import("@vercel/analytics/react")
        .then((module) => {
          setAnalyticsComponent(() => module.Analytics);
        })
        .catch((error) => {
          // Silently fail if Analytics can't be loaded (e.g., not on Vercel)
          console.warn("Vercel Analytics not available:", error);
        });
    }
  }, []);

  if (!AnalyticsComponent) {
    return null;
  }

  return <AnalyticsComponent />;
}

function LandingPageWrapper() {
  const navigate = useNavigate();
  
  const handleStartQuiz = (quizType: 'ux' | 'design-systems') => {
    if (quizType === 'design-systems') {
      navigate("/quiz-design-systems");
    } else {
      navigate("/quiz");
    }
  };

  return <LandingPage onStart={handleStartQuiz} />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <MotionConfig reducedMotion="user">
          <TooltipProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-foreground focus:text-background focus:rounded-lg focus:font-semibold focus:shadow-lg"
            >
              Skip to main content
            </a>
            <Toaster />
            <ConditionalAnalytics />
            <main id="main-content">
              <Routes>
                <Route path="/" element={<LandingPageWrapper />} />
                <Route path="/quiz" element={<QuizFlow />} />
                <Route path="/quiz-design-systems" element={<DesignSystemsQuizFlow />} />
                <Route path="/blog" element={<BlogPage />} />
              </Routes>
            </main>
          </TooltipProvider>
        </MotionConfig>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
