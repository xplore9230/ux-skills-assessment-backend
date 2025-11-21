import { allQuestions } from "@/data/questions";

interface CategoryScore {
  name: string;
  score: number;
  maxScore: number;
  status: "strong" | "decent" | "needs-work";
}

interface StageResult {
  stage: string;
  summary: string;
  improvementPlan: { week: number; tasks: string[] }[];
}

export function calculateResults(answers: Record<string, number>) {
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

  const totalScore = Object.values(categoryScores).reduce((a, b) => a + b, 0);

  const categories: CategoryScore[] = Object.entries(categoryScores).map(([name, score]) => ({
    name,
    score,
    maxScore: 15,
    status: score >= 11 ? "strong" : score >= 6 ? "decent" : "needs-work"
  }));

  const stageResult = getStageInfo(totalScore);

  return {
    totalScore,
    maxScore: 75,
    categories,
    ...stageResult
  };
}

function getStageInfo(totalScore: number): StageResult {
  if (totalScore <= 25) {
    return {
      stage: "Explorer",
      summary: "You're in the early stage of your UX journey or transitioning from another field. Your main focus now should be building strong fundamentals and getting hands-on with small projects.",
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
  } else if (totalScore <= 45) {
    return {
      stage: "Practitioner",
      summary: "You're functioning as a UX designer and can handle features with guidance. Now it's about depth: better research, stronger visual craft, and thinking more about impact and metrics.",
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
  } else if (totalScore <= 60) {
    return {
      stage: "Emerging Senior",
      summary: "You're close to or already functioning at a senior level. You can drive flows end-to-end and work well with PM/eng. Next step is sharpening strategy, systems thinking, and mentoring.",
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
