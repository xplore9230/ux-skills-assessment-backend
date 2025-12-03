import type { UnlockType } from "@/context/PremiumAccessContext";

export interface PaywallEntryMeta {
  title: string;
  body: string;
  ctaLabel: string;
}

export const PAYWALL_ENTRIES: Record<UnlockType, PaywallEntryMeta> = {
  resources: {
    title: "Unlock Full Access",
    body: "Go beyond the basics with curated advanced content.",
    ctaLabel: "Unlock",
  },
  roadmap: {
    title: "Unlock Full Access",
    body: "Get the complete action plan with clear weekly goals.",
    ctaLabel: "Unlock",
  },
  todos: {
    title: "Unlock Full Access",
    body: "See exactly what to work on next to level up faster.",
    ctaLabel: "Unlock",
  },
  diagnosis: {
    title: "Stuck despite your score?",
    body: "Get a personalised breakdown of why you're stuck and how to move up.",
    ctaLabel: "Analyse my frustration (Premium)",
  },
  "design-system": {
    title: "Unlock Full Access",
    body: "Access in-depth guides, frameworks, and expert references.",
    ctaLabel: "Unlock",
  },
};


