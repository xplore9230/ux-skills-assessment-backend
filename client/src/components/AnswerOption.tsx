import { motion } from "framer-motion";

interface AnswerOptionProps {
  value: number;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

export default function AnswerOption({
  value,
  label,
  isSelected,
  onClick,
}: AnswerOptionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-2 md:gap-3 lg:gap-4 items-start w-full cursor-pointer"
      onClick={onClick}
      data-testid={`option-${value}`}
    >
      <span className={`flex-shrink-0 font-semibold font-mono pt-1.5 md:pt-2 lg:pt-2 text-xs md:text-sm lg:text-base min-w-fit ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
        {value}
      </span>
      
      <div className="flex-1 flex items-start gap-3 py-1 md:py-1.5 lg:py-2">
        <div className={`flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-all mt-0.5 md:mt-0.5 ${
          isSelected ? "border-primary bg-primary" : "border-muted-foreground"
        }`}>
          {isSelected && <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-background rounded-full" />}
        </div>
        <span className="text-xs md:text-sm lg:text-base leading-snug md:leading-relaxed break-words whitespace-normal flex-1">
          {label}
        </span>
      </div>
    </motion.div>
  );
}
