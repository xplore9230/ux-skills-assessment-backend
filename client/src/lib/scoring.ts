import { allQuestions } from "@/data/questions";
import type { CategoryScore, ImprovementWeek } from "@/types";

interface StageResult {
  stage: string;
  summary: string;
  improvementPlan: ImprovementWeek[];
}

export function calculateResults(answers: Record<string, number>): {
  totalScore: number;
  maxScore: number;
  categories: CategoryScore[];
  stage: string;
  summary: string;
  improvementPlan: ImprovementWeek[];
} {
  try {
    const categoryScores: Record<string, number> = {
      "UX Fundamentals": 0,
      "UI Craft & Visual Design": 0,
      "User Research & Validation": 0,
      "Product Thinking & Strategy": 0,
      "Collaboration & Communication": 0
    };

    const categoryCounts: Record<string, number> = {
      "UX Fundamentals": 0,
      "UI Craft & Visual Design": 0,
      "User Research & Validation": 0,
      "Product Thinking & Strategy": 0,
      "Collaboration & Communication": 0
    };

    // Create a map of question ID to question for quick lookup
    const questionMap = new Map(allQuestions.map(q => [q.id, q]));

    Object.entries(answers).forEach(([questionId, score]) => {
      const question = questionMap.get(questionId);
      if (question) {
        const category = question.category;
        categoryScores[category] += score;
        categoryCounts[category]++;
      }
    });

    const totalScoreRaw = Object.values(categoryScores).reduce((a, b) => a + b, 0);
    const totalQuestions = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
    const maxTotalScoreRaw = totalQuestions * 5;
    
    // Normalize total score to 0-100 scale
    // Using simple percentage: (score / max) * 100
    const normalizedTotalScore = Math.round((totalScoreRaw / maxTotalScoreRaw) * 100);

    const categories: CategoryScore[] = Object.entries(categoryScores).map(([name, score]) => {
      const count = categoryCounts[name];
      const categoryMaxScore = count * 5;
      // Calculate percentage: (raw score / max possible score) * 100
      // Math.round ensures consistent rounding (no floating point discrepancies)
      const percentage = categoryMaxScore > 0 ? Math.round((score / categoryMaxScore) * 100) : 0;
      
      return {
        name,
        score: percentage, // Return percentage as the score (0-100)
        maxScore: 100,    // Normalized to 100 for consistency
        status: percentage >= 80 ? "strong" : percentage >= 60 ? "decent" : "needs-work"
      };
    });

    const stageResult = getStageInfo(normalizedTotalScore);

    return {
      totalScore: normalizedTotalScore,
      maxScore: 100,
      categories,
      ...stageResult
    };
  } catch (error) {
    console.error("Error calculating results:", error);
    // Return default fallback results
    return {
      totalScore: 0,
      maxScore: 75,
      categories: [],
      stage: "Explorer",
      summary: "Unable to calculate results. Please try again.",
      improvementPlan: []
    };
  }
}

function getStageInfo(score: number): StageResult {
  // Thresholds based on normalized 0-100 score
  // Explorer: 0-40%
  // Practitioner: 41-65%
  // Emerging Senior: 66-85%
  // Strategic Lead: 86-100%
  
  if (score <= 40) {
    return {
      stage: "Explorer",
      summary: "You're in the early stage of your UX journey. Your main focus now is building strong fundamentals and getting hands-on with small projects.",
      improvementPlan: [
        {
          week: 1,
          tasks: [
            "Learn basic UX concepts: flows, wireframes, usability heuristics",
            "Study 3 case studies from top designers",
            "Practice sketching simple user flows"
          ]
        },
        {
          week: 2,
          tasks: [
            "Pick one app you use daily",
            "Sketch a better version of 1 flow",
            "Document your design decisions"
          ]
        },
        {
          week: 3,
          tasks: [
            "Do 2-3 user conversations with friends/family",
            "Take notes on pain points and desires",
            "Identify patterns in feedback"
          ]
        },
        {
          week: 4,
          tasks: [
            "Refine your design based on feedback",
            "Write a 1-page case study",
            "Share with design community for feedback"
          ]
        }
      ]
    };
  } else if (score <= 65) {
    return {
      stage: "Practitioner",
      summary: "You're functioning as a UX designer and can handle features with guidance. Now it's about depth: better research, visual craft, and metrics.",
      improvementPlan: [
        {
          week: 1,
          tasks: [
            "Pick one live feature from a product",
            "Write a problem statement + success metric",
            "Map out the current user flow"
          ]
        },
        {
          week: 2,
          tasks: [
            "Talk to 3-5 users about the feature",
            "Synthesise insights into themes",
            "Create 2-3 design variations"
          ]
        },
        {
          week: 3,
          tasks: [
            "Push your UI craft: spacing, grids, typography",
            "Get feedback from designer peers",
            "Iterate based on critique"
          ]
        },
        {
          week: 4,
          tasks: [
            "Document it as a proper case study",
            "Present findings to team or community",
            "Reflect on what you learned"
          ]
        }
      ]
    };
  } else if (score <= 85) {
    return {
      stage: "Emerging Senior",
      summary: "You're operating at a high level, driving flows end-to-end. The next step is sharpening strategy, systems thinking, and mentorship.",
      improvementPlan: [
        {
          week: 1,
          tasks: [
            "Pick a core funnel and map it completely",
            "Identify drop-off points in the journey",
            "Research industry benchmarks"
          ]
        },
        {
          week: 2,
          tasks: [
            "Propose 2-3 experiments for improvements",
            "Create detailed test plans",
            "Present rationale to stakeholders"
          ]
        },
        {
          week: 3,
          tasks: [
            "Run a small usability study for critical flow",
            "Document insights with clear recommendations",
            "Share findings with wider team"
          ]
        },
        {
          week: 4,
          tasks: [
            "Write design principles for your product",
            "Create examples and anti-patterns",
            "Get team buy-in and adoption"
          ]
        }
      ]
    };
  } else {
    return {
      stage: "Strategic Lead",
      summary: "You're already operating at a high level. Your edge now is strategy, org influence, and building systems (design system, UX ops, research ops).",
      improvementPlan: [
        {
          week: 1,
          tasks: [
            "Drive a 0→1 initiative from problem definition",
            "Document decision trade-offs and rationale",
            "Align with company strategy"
          ]
        },
        {
          week: 2,
          tasks: [
            "Build a design quality bar document",
            "Include examples and anti-patterns",
            "Use in design reviews"
          ]
        },
        {
          week: 3,
          tasks: [
            "Partner with data/PM teams",
            "Define north star metrics for UX",
            "Create measurement framework"
          ]
        },
        {
          week: 4,
          tasks: [
            "Coach other designers on your approach",
            "Create reusable templates and playbooks",
            "Share learnings org-wide"
          ]
        }
      ]
    };
  }
}
