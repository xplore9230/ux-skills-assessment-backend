import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import illustrationImage from "@assets/Gemini_Generated_Image_x6n1ydx6n1ydx6n1_1763725243475.jpeg";

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage = memo(function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="border-b border-border"
      >
        <div className="container mx-auto px-6 py-4">
          {/* Navigation content removed */}
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-6"
        >
          <img 
            src={illustrationImage} 
            alt="UX Skills Assessment - Discover your career stage with personalized insights and recommendations" 
            className="w-full max-w-2xl rounded-lg"
            loading="eager"
            fetchPriority="high"
            data-testid="landing-illustration"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto space-y-6"
        >
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4 text-center"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight" data-testid="text-hero-title">
              <>Find Your <motion.span 
                className="font-playfair font-bold italic relative inline-block"
              >
                UX Career
                <motion.span
                  className="absolute bottom-0 h-[2px] bg-current"
                  initial={{ left: "0%", y: 0, opacity: 0, width: "0%" }}
                  animate={{
                    left: ["0%", "0%", "100%"],
                    y: 0,
                    opacity: [0, 1, 1],
                    width: ["0%", "100%", "0%"]
                  }}
                  transition={{ 
                    duration: 1.2, 
                    delay: 1, 
                    ease: "easeInOut",
                    times: [0, 0.5, 1]
                  }}
                />
              </motion.span> Stage</>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              Take a comprehensive skills assessment to discover where you stand and what to focus on next in your UX career journey.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="flex justify-center pt-6"
          >
            <Button
              size="lg"
              className="text-lg px-10 py-7 rounded-xl group shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                onClick={() => onStart()}
              data-testid="button-start-quiz"
            >
              Take the UX Quiz
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" aria-hidden="true" />
            </Button>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-3 text-center pt-6"
          >
            <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wide">What you'll discover:</p>
            {/* Showcase colorful animated tags */}
            <div className="flex gap-2 flex-wrap justify-center mb-4">
              {["UX Research", "Design Systems", "User Testing", "Prototyping", "Accessibility"].map((tag, idx) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs font-medium"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <ul className="space-y-2 text-muted-foreground inline-flex flex-col items-start gap-3 max-w-md">
              <motion.li 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="flex items-start gap-3"
              >
                <span className="text-primary flex-shrink-0 text-lg">✓</span>
                <span>Your current career stage from Explorer to Strategic Lead</span>
              </motion.li>
              <motion.li 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="flex items-start gap-3"
              >
                <span className="text-primary flex-shrink-0 text-lg">✓</span>
                <span>Detailed breakdown across 5 key skill areas</span>
              </motion.li>
              <motion.li 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="flex items-start gap-3"
              >
                <span className="text-primary flex-shrink-0 text-lg">✓</span>
                <span>Personalized 4-week improvement plan</span>
              </motion.li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
});

export default LandingPage;
