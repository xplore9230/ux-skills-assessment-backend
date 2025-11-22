import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

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
    >
      <Button
        variant={isSelected ? "default" : "outline"}
        className={`w-full h-auto py-3 px-4 md:py-4 md:px-6 rounded-full text-left justify-start transition-all ${
          isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-card border-card-border hover:bg-primary hover:text-primary-foreground hover:border-primary"
        }`}
        onClick={onClick}
        data-testid={`option-${value}`}
      >
        <span className="flex gap-3 md:gap-4 w-full">
          <span className={`flex-shrink-0 text-sm md:text-base font-semibold font-mono pt-0.5 ${isSelected ? "" : "text-muted-foreground"}`}>
            {value}
          </span>
          <span className="flex-1 text-sm md:text-base leading-relaxed">{label}</span>
        </span>
      </Button>
    </motion.div>
  );
}
