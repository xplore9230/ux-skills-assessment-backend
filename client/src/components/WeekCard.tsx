import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, ChevronRight, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface WeekCardProps {
  week: number;
  tasks: string[];
  delay?: number;
}

const WeekCard = memo(function WeekCard({ week, tasks, delay = 0 }: WeekCardProps) {
  // Show first 2 tasks as preview
  const previewTasks = tasks.slice(0, 2);
  const hasMore = tasks.length > 2;

  const handleTaskClick = (task: string) => {
    const searchQuery = encodeURIComponent(task);
    const googleSearchUrl = `https://www.google.com/search?q=${searchQuery}+UX+design+tutorial`;
    window.open(googleSearchUrl, '_blank');
  };

  return (
    <Sheet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="h-full flex"
      >
        <div className="h-full flex flex-col p-6 rounded-2xl border border-border/40 bg-card hover:border-foreground/20 hover:shadow-sm transition-all duration-300 w-full min-h-0 group/card relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute -right-12 -top-12 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover/card:bg-primary/10 transition-colors duration-500" />

          <div className="space-y-1 mb-4 flex-shrink-0 relative">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                Phase {Math.ceil(week / 2)}
              </span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-foreground">
              Week {week}
            </h3>
            <p className="text-xs text-muted-foreground/70">
              {tasks.length} tasks scheduled
            </p>
          </div>
          
          <div className="flex-1 min-h-0 flex flex-col relative">
            <ul className="space-y-3 flex-1">
              {previewTasks.map((task, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground/90">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary/60 flex-shrink-0" />
                  <span className="line-clamp-2 leading-relaxed">{task}</span>
                </li>
              ))}
              {hasMore && (
                <li className="text-xs text-muted-foreground/50 italic pl-4 pt-1">
                  + {tasks.length - 2} more tasks...
                </li>
              )}
            </ul>

            <div className="pt-6 mt-auto flex-shrink-0 border-t border-border/10">
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full group justify-between hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                >
                  View Full Plan
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </SheetTrigger>
            </div>
          </div>
        </div>
      </motion.div>

      <SheetContent className="w-[90%] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="mb-8 space-y-4 text-left">
          <div>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20">
              Week {week} Agenda
            </span>
          </div>
          <SheetTitle className="text-3xl md:text-4xl font-serif font-bold">Detailed Roadmap</SheetTitle>
          <SheetDescription className="text-base">
            Complete these actionable steps to master this week's UX skills. Click any task to find learning resources.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-4">
            <ListTodo className="w-4 h-4" />
            <span>{tasks.length} Tasks</span>
          </div>

          <ul className="space-y-4">
            {tasks.map((task, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <button
                  onClick={() => handleTaskClick(task)}
                  className="w-full group flex items-start gap-4 p-4 rounded-xl border border-border/40 hover:border-primary/50 hover:bg-muted/30 transition-all duration-300 text-left active:scale-[0.99]"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/5 text-primary flex items-center justify-center text-sm font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors border border-primary/10">
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm md:text-base font-medium leading-relaxed text-foreground/90 group-hover:text-foreground transition-colors">
                      {task}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground/60 group-hover:text-primary/70">
                      <span>Explore resources</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </button>
              </motion.li>
            ))}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
});

export default WeekCard;
