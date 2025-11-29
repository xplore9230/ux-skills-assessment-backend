import { memo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Sparkle, ShareNetwork, ChartBar, Briefcase, Brain } from "@phosphor-icons/react";

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage = memo(function LandingPage({ onStart }: LandingPageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let animationFrameId: number;
    let lastTimestamp: number = 0;

    const reversePlayback = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      
      const deltaTime = (timestamp - lastTimestamp) / 1000; // Convert ms to seconds
      lastTimestamp = timestamp;

      // Decrement current time
      // We can adjust the multiplier to control reverse speed if needed (e.g., * 1.0)
      video.currentTime = Math.max(0, video.currentTime - deltaTime);

      if (video.currentTime > 0) {
        animationFrameId = requestAnimationFrame(reversePlayback);
      } else {
        // Reached the start, play forward again
        video.play().catch(console.error); // catch play errors
      }
    };

    const handleEnded = () => {
      // Video finished playing forward
      video.pause();
      lastTimestamp = 0; // Reset timestamp for the new animation loop
      animationFrameId = requestAnimationFrame(reversePlayback);
    };

    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('ended', handleEnded);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-14 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-8 md:mb-6"
        >
          <video 
            ref={videoRef}
            src="/Landing.mov"
            className="w-full max-w-2xl rounded-lg"
            autoPlay
            muted
            playsInline
            data-testid="landing-video"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto space-y-5 md:space-y-4"
        >
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-5 md:space-y-4 text-center"
          >
            {/* Powered by Ollama Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center justify-center gap-2 mb-5 md:mb-4"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-background/50 backdrop-blur-sm">
                <Brain weight="duotone" className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">AI + RAG enhanced recommendations</span>
              </div>
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-none md:leading-tight" data-testid="text-hero-title">
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
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground leading-normal md:leading-relaxed">
              Take a comprehensive skills assessment to discover where you stand and what to focus on next in your UX career journey.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="flex justify-center pt-4 md:pt-2"
          >
            <Button
              size="lg"
              className="text-base md:text-lg px-8 md:px-10 py-6 md:py-7 rounded-xl group shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                onClick={() => onStart()}
              data-testid="button-start-quiz"
            >
              Take the UX Quiz
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" aria-hidden="true" />
            </Button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="pt-8 md:pt-12 max-w-4xl mx-auto"
          >
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="text-2xl md:text-3xl font-bold text-foreground text-center mb-4 md:mb-6"
            >
              What You'll Learn
            </motion.h2>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
                {[
                  {
                    icon: Sparkle,
                    title: "AI Feedback",
                    description: "Personalized AI feedback on your UX skills and performance",
                    delay: 0.9,
                  },
                  {
                    icon: ShareNetwork,
                    title: "Learning Graph",
                    description: "Curated learning graph with tailored resources and recommendations",
                    delay: 1.0,
                  },
                  {
                    icon: ChartBar,
                    title: "Score Assessment",
                    description: "AI-powered score level assessment across key skill areas",
                    delay: 1.1,
                  },
                  {
                    icon: Briefcase,
                    title: "Job Opportunities",
                    description: "Job opportunity insights matched to your skill level",
                    delay: 1.2,
                  }
                ].map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: feature.delay }}
                      className="flex items-start gap-4 group"
                    >
                      <div className="flex-shrink-0 flex items-center justify-center pt-1">
                        <Icon weight="duotone" className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-foreground mb-2 leading-tight group-hover:text-primary transition-colors duration-300">
                          {feature.title}
                        </h3>
                        <p className="text-sm md:text-base text-muted-foreground leading-normal">
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
});

export default LandingPage;
