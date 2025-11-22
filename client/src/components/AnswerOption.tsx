import { memo } from "react";
import { motion } from "framer-motion";

interface AnswerOptionProps {
  value: number;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

const AnswerOption = memo(function AnswerOption({
  value,
  label,
  isSelected,
  onClick,
}: AnswerOptionProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <motion.div
      role="radio"
      aria-checked={isSelected}
      tabIndex={isSelected ? 0 : -1}
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isSelected ? [1, 1.02, 1] : 1
      }}
      transition={{ 
        duration: 0.3,
        scale: { duration: 0.2 }
      }}
      className="flex gap-3 md:gap-4 items-start w-full cursor-pointer p-3 md:p-4 rounded-lg transition-all hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      data-testid={`option-${value}`}
    >
      <div className={`flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-all mt-0.5 md:mt-0.5 ${
        isSelected ? "border-primary bg-primary" : "border-muted-foreground hover:border-foreground"
      }`}>
        {isSelected && <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-background rounded-full" />}
      </div>
      <span className="text-xs md:text-sm lg:text-base leading-snug md:leading-relaxed break-words whitespace-normal flex-1">
        {label}
      </span>
    </motion.div>
  );
});

export default AnswerOption;
