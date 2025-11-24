import { memo } from "react";
import { motion } from "framer-motion";

interface AnswerOptionProps {
  value: number;
  label: string;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

const AnswerOption = memo(function AnswerOption({
  value,
  label,
  isSelected,
  onClick,
  className = "",
  disabled = false,
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
      initial={false}
      animate={{ 
        scale: isSelected ? [1, 1.02, 1] : 1
      }}
      transition={{ 
        scale: { duration: 0.2 }
      }}
      className={`flex gap-3 md:gap-4 items-start w-full p-3 md:p-4 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        disabled 
          ? "cursor-not-allowed opacity-50" 
          : "cursor-pointer hover:bg-muted/50 active:scale-95"
      } ${className}`}
      onClick={disabled ? undefined : onClick}
      onKeyDown={disabled ? undefined : handleKeyDown}
      data-testid={`option-${value}`}
    >
      <div className={`flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-all mt-0.5 md:mt-0.5 ${
        isSelected ? "border-primary bg-primary" : "border-muted-foreground hover:border-foreground"
      }`}>
        {isSelected && <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-background rounded-full" />}
      </div>
      <span className="text-xs md:text-sm lg:text-base leading-snug md:leading-relaxed break-words whitespace-normal flex-1 text-foreground">
        {label}
      </span>
    </motion.div>
  );
});

export default AnswerOption;
