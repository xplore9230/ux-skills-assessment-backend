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
  duration = 0.1,
}: ScoreOdometerProps) {
  const [displayScore, setDisplayScore] = useState(10);

  useEffect(() => {
    const initialValue = 10;
    const target = score;
    let start = initialValue;
    const totalFrames = Math.max(1, duration * 60);
    const increment = (target - initialValue) / totalFrames;
    
    const interval = setInterval(() => {
      start += increment;
      if ((increment >= 0 && start >= target) || (increment < 0 && start <= target)) {
        setDisplayScore(target);
        clearInterval(interval);
      } else {
        setDisplayScore(Math.max(0, Math.floor(start)));
      }
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [score, duration]);

  return (
    <div className="relative flex items-center justify-center py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex items-baseline justify-center gap-2"
      >
        <span className="font-serif text-[10rem] sm:text-[12rem] md:text-[14rem] font-bold tracking-tighter text-foreground leading-none select-none">
          {displayScore}
        </span>
        <motion.span 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: duration, duration: 0.3 }}
          className="font-serif text-[3rem] sm:text-[4rem] md:text-[5rem] font-bold text-muted-foreground/70 leading-none select-none"
        >
          /{maxScore}
        </motion.span>
      </motion.div>
    </div>
  );
});

export default ScoreOdometer;
