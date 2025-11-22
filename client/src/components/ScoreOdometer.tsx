import { useEffect, useState, memo } from "react";
import { motion } from "framer-motion";

interface ScoreOdometerProps {
  score: number;
  maxScore: number; 
  duration?: number;
}

const ScoreOdometer = memo(function ScoreOdometer({
  score,
  maxScore,
  duration = 0.5, // Faster default
}: ScoreOdometerProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = score / (duration * 60);
    const interval = setInterval(() => {
      start += increment;
      if (start >= score) {
        setDisplayScore(score);
        clearInterval(interval);
      } else {
        setDisplayScore(Math.floor(start));
      }
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [score, duration]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center"
    >
      <div className="relative flex items-baseline gap-2">
        <span className="font-serif text-8xl md:text-9xl font-bold tracking-tighter text-foreground">
          {displayScore}
        </span>
        <span className="text-xl md:text-2xl text-muted-foreground font-medium">
          / {maxScore}
        </span>
      </div>
    </motion.div>
  );
});

export default ScoreOdometer;
