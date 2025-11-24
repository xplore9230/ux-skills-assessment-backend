import type { CategoryScore, ImprovementWeek } from "@/types";

interface DesignSystemStageResult {
  stage: string;
  summary: string;
  improvementPlan: ImprovementWeek[];
}

export function calculateDesignSystemResults(answers: Record<string, number>, questions: Array<{ id: string; category: string }>): {
  totalScore: number;
  maxScore: number;
  categories: CategoryScore[];
  stage: string;
  summary: string;
  improvementPlan: ImprovementWeek[];
} {
  try {
    const categoryScores: Record<string, number> = {
      "Foundations": 0,
      "Tokens": 0,
      "Core Systems": 0,
      "Components": 0,
      "Patterns": 0,
      "Governance": 0
    };

    const categoryCounts: Record<string, number> = {
      "Foundations": 0,
      "Tokens": 0,
      "Core Systems": 0,
      "Components": 0,
      "Patterns": 0,
      "Governance": 0
    };

    // Create a map of question ID to question for quick lookup
    const questionMap = new Map(questions.map(q => [q.id, q]));

    Object.entries(answers).forEach(([questionId, score]) => {
      const question = questionMap.get(questionId);
      if (question) {
        const category = question.category;
        if (categoryScores.hasOwnProperty(category)) {
          categoryScores[category] += score;
          categoryCounts[category]++;
        }
      }
    });

    const totalScoreRaw = Object.values(categoryScores).reduce((a, b) => a + b, 0);
    const totalQuestions = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
    const maxTotalScoreRaw = totalQuestions * 5;
    
    // Normalize total score to 0-100 scale
    const normalizedTotalScore = Math.round((totalScoreRaw / maxTotalScoreRaw) * 100);

    const categories: CategoryScore[] = Object.entries(categoryScores).map(([name, score]) => {
      const count = categoryCounts[name];
      const categoryMaxScore = count * 5;
      const percentage = categoryMaxScore > 0 ? Math.round((score / categoryMaxScore) * 100) : 0;
      
      return {
        name,
        score: percentage,
        maxScore: 100,
        status: percentage >= 80 ? "strong" : percentage >= 60 ? "decent" : "needs-work"
      };
    });

    const stageResult = getDesignSystemStageInfo(normalizedTotalScore);

    return {
      totalScore: normalizedTotalScore,
      maxScore: 100,
      categories,
      ...stageResult
    };
  } catch (error) {
    console.error("Error calculating design system results:", error);
    return {
      totalScore: 0,
      maxScore: 100,
      categories: [],
      stage: "Beginner",
      summary: "Unable to calculate results. Please try again.",
      improvementPlan: []
    };
  }
}

function getDesignSystemStageInfo(score: number): DesignSystemStageResult {
  // Thresholds based on normalized 0-100 score
  // Beginner: 0-40%
  // Practitioner: 41-65%
  // Advanced: 66-85%
  // Expert: 86-100%
  
  if (score <= 40) {
    return {
      stage: "Beginner",
      summary: "You're just starting your design systems journey. Focus on understanding the fundamentals and building a solid foundation.",
      improvementPlan: [
        {
          week: 1,
          tasks: [
            "Read the Design Systems blog post on our site",
            "Learn about design principles and color systems",
            "Study examples from Material Design and Polaris"
          ]
        },
        {
          week: 2,
          tasks: [
            "Understand design tokens and their role",
            "Explore typography and spacing systems",
            "Practice creating a simple color palette"
          ]
        },
        {
          week: 3,
          tasks: [
            "Learn about component architecture",
            "Study layout grids and core systems",
            "Build a simple button component"
          ]
        },
        {
          week: 4,
          tasks: [
            "Explore design patterns and best practices",
            "Learn about governance models",
            "Document your learning in a journal"
          ]
        }
      ]
    };
  } else if (score <= 65) {
    return {
      stage: "Practitioner",
      summary: "You have a good understanding of design systems fundamentals. Now focus on practical application and deeper knowledge.",
      improvementPlan: [
        {
          week: 1,
          tasks: [
            "Create a small design system for a personal project",
            "Implement design tokens in code",
            "Build a component library with 5+ components"
          ]
        },
        {
          week: 2,
          tasks: [
            "Establish a typography scale",
            "Create comprehensive documentation",
            "Test your components for accessibility"
          ]
        },
        {
          week: 3,
          tasks: [
            "Design and implement common patterns",
            "Set up a contribution workflow",
            "Create usage guidelines for your system"
          ]
        },
        {
          week: 4,
          tasks: [
            "Gather feedback from users",
            "Iterate on your system based on learnings",
            "Share your work with the community"
          ]
        }
      ]
    };
  } else if (score <= 85) {
    return {
      stage: "Advanced",
      summary: "You have advanced knowledge of design systems. Focus on scaling, governance, and strategic thinking.",
      improvementPlan: [
        {
          week: 1,
          tasks: [
            "Design a multi-platform token system",
            "Establish governance processes",
            "Create a contribution guide"
          ]
        },
        {
          week: 2,
          tasks: [
            "Build a theming system with light/dark modes",
            "Implement advanced component patterns",
            "Set up automated testing and quality checks"
          ]
        },
        {
          week: 3,
          tasks: [
            "Design federated contribution workflows",
            "Create educational materials for your team",
            "Establish metrics for system adoption"
          ]
        },
        {
          week: 4,
          tasks: [
            "Plan and execute a system evolution strategy",
            "Build partnerships with product teams",
            "Document your leadership approach"
          ]
        }
      ]
    };
  } else {
    return {
      stage: "Expert",
      summary: "You're an expert in design systems. Focus on strategic leadership, scaling, and organizational impact.",
      improvementPlan: [
        {
          week: 1,
          tasks: [
            "Define a long-term design system strategy",
            "Establish design system metrics and KPIs",
            "Create a roadmap for system evolution"
          ]
        },
        {
          week: 2,
          tasks: [
            "Lead design system governance initiatives",
            "Build a community around your system",
            "Establish partnerships with engineering and product"
          ]
        },
        {
          week: 3,
          tasks: [
            "Mentor other designers on design systems",
            "Contribute to open-source design systems",
            "Speak or write about design system strategy"
          ]
        },
        {
          week: 4,
          tasks: [
            "Evaluate and optimize system ROI",
            "Plan multi-brand or multi-platform systems",
            "Share your expertise with the broader community"
          ]
        }
      ]
    };
  }
}

