import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface PremiumLockProps {
  title: string;
  description: string;
  features: string[];
}

export const PremiumLock = memo(function PremiumLock({
  title,
  description,
  features,
}: PremiumLockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <div className="h-full p-8 rounded-xl bg-muted/10 border border-border/40 flex flex-col justify-between space-y-6 text-center relative overflow-hidden">
        <div className="space-y-4 relative z-10">
          <h3 className="font-serif font-bold text-2xl">{title}</h3>
          <p className="text-muted-foreground font-light text-base leading-relaxed">
            {description}
          </p>

          <ul className="text-sm text-muted-foreground space-y-2 pt-2">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-center justify-center gap-2">
                <span className="w-1 h-1 rounded-full bg-foreground/40" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-4 relative z-10">
          <Button className="w-full gap-2 bg-foreground text-background hover:bg-foreground/90 font-semibold">
            Unlock Report
            <Sparkles className="w-3 h-3" />
          </Button>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-3 opacity-60">
            One-time payment • $19
          </p>
        </div>
      </div>
    </motion.div>
  );
});

export default PremiumLock;
