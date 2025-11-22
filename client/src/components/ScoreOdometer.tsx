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
  duration = 0.8,
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-center gap-2"
    >
      <div className="font-mono font-bold text-8xl leading-none w-32 text-center tabular-nums">
        {String(displayScore).padStart(2, "0")}
      </div>

      <div className="text-2xl text-muted-foreground font-mono">
        <p>/ {maxScore}</p>
      </div>
    </motion.div>
  );
}
