/**
 * Fallback Generators
 * 
 * Client-side logic to generate results content when the API is unavailable.
 * Mirrors the logic in server/routes.ts.
 */

import { Stage, Category, Band, CategoryScore, CategoryInsight, ImprovementPlanData } from "./types";

// Generate meaning text based on stage and performance
export function generateMeaningText(
  stage: Stage,
  totalScore: number,
  strongCategories: Category[],
  weakCategories: Category[]
): string {
  const strongText = strongCategories?.length > 0 
    ? `You excel in ${strongCategories.slice(0, 2).join(" and ")}.` 
    : "";
  const weakText = weakCategories?.length > 0 
    ? `Focus on strengthening ${weakCategories.slice(0, 2).join(" and ")} to advance.` 
    : "";
  
  const stageMeanings: Record<string, string> = {
    "Explorer": `As an Explorer with a score of ${totalScore}, you're building your UX foundation. ${strongText} ${weakText} Keep learning and practicing to develop your skills.`,
    "Practitioner": `As a Practitioner scoring ${totalScore}, you have solid fundamentals. ${strongText} ${weakText} Focus on deepening your expertise and taking ownership of projects.`,
    "Emerging Senior": `At ${totalScore} as an Emerging Senior, you're transitioning to strategic impact. ${strongText} ${weakText} Develop your leadership skills and mentor others.`,
    "Strategic Lead": `With a score of ${totalScore} as a Strategic Lead, you're operating at a high level. ${strongText} ${weakText} Focus on organizational influence and driving design culture.`,
  };
  
  return stageMeanings[stage] || stageMeanings["Practitioner"];
}

// Generate category insight
export function generateCategoryInsight(category: CategoryScore, stage: Stage): CategoryInsight {
  const score = category.score;
  const band = category.band;
  const categoryName = category.name;
  const categoryId = category.id;
  
  // Template descriptions based on band
  const descriptions: Record<Band, string> = {
    "Strong": `Your ${categoryName} skills are well-developed. You demonstrate strong competency and can handle complex challenges in this area. Continue refining your expertise to mentor others.`,
    "Needs Work": `Your ${categoryName} foundation is solid but has room for growth. Focus on practicing intermediate concepts and applying them in real projects to strengthen this skill area.`,
    "Learn the Basics": `Your ${categoryName} skills need foundational development. Start with core principles and gradually build up through structured learning and hands-on practice.`,
  };
  
  // Template checklists based on category and band
  const checklists: Record<Band, { id: string; text: string; priority?: "high" | "medium" | "low" }[]> = {
    "Strong": [
      { id: `${categoryId}-1`, text: `Mentor a junior on ${categoryName} best practices`, priority: "medium" as const },
      { id: `${categoryId}-2`, text: `Document your ${categoryName} process for the team`, priority: "medium" as const },
      { id: `${categoryId}-3`, text: `Lead a workshop on advanced ${categoryName} techniques`, priority: "low" as const },
      { id: `${categoryId}-4`, text: `Explore cutting-edge trends in ${categoryName}`, priority: "low" as const },
      { id: `${categoryId}-5`, text: `Create a case study showcasing your ${categoryName} expertise`, priority: "medium" as const },
    ],
    "Needs Work": [
      { id: `${categoryId}-1`, text: `Complete 2 hands-on projects focused on ${categoryName}`, priority: "high" as const },
      { id: `${categoryId}-2`, text: `Read 3 articles on ${categoryName} best practices`, priority: "medium" as const },
      { id: `${categoryId}-3`, text: `Seek feedback on your ${categoryName} work from peers`, priority: "high" as const },
      { id: `${categoryId}-4`, text: `Practice ${categoryName} skills for 30 minutes daily`, priority: "medium" as const },
      { id: `${categoryId}-5`, text: `Join a community focused on ${categoryName}`, priority: "low" as const },
    ],
    "Learn the Basics": [
      { id: `${categoryId}-1`, text: `Study fundamental principles of ${categoryName}`, priority: "high" as const },
      { id: `${categoryId}-2`, text: `Take an introductory course on ${categoryName}`, priority: "high" as const },
      { id: `${categoryId}-3`, text: `Follow 3 experts in ${categoryName} on social media`, priority: "low" as const },
      { id: `${categoryId}-4`, text: `Complete beginner exercises in ${categoryName}`, priority: "high" as const },
      { id: `${categoryId}-5`, text: `Review examples of good ${categoryName} work`, priority: "medium" as const },
      { id: `${categoryId}-6`, text: `Set a 30-day learning goal for ${categoryName}`, priority: "medium" as const },
    ],
  };
  
  return {
    categoryId,
    categoryName,
    score,
    band,
    description: descriptions[band],
    checklist: checklists[band],
  };
}

// Generate improvement plan
export function generateImprovementPlan(
  stage: Stage,
  strongCategories: Category[],
  weakCategories: Category[]
): ImprovementPlanData["weeks"] {
  const focusAreas = weakCategories?.length > 0 ? weakCategories : ["UX Fundamentals", "User Research & Validation"] as Category[];
  const strongArea = strongCategories?.length > 0 ? strongCategories[0] : "UX Fundamentals" as Category;
  
  return [
    {
      weekNumber: 1,
      theme: "Foundation Fix",
      focusAreas: focusAreas.slice(0, 2),
      dailyTasks: [
        {
          id: "w1-d1",
          title: "Review core principles",
          description: `Study fundamental concepts in ${focusAreas[0]}`,
          duration: "45 min",
          category: focusAreas[0],
          type: "daily" as const,
        },
        {
          id: "w1-d2",
          title: "Practice exercises",
          description: "Complete 2 hands-on exercises to reinforce learning",
          duration: "45 min",
          category: focusAreas[0],
          type: "daily" as const,
        },
        {
          id: "w1-d3",
          title: "Read industry articles",
          description: "Read 2 articles from NN/g or Smashing Magazine",
          duration: "30 min",
          category: focusAreas[0],
          type: "daily" as const,
        },
      ],
      deepWorkTasks: [
        {
          id: "w1-dw1",
          title: "Mini project",
          description: "Apply learned concepts in a small practical project",
          duration: "90 min",
          category: focusAreas[0],
          type: "deep-work" as const,
        },
        {
          id: "w1-dw2",
          title: "Portfolio review",
          description: "Analyze and document improvements for one portfolio piece",
          duration: "90 min",
          category: focusAreas[0],
          type: "deep-work" as const,
        },
      ],
      expectedOutcome: "Solid understanding of foundational concepts and initial practice experience.",
    },
    {
      weekNumber: 2,
      theme: "Depth & Ownership",
      focusAreas: focusAreas,
      dailyTasks: [
        {
          id: "w2-d1",
          title: "Intermediate concepts",
          description: `Study intermediate techniques in ${focusAreas[0]}`,
          duration: "45 min",
          category: focusAreas[0],
          type: "daily" as const,
        },
        {
          id: "w2-d2",
          title: "Peer review",
          description: "Get feedback on your work from a colleague or community",
          duration: "30 min",
          category: focusAreas[0],
          type: "daily" as const,
        },
        {
          id: "w2-d3",
          title: "Case study analysis",
          description: "Analyze 2 industry case studies for patterns and insights",
          duration: "45 min",
          category: focusAreas[0],
          type: "daily" as const,
        },
      ],
      deepWorkTasks: [
        {
          id: "w2-dw1",
          title: "Full project iteration",
          description: "Complete a full design iteration with documentation",
          duration: "120 min",
          category: focusAreas[0],
          type: "deep-work" as const,
        },
        {
          id: "w2-dw2",
          title: "Presentation prep",
          description: "Prepare to present your work and decisions",
          duration: "60 min",
          category: focusAreas[0],
          type: "deep-work" as const,
        },
      ],
      expectedOutcome: "Deeper expertise and ability to own projects end-to-end.",
    },
    {
      weekNumber: 3,
      theme: "Strategy & Visibility",
      focusAreas: [...focusAreas, strongArea].slice(0, 3) as Category[],
      dailyTasks: [
        {
          id: "w3-d1",
          title: "Strategic thinking",
          description: "Practice connecting design decisions to business outcomes",
          duration: "45 min",
          category: strongArea,
          type: "daily" as const,
        },
        {
          id: "w3-d2",
          title: "Stakeholder communication",
          description: "Practice presenting and defending design decisions",
          duration: "30 min",
          category: strongArea,
          type: "daily" as const,
        },
        {
          id: "w3-d3",
          title: "Industry trends",
          description: "Research and document emerging trends in your focus areas",
          duration: "30 min",
          category: strongArea,
          type: "daily" as const,
        },
      ],
      deepWorkTasks: [
        {
          id: "w3-dw1",
          title: "Portfolio case study",
          description: "Create a comprehensive case study for your portfolio",
          duration: "120 min",
          category: strongArea,
          type: "deep-work" as const,
        },
        {
          id: "w3-dw2",
          title: "Knowledge sharing",
          description: "Write a blog post or create content about your learnings",
          duration: "90 min",
          category: strongArea,
          type: "deep-work" as const,
        },
      ],
      expectedOutcome: "Strategic mindset and increased visibility through documented work.",
    },
  ];
}

