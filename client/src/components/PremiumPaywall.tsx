import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Lock, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { usePremiumAccess } from "@/context/PremiumAccessContext";

interface PremiumPaywallProps {
  variant?: "full" | "inline" | "modal";
  title?: string;
  description?: string;
  features?: string[];
  price?: string;
  redirectTo?: string;
}

export const PremiumPaywall = memo(function PremiumPaywall({
  variant = "full",
  title = "Unlock Premium Results",
  description = "Get full access to personalized insights, curated resources, and unlimited quiz attempts.",
  features = [
    "Comprehensive Design System PDF (150+ pages)",
    "Interactive Quiz Learning modules",
    "All curated articles and resources",
    "Deep insights and advanced content",
    "Exclusive podcasts and learning paths",
    "Interactive skill checklists",
    "Unlimited quiz attempts",
  ],
  price = "$19",
  redirectTo,
}: PremiumPaywallProps) {
  const { startCheckout, isLoading } = usePremiumAccess();

  const handleUnlock = () => {
    startCheckout(redirectTo);
  };

  if (variant === "inline") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative p-6 rounded-lg bg-gradient-to-br from-muted/20 to-muted/5 border border-border/40 backdrop-blur-sm"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-primary/10">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 space-y-2">
            <h4 className="font-semibold text-lg">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
            <Button 
              onClick={handleUnlock} 
              disabled={isLoading}
              className="mt-3 gap-2 bg-foreground text-background hover:bg-foreground/90"
            >
              Unlock Now
              <Sparkles className="w-4 h-4" />
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              One-time payment • {price}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === "modal") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto p-8 rounded-2xl bg-background border border-border shadow-2xl"
      >
        <div className="text-center space-y-6">
          <div className="inline-flex p-4 rounded-full bg-primary/10">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-serif font-bold text-2xl">{title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
          </div>

          <ul className="text-sm text-muted-foreground space-y-2 text-left">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="pt-4 space-y-3">
            <Button 
              onClick={handleUnlock} 
              disabled={isLoading}
              className="w-full gap-2 bg-foreground text-background hover:bg-foreground/90 font-semibold py-6"
            >
              {isLoading ? "Processing..." : "Unlock Premium"}
              <Sparkles className="w-4 h-4" />
            </Button>
            <p className="text-xs uppercase tracking-widest text-muted-foreground opacity-60">
              One-time payment • {price}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Full variant (default)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full min-h-[500px]"
    >
      <div className="h-full p-8 rounded-xl bg-muted/10 border border-border/40 flex flex-col justify-between space-y-6 text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        
        <div className="space-y-4 relative z-10">
          <div className="inline-flex p-4 rounded-full bg-primary/10 mb-2">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          
          <h3 className="font-serif font-bold text-2xl">{title}</h3>
          <p className="text-muted-foreground font-light text-base leading-relaxed max-w-md mx-auto">
            {description}
          </p>

          <ul className="text-sm text-muted-foreground space-y-2 pt-4">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-4 relative z-10">
          <Button 
            onClick={handleUnlock} 
            disabled={isLoading}
            className="w-full gap-2 bg-foreground text-background hover:bg-foreground/90 font-semibold py-6"
          >
            {isLoading ? "Processing..." : "Unlock Premium"}
            <Sparkles className="w-4 h-4" />
          </Button>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-3 opacity-60">
            One-time payment • {price}
          </p>
        </div>
      </div>
    </motion.div>
  );
});

export default PremiumPaywall;

