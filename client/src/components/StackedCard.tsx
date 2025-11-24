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
  // Calculate rotation angles: Card 1 = -5°, Card 2 = 5°, Card 3 = 0°
  const rotation = stackIndex === 1 ? -5 : stackIndex === 2 ? 5 : stackIndex === 3 ? 0 : 0;
  // Calculate offset for stacked effect
  // Card 3 (0°) should align perfectly with top card, so no offset
  // Cards 1 and 2 (±5°) should be offset behind
  const offsetY = stackIndex === 3 ? 0 : stackIndex * 4;
  const offsetX = stackIndex === 3 ? 0 : stackIndex * 3;
  const scale = 1; // No scale reduction - all cards same size to ensure equal diagonals
  const opacity = isPlaceholder ? 1 : 1; // White cards at full opacity

  return (
    <motion.div
      className={`absolute md:rounded-[50px] ${className}`}
      style={{
        top: 0,
        left: 0,
        right: 0,
        height: "600px",
        maxHeight: "600px",
        borderRadius: "24px", // Mobile-friendly radius
        backgroundColor: "#FFFFFF",
        border: "1px solid rgba(0, 0, 0, 0.04)",
        boxShadow: "0px 1px 164px 0px rgba(0, 0, 0, 0.1)",
        transform: `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg)`,
        transformOrigin: "center center",
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

