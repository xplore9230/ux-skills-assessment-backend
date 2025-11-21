import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function ReportPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full" />
      
      <Card className="relative p-8 space-y-6 shadow-2xl bg-card" data-testid="report-preview">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Your UX Career Stage</p>
          <h3 className="text-3xl font-bold text-foreground">Emerging Senior</h3>
        </div>
        
        <div className="flex items-center justify-center py-6">
          <div className="relative w-32 h-32">
            <svg className="transform -rotate-90 w-32 h-32">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-secondary"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(52 / 75) * 351.86} 351.86`}
                className="text-primary"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold">52/75</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            Strong in Product Thinking
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Needs work in Research
          </Badge>
        </div>
      </Card>
    </motion.div>
  );
}
