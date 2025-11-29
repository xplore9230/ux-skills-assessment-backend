/**
 * Score Hero Section
 * 
 * Displays the main score gauge and stage badge.
 * Uses count-up animation for score display.
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getStageColorClass, getStageBgClass } from "@/lib/results/scoring";
import type { ScoreHeroData } from "@/lib/results/types";

interface ScoreHeroProps {
  data: ScoreHeroData;
}

/**
 * Animated counter hook
 */
function useCountUp(end: number, duration: number = 1500) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function (ease out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  
  return count;
}

export default function ScoreHero({ data }: ScoreHeroProps) {
  const { totalScore } = data;
  const animatedScore = useCountUp(totalScore);
  
  return (
    <div className="relative flex flex-col items-center justify-center text-center min-h-[350px] md:min-h-[500px] overflow-visible">
      {/* Aura Background with Rotating Orb */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
        <div className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px] flex items-center justify-center">
          {/* Rotating Orb */}
          <img 
            src="/orb.webp" 
            alt="" 
            className="absolute inset-0 w-full h-full object-contain opacity-70"
            style={{ animation: "spin-slow 20s linear infinite" }}
          />
          
          {/* White transparency gradient in center */}
          <div className="absolute inset-0 rounded-full bg-radial-gradient from-background via-transparent to-transparent w-full h-full scale-75" />
        </div>
      </div>
      
      {/* Score Display */}
      <div className="relative z-10 flex flex-col items-center justify-center mb-2">
        <span className="font-playfair text-[120px] md:text-[200px] font-bold text-foreground leading-[0.8] tracking-tight">
          {animatedScore}
        </span>
      </div>
    </div>
  );
}


