import {
  Sparkles,
  Zap,
  Crown,
  Compass,
  type LucideIcon,
} from "lucide-react";

export function getStageIcon(stage: string): LucideIcon {
  switch (stage.toLowerCase()) {
    case "explorer":
      return Compass;
    case "practitioner":
      return Zap;
    case "emerging senior":
      return Crown;
    case "strategic lead":
      return Sparkles;
    default:
      return Compass;
  }
}

export function getStageColor(stage: string): string {
  switch (stage.toLowerCase()) {
    case "explorer":
      return "text-blue-600 dark:text-blue-400";
    case "practitioner":
      return "text-amber-600 dark:text-amber-400";
    case "emerging senior":
      return "text-purple-600 dark:text-purple-400";
    case "strategic lead":
      return "text-rose-600 dark:text-rose-400";
    default:
      return "text-foreground";
  }
}

export function getStageBgColor(stage: string): string {
  switch (stage.toLowerCase()) {
    case "explorer":
      return "bg-blue-50 dark:bg-blue-950";
    case "practitioner":
      return "bg-amber-50 dark:bg-amber-950";
    case "emerging senior":
      return "bg-purple-50 dark:bg-purple-950";
    case "strategic lead":
      return "bg-rose-50 dark:bg-rose-950";
    default:
      return "bg-muted";
  }
}
