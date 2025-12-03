import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "@phosphor-icons/react";
import type { UnlockType } from "@/context/PremiumAccessContext";
import { loadResult, getMostRecentResultId } from "@/lib/results/storage";
import React, { useEffect, useState } from "react";

interface PaywallModalProps {
  isOpen: boolean;
  unlockType: UnlockType | null;
  onClose: () => void;
  onConfirm: (unlockType: UnlockType) => void;
}

/**
 * Get user's score from localStorage results
 */
function getUserScore(): number | null {
  try {
    // Try to get from URL if on results page
    const pathParts = window.location.pathname.split("/results/");
    if (pathParts.length > 1) {
      const resultId = pathParts[1].split("?")[0];
      if (resultId) {
        const stored = loadResult(resultId);
        if (stored?.results?.totalScore !== undefined) {
          return stored.results.totalScore;
        }
      }
    }
    // Fallback: find most recent result
    const recentId = getMostRecentResultId();
    if (recentId) {
      const stored = loadResult(recentId);
      if (stored?.results?.totalScore !== undefined) {
        return stored.results.totalScore;
      }
    }
  } catch (e) {
    console.warn("Could not retrieve score:", e);
  }
  return null;
}

const copyByType: Record<
  UnlockType,
  { bullets: string[]; primaryCta: string }
> = {
  resources: {
    bullets: [
      "2-Week personalised improvement plan",
      "Deep dive learning paths & resources",
      "Advanced Knowledge Hub access",
      "Skill-wise strengths, gaps & next steps",
    ],
    primaryCta: "Unlock @ ₹499 Only",
  },
  roadmap: {
    bullets: [
      "2-Week personalised improvement plan",
      "Deep dive learning paths & resources",
      "Advanced Knowledge Hub access",
      "Skill-wise strengths, gaps & next steps",
    ],
    primaryCta: "Unlock @ ₹499 Only",
  },
  todos: {
    bullets: [
      "2-Week personalised improvement plan",
      "Deep dive learning paths & resources",
      "Advanced Knowledge Hub access",
      "Skill-wise strengths, gaps & next steps",
    ],
    primaryCta: "Unlock @ ₹499 Only",
  },
  diagnosis: {
    bullets: [
      "2-Week personalised improvement plan",
      "Deep dive learning paths & resources",
      "Advanced Knowledge Hub access",
      "Skill-wise strengths, gaps & next steps",
    ],
    primaryCta: "Unlock @ ₹499 Only",
  },
  "design-system": {
    bullets: [
      "2-Week personalised improvement plan",
      "Deep dive learning paths & resources",
      "Advanced Knowledge Hub access",
      "Skill-wise strengths, gaps & next steps",
    ],
    primaryCta: "Unlock @ ₹499 Only",
  },
};

export default function PaywallModal({
  isOpen,
  unlockType,
  onClose,
  onConfirm,
}: PaywallModalProps) {
  const details = unlockType ? copyByType[unlockType] : null;
  const [score, setScore] = useState<number | null>(null);
  const [animatedScore, setAnimatedScore] = useState(0);

  // Get user's score when modal opens
  useEffect(() => {
    if (isOpen) {
      const userScore = getUserScore();
      setScore(userScore);
      setAnimatedScore(0);
      
      // Animate score from 0 to actual score
      if (userScore !== null) {
        const duration = 1000;
        const startTime = Date.now();
        const startScore = 0;
        const endScore = userScore;
        
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(startScore + (endScore - startScore) * eased);
          
          setAnimatedScore(current);
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        
        requestAnimationFrame(animate);
      }
    }
  }, [isOpen]);

  const displayScore = score !== null ? animatedScore : 73; // Default fallback

  return (
    <AnimatePresence>
      {isOpen && unlockType && details && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Backdrop with blur */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden="true"
          />

          {/* Dialog - Click stops propagation */}
          <motion.div
            className="relative z-[101] w-full max-w-[420px] rounded-[20px] bg-white shadow-[0_25px_50px_rgba(0,0,0,0.25)] overflow-hidden"
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 10, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="paywall-title"
          >
            {/* Background gradient orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {/* First orb */}
              <div 
                className="absolute left-1/2 -translate-x-1/2 -top-[136px] w-[882px] h-[269px]"
                style={{
                  borderRadius: '50%',
                  background: 'rgba(203, 222, 255, 0.60)',
                  filter: 'blur(87px)',
                }}
              />
              {/* Second orb */}
              <div 
                className="absolute left-1/2 -translate-x-1/2 -top-[178px] w-[768px] h-[294px]"
                style={{
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.90)',
                  filter: 'blur(107px)',
                }}
              />
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-50 h-10 w-10 inline-flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
              aria-label="Close"
            >
              <X size={20} weight="bold" />
            </button>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center px-4 pt-6 pb-6 md:px-6 md:pt-8 md:pb-8">
              {/* Orb with Score */}
              <motion.div
                className="relative flex items-center justify-center mb-4 md:mb-6"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
              >
                {/* Rotating Orb Background */}
                <div className="relative w-[160px] h-[160px] md:w-[205px] md:h-[205px] flex items-center justify-center overflow-visible">
                  {/* Outer glow effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-200/30 via-purple-200/20 to-transparent blur-2xl scale-150" />
                  
                  {/* Rotating Orb */}
                  <img 
                    src="/orb.webp" 
                    alt="" 
                    className="absolute inset-0 w-full h-full object-contain opacity-70"
                    style={{ animation: "spin-slow 20s linear infinite" }}
                  />
                  
                  {/* White gradient overlay - covers 80% of orb */}
                  <div 
                    className="absolute inset-0 rounded-full w-full h-full scale-[0.8]"
                    style={{
                      background: "radial-gradient(circle at center, transparent 30%, rgba(255,255,255,0.4) 60%, rgba(255,255,255,0.5) 100%)",
                    }}
                  />
                  
                  {/* Score Number */}
                  <motion.span
                    className="relative z-10 font-bold text-[56px] md:text-[72px] lg:text-[80px] text-foreground leading-none tracking-tight"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5, type: "spring", stiffness: 200, damping: 15 }}
                  >
                    {displayScore}
                  </motion.span>
                </div>
              </motion.div>

              {/* Title */}
              <motion.h3
                id="paywall-title"
                className="text-[18px] md:text-[20px] font-bold text-black mb-1.5 md:mb-2 text-center px-2"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                Unlock Your Full UX Growth Plan
              </motion.h3>

              {/* Subtitle */}
              <motion.p
                className="text-[12px] md:text-[14px] font-normal text-black text-center px-2 mb-5 md:mb-8 leading-relaxed"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                You've got a strong base. Unlock a focused plan to move to the next level.
              </motion.p>

              {/* What will you get */}
              <motion.div
                className="relative w-full px-2 mb-6 md:mb-8"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                {/* Badge overlapping the top */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-3 z-10">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-blue-50 shadow-sm text-[11px] md:text-[12px] font-medium text-black whitespace-nowrap">
                    What will you get
                  </span>
                </div>
                
                {/* Blue box with reduced height */}
                <div className="rounded-xl border border-blue-50 bg-blue-50/30 p-3 md:p-4 pt-5 md:pt-6">
                  <ul className="space-y-1.5 md:space-y-2 text-[12px] md:text-[14px] font-normal text-black">
                  {details.bullets.map((bullet, i) => (
                    <motion.li
                      key={i}
                      className="flex items-start gap-2.5"
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.3 }}
                    >
                      <span className="flex-shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-black" />
                      <span className="leading-snug">{bullet}</span>
                    </motion.li>
                  ))}
                  </ul>
                </div>
              </motion.div>

              {/* CTA Button */}
              <motion.div
                className="w-full px-2"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.4 }}
              >
                <button
                  onClick={() => onConfirm(unlockType)}
                  className="w-full h-[60px] md:h-[86px] bg-black rounded-[16px] md:rounded-[20px] flex items-center justify-center hover:bg-black/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="text-[14px] md:text-[18px] font-medium text-white">
                    {details.primaryCta}
                  </span>
                </button>
              </motion.div>

              {/* Secondary CTA */}
              <motion.button
                className="mt-3 md:mt-4 text-[11px] md:text-sm text-gray-600 hover:text-gray-800 transition-colors"
                onClick={onClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.3 }}
              >
                I'll explore the free version first
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
