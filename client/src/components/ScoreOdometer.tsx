import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ScoreOdometerProps {
  score: number;
  maxScore: number;
  duration?: number;
}

export default function ScoreOdometer({
  score,
  maxScore,
  duration = 2,
}: ScoreOdometerProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let start = -10;
    const increment = (score - (-10)) / (duration * 60);
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
    <div className="flex items-center justify-center gap-2">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-6xl font-bold font-mono tabular-nums">
          {displayScore}
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-sm text-muted-foreground font-mono"
      >
        <p>/ {maxScore}</p>
      </motion.div>
    </div>
  );
}
