import { memo, ReactNode } from "react";
import { motion } from "framer-motion";

interface StackedCardProps {
  children?: ReactNode;
  isPlaceholder?: boolean;
  stackIndex?: number; // 0 = top card, 1-3 = placeholder cards behind
  className?: string;
}

const StackedCard = memo(function StackedCard({
  children,
  isPlaceholder = false,
  stackIndex = 0,
  className = "",
}: StackedCardProps) {
  // Calculate rotation angles: -5deg, +5deg, 0deg for the 3 placeholder cards
  const rotation = stackIndex === 1 ? -5 : stackIndex === 2 ? 5 : stackIndex === 3 ? 0 : 0;
  // Calculate offset for stacked effect
  const offsetY = stackIndex * 3;
  const offsetX = stackIndex * 2;
  const scale = 1 - stackIndex * 0.02; // Slight scale reduction for depth
  const opacity = isPlaceholder ? 1 : 1; // White cards at full opacity

  return (
    <motion.div
      className={`absolute inset-0 md:rounded-[50px] ${className}`}
      style={{
        borderRadius: "24px", // Mobile-friendly radius
        backgroundColor: "#FFFFFF",
        border: "1px solid rgba(0, 0, 0, 0.04)",
        boxShadow: "0px 1px 164px 0px rgba(0, 0, 0, 0.1)",
        transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale}) rotate(${rotation}deg)`,
        opacity,
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

