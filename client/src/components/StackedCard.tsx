import { memo, ReactNode } from "react";
import { motion } from "framer-motion";

interface StackedCardProps {
  children?: ReactNode;
  isPlaceholder?: boolean;
  stackIndex?: number; // 0 = top card, 1-3 = placeholder cards behind
  className?: string;
  isMobile?: boolean; // Mobile-specific stack behavior
}

const StackedCard = memo(function StackedCard({
  children,
  isPlaceholder = false,
  stackIndex = 0,
  className = "",
  isMobile = false,
}: StackedCardProps) {
  // Mobile: Clean stack with minimal offsets
  // Desktop: Rotated fanned-out cards
  if (isMobile) {
    // Mobile stack: stackIndex 1 = directly behind (0px), stackIndex 2 = 10px offset
    const offsetX = stackIndex === 1 ? 0 : stackIndex === 2 ? 10 : 0;
    const offsetY = stackIndex === 1 ? 0 : stackIndex === 2 ? 10 : 0;
    
    return (
      <motion.div
        className={`absolute ${className}`}
        style={{
          top: 0,
          left: 0,
          right: 0,
          height: "100%",
          borderRadius: "24px",
          backgroundColor: "#FFFFFF",
          border: "1px solid rgba(0, 0, 0, 0.04)",
          boxShadow: "0px 1px 164px 0px rgba(0, 0, 0, 0.1)",
          transform: `translate(${offsetX}px, ${offsetY}px)`,
          transformOrigin: "center center",
          opacity: 1,
          willChange: "transform",
          pointerEvents: isPlaceholder ? "none" : "auto",
          zIndex: stackIndex === 1 ? 1 : 0,
        }}
        initial={false}
      >
        {children}
      </motion.div>
    );
  }

  // Desktop: Original rotated fanned-out behavior
  const rotation = stackIndex === 1 ? -5 : stackIndex === 2 ? 5 : stackIndex === 3 ? 0 : 0;
  const offsetY = stackIndex === 3 ? 0 : stackIndex * 4;
  const offsetX = stackIndex === 3 ? 0 : stackIndex * 3;

  return (
    <motion.div
      className={`absolute md:rounded-[50px] ${className}`}
      style={{
        top: 0,
        left: 0,
        right: 0,
        height: "600px",
        maxHeight: "600px",
        borderRadius: "24px",
        backgroundColor: "#FFFFFF",
        border: "1px solid rgba(0, 0, 0, 0.04)",
        boxShadow: "0px 1px 164px 0px rgba(0, 0, 0, 0.1)",
        transform: `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg)`,
        transformOrigin: "center center",
        opacity: 1,
        willChange: "transform",
        pointerEvents: isPlaceholder ? "none" : "auto",
      }}
      initial={false}
    >
      {children}
    </motion.div>
  );
});

export default StackedCard;

