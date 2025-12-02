import type { Express } from "express";
import { createServer, type Server } from "http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { storage } from "./storage";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to pre-generated JSON data from the Python backend
// Try multiple possible locations for Vercel serverless and local dev
function findPregeneratedDataDir(): string | null {
  const possiblePaths = [
    path.resolve(process.cwd(), "api", "pregenerated_data"), // Vercel serverless (copied during build)
    path.resolve(process.cwd(), "server_py", "pregenerated_data"), // Local dev
    path.resolve(process.cwd(), "..", "server_py", "pregenerated_data"), // Alternative Vercel path
    path.join(__dirname, "..", "api", "pregenerated_data"), // Compiled location (api folder)
    path.join(__dirname, "..", "server_py", "pregenerated_data"), // Compiled location (server_py folder)
    path.join(__dirname, "server_py", "pregenerated_data"),
  ];

  for (const dirPath of possiblePaths) {
    if (fs.existsSync(dirPath)) {
      const stats = fs.statSync(dirPath);
      if (stats.isDirectory()) {
        // Check if directory has at least one JSON file
        try {
          const files = fs.readdirSync(dirPath);
          if (files.some((f) => f.endsWith(".json"))) {
            console.log(`Found pregenerated data at: ${dirPath}`);
            return dirPath;
          }
        } catch (e) {
          // Directory exists but can't read it
          continue;
        }
      }
    }
  }

  console.warn("Pregenerated data directory not found. Tried:", possiblePaths);
  return null;
}

const PREGNERATED_DATA_DIR = findPregeneratedDataDir();

type PregeneratedScoreData = {
  score?: number;
  stage?: string;
  categories?: Array<{
    name: string;
    score: number;
    maxScore: number;
  }>;
  improvement_plan?: {
    weeks?: Array<{
      week: number;
      tasks: Array<
        | string
        | {
            task: string;
            doneCriteria?: string;
          }
      >;
    }>;
  };
  resources?: {
    readup?: string;
    resources?: any[];
  };
  deep_dive?: {
    topics?: any[];
  };
  layout?: any;
  insights?: any[] | null;
};

function deriveScoreFromCategories(categories: any[] | undefined): number | null {
  if (!Array.isArray(categories) || categories.length === 0) {
    return null;
  }

  const numericScores = categories
    .map((cat) => {
      const value =
        typeof cat?.score === "number"
          ? cat.score
          : Number(cat?.score ?? Number.NaN);
      return Number.isFinite(value) ? value : null;
    })
    .filter((value): value is number => value !== null);

  if (numericScores.length === 0) {
    return null;
  }

  const sum = numericScores.reduce((acc, value) => acc + value, 0);
  const avg = sum / numericScores.length;
  return Math.round(avg);
}

function loadPregeneratedForScore(
  rawScore: unknown,
  categories?: any[],
): PregeneratedScoreData | null {
  if (!PREGNERATED_DATA_DIR) {
    console.warn("Pregenerated data directory not available");
    return null;
  }

  let numericScore: number | null = null;

  if (typeof rawScore === "number" && Number.isFinite(rawScore)) {
    numericScore = rawScore;
  } else if (typeof rawScore === "string" && rawScore.trim().length > 0) {
    const parsed = Number(rawScore);
    if (Number.isFinite(parsed)) {
      numericScore = parsed;
    }
  }

  if (numericScore === null) {
    numericScore = deriveScoreFromCategories(categories);
  }

  if (numericScore === null) {
    console.warn("Could not determine score from:", { rawScore, categories });
    return null;
  }

  const clamped = Math.min(100, Math.max(0, Math.round(numericScore)));
  const filePath = path.join(PREGNERATED_DATA_DIR, `score_${clamped}.json`);

  if (!fs.existsSync(filePath)) {
    console.warn(`Pregenerated file not found: ${filePath} (score: ${clamped})`);
    return null;
  }

  try {
    const json = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(json) as PregeneratedScoreData;
    console.log(`Loaded pregenerated data for score ${clamped}`);
    return data;
  } catch (error) {
    console.error("Error reading pregenerated data for score", clamped, error);
    return null;
  }
}

// Helper to map career stage to job search query
function buildJobTitle(stage: string): string {
  switch (stage) {
    case "Explorer":
      return "Junior Product Designer";
    case "Practitioner":
      return "Product Designer";
    case "Emerging Lead":
      return "Lead Product Designer";
    case "Strategic Lead - Senior":
      return "Design Director";
    case "Strategic Lead - Executive":
      return "VP of Design";
    case "Strategic Lead - C-Suite":
      return "SVP of Design";
    default:
      return "Product Designer";
  }
}

// Mock Data for fallback
const MOCK_JOBS = [
  {
    title: "Product Designer",
    company: "Airbnb",
    location: "Remote",
    via: "LinkedIn",
    job_url: "https://www.airbnb.com/careers"
  },
  {
    title: "UX Researcher",
    company: "Spotify",
    location: "New York, NY",
    via: "Spotify Careers",
    job_url: "https://www.lifeatspotify.com/"
  },
  {
    title: "Senior Product Designer",
    company: "Linear",
    location: "Remote",
    via: "Linear Careers",
    job_url: "https://linear.app/careers"
  },
  {
    title: "UX Designer",
    company: "Google",
    location: "Mountain View, CA",
    via: "Google Careers",
    job_url: "https://careers.google.com/"
  },
  {
    title: "Product Designer",
    company: "Notion",
    location: "San Francisco, CA",
    via: "Notion Careers",
    job_url: "https://www.notion.so/careers"
  },
  {
    title: "Design Systems Designer",
    company: "Shopify",
    location: "Remote",
    via: "Shopify Careers",
    job_url: "https://www.shopify.com/careers"
  }
];

// Helper to get mock jobs (SERP API removed - using Python backend or mock data)
function getMockJobs(query: string): any[] {
  const isSenior = query.toLowerCase().includes("senior") || query.toLowerCase().includes("lead");
  return MOCK_JOBS.filter(job => {
    if (isSenior) return job.title.toLowerCase().includes("senior") || job.title.toLowerCase().includes("lead");
    return !job.title.toLowerCase().includes("senior") && !job.title.toLowerCase().includes("lead");
  });
}

// ========================================
// V2 HELPER FUNCTIONS
// ========================================

// Band thresholds
type Band = "Strong" | "Needs Work" | "Learn the Basics";

function deriveBand(score: number): Band {
  if (score >= 80) return "Strong";
  if (score >= 40) return "Needs Work";
  return "Learn the Basics";
}

// Generate meaning text based on stage and performance
function generateMeaningText(
  stage: string,
  totalScore: number,
  strongCategories: string[],
  weakCategories: string[]
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
function generateCategoryInsight(category: any, stage: string): any {
  const score = typeof category.score === "number" ? category.score : 50;
  const band = deriveBand(score);
  const categoryName = category.name || "Unknown Category";
  const categoryId = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  
  // Template descriptions based on band
  const descriptions: Record<Band, string> = {
    "Strong": `Your ${categoryName} skills are well-developed. You demonstrate strong competency and can handle complex challenges in this area. Continue refining your expertise to mentor others.`,
    "Needs Work": `Your ${categoryName} foundation is solid but has room for growth. Focus on practicing intermediate concepts and applying them in real projects to strengthen this skill area.`,
    "Learn the Basics": `Your ${categoryName} skills need foundational development. Start with core principles and gradually build up through structured learning and hands-on practice.`,
  };
  
  // Template checklists based on category and band
  const checklists: Record<Band, { id: string; text: string; priority?: string }[]> = {
    "Strong": [
      { id: `${categoryId}-1`, text: `Mentor a junior on ${categoryName} best practices`, priority: "medium" },
      { id: `${categoryId}-2`, text: `Document your ${categoryName} process for the team`, priority: "medium" },
      { id: `${categoryId}-3`, text: `Lead a workshop on advanced ${categoryName} techniques`, priority: "low" },
      { id: `${categoryId}-4`, text: `Explore cutting-edge trends in ${categoryName}`, priority: "low" },
      { id: `${categoryId}-5`, text: `Create a case study showcasing your ${categoryName} expertise`, priority: "medium" },
    ],
    "Needs Work": [
      { id: `${categoryId}-1`, text: `Complete 2 hands-on projects focused on ${categoryName}`, priority: "high" },
      { id: `${categoryId}-2`, text: `Read 3 articles on ${categoryName} best practices`, priority: "medium" },
      { id: `${categoryId}-3`, text: `Seek feedback on your ${categoryName} work from peers`, priority: "high" },
      { id: `${categoryId}-4`, text: `Practice ${categoryName} skills for 30 minutes daily`, priority: "medium" },
      { id: `${categoryId}-5`, text: `Join a community focused on ${categoryName}`, priority: "low" },
    ],
    "Learn the Basics": [
      { id: `${categoryId}-1`, text: `Study fundamental principles of ${categoryName}`, priority: "high" },
      { id: `${categoryId}-2`, text: `Take an introductory course on ${categoryName}`, priority: "high" },
      { id: `${categoryId}-3`, text: `Follow 3 experts in ${categoryName} on social media`, priority: "low" },
      { id: `${categoryId}-4`, text: `Complete beginner exercises in ${categoryName}`, priority: "high" },
      { id: `${categoryId}-5`, text: `Review examples of good ${categoryName} work`, priority: "medium" },
      { id: `${categoryId}-6`, text: `Set a 30-day learning goal for ${categoryName}`, priority: "medium" },
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

// ============================================================================
// IMPORTANT: DO NOT ADD PLACEHOLDER GENERATORS HERE
// ============================================================================
// All resources MUST come from the curated knowledgeBank in:
//   client/src/data/knowledge-bank.ts
//
// The knowledge bank contains 43+ real resources with:
// - Unique IDs (e.g., "ux-fund-001", "research-003")
// - Real URLs to actual articles/videos/podcasts
// - Proper categorization and difficulty levels
//
// NEVER create functions like:
// - generatePlaceholderResources()
// - generatePlaceholderDeepInsights()
// - Any function that creates fake IDs like "resource-1" or "insight-1"
// - Any function that uses generic URLs like "https://www.nngroup.com/articles/"
//
// If you need to add resources, add them to knowledge-bank.ts with real URLs.
// ============================================================================

// Generate improvement plan
function generateImprovementPlan(
  stage: string,
  strongCategories: string[] = [],
  weakCategories: string[] = []
): any[] {
  const normalizedWeak = normalizeCategories(weakCategories);
  const normalizedStrong = normalizeCategories(strongCategories);
  const focusAreas =
    normalizedWeak.length > 0 ? normalizedWeak : getFallbackFocusCategories(stage);
  const stageLevel = getLevelForStage(stage);
  const stretchLevels = getStretchLevelsForStage(stage);

  const week1Resources = pickResourcesByLevel(
    [stageLevel],
    focusAreas,
    2
  );
  const week2Resources = pickResourcesByLevel(
    [stageLevel, ...stretchLevels],
    focusAreas,
    2,
    week1Resources.map(r => r.id)
  );
  const week3Resources = pickResourcesByLevel(
    stretchLevels.length > 0 ? stretchLevels : [stageLevel],
    focusAreas,
    2,
    [...week1Resources, ...week2Resources].map(r => r.id)
  );

  return [
    buildWeekPlan({
      weekNumber: 1,
      theme: "Foundation Fix",
      focusAreas: focusAreas.slice(0, 2),
      resources: week1Resources,
      practiceLabel: "Apply fundamentals",
      practiceDescription: (category) =>
        `Create a quick sketch, wireframe, or heuristic checklist focused on ${category} and capture notes in your journal.`,
      deepWork: [
        {
          title: "Mini project sprint",
          description: "Translate today's readings into a simple redesign or flow walkthrough.",
        },
        {
          title: "Portfolio reflection",
          description: "Document one clear before/after improvement you can add to a case study.",
        },
      ],
    }),
    buildWeekPlan({
      weekNumber: 2,
      theme: "Depth & Ownership",
      focusAreas,
      resources: week2Resources,
      practiceLabel: "Critique & iterate",
      practiceDescription: (category) =>
        `Run a quick critique of an existing experience in ${category}. Capture 3 insights and 1 experiment you could ship.`,
      deepWork: [
        {
          title: "End-to-end flow audit",
          description: "Audit a real journey and capture opportunities tied to your focus areas.",
        },
        {
          title: "Research or testing session",
          description: "Host a short user session or synthesize prior research into actionable chunks.",
        },
      ],
    }),
    buildWeekPlan({
      weekNumber: 3,
      theme: "Strategy & Visibility",
      focusAreas,
      resources: week3Resources,
      practiceLabel: "Share and mentor",
      practiceDescription: (category) =>
        `Record a Loom or host a brown-bag to teach one ${category} insight to your team.`,
      deepWork: [
        {
          title: "Strategic narrative",
          description: "Create a 2-slide story or doc that ties your UX work to business goals.",
        },
        {
          title: "Knowledge share",
          description: "Package learnings into a blog post, internal doc, or playbook for peers.",
        },
      ],
    }),
  ];
}

function buildWeekPlan({
  weekNumber,
  theme,
  focusAreas,
  resources,
  practiceLabel,
  practiceDescription,
  deepWork,
}: {
  weekNumber: number;
  theme: string;
  focusAreas: Category[];
  resources: Resource[];
  practiceLabel: string;
  practiceDescription: (category: Category) => string;
  deepWork: Array<{ title: string; description: string }>;
}) {
  const dailyTasks = [
    ...resources.map((resource, idx) => ({
      id: `w${weekNumber}-res-${idx}`,
      title: `Study: ${resource.title}`,
      description: `${resource.summary} — ${resource.url}`,
      duration: resource.duration || "45 min",
      category: resource.category,
      type: "daily",
    })),
  ];

  const primaryCategory = focusAreas[0] || "UX Fundamentals";
  while (dailyTasks.length < 3) {
    dailyTasks.push({
      id: `w${weekNumber}-practice-${dailyTasks.length}`,
      title: practiceLabel,
      description: practiceDescription(primaryCategory),
      duration: "45 min",
      category: primaryCategory,
      type: "daily",
    });
  }

  const deepWorkTasks = deepWork.map((task, idx) => ({
    id: `w${weekNumber}-dw${idx + 1}`,
    title: task.title,
    description: task.description,
    duration: idx === 0 ? "120 min" : "90 min",
    type: "deep-work",
  }));

  return {
    weekNumber,
    theme,
    focusAreas,
    dailyTasks,
    deepWorkTasks,
    expectedOutcome:
      weekNumber === 1
        ? "Solid understanding of foundational concepts and initial practice experience."
        : weekNumber === 2
        ? "Clearer craftsmanship, improved documentation habits, and tighter stakeholder alignment."
        : "Strategic mindset and increased visibility through documented work.",
  };
}


import { generateText, generateJSON, isOpenAIConfigured } from "./lib/openai";
import { knowledgeBank, Resource, Category, ResourceLevel, getCategories } from "../client/src/data/knowledge-bank";
import { stripe, isStripeConfigured, getStripePriceId } from "./lib/stripe";

// Log knowledge bank status at startup
console.log("=== KNOWLEDGE BANK LOADED ===");
console.log("Total resources:", knowledgeBank.length);
if (knowledgeBank.length > 0) {
  console.log("First resource ID:", knowledgeBank[0].id);
  console.log("First resource URL:", knowledgeBank[0].url);
}
console.log("==============================");

const CATEGORY_WHITELIST = getCategories();

const STAGE_TO_LEVEL: Record<string, ResourceLevel> = {
  Explorer: "explorer",
  Practitioner: "practitioner",
  "Emerging Lead": "emerging-senior",
  "Strategic Lead - Senior": "strategic-lead",
  "Strategic Lead - Executive": "strategic-lead",
  "Strategic Lead - C-Suite": "strategic-lead",
};

const STRETCH_LEVELS: Record<string, ResourceLevel[]> = {
  Explorer: ["practitioner"],
  Practitioner: ["emerging-senior"],
  "Emerging Lead": ["strategic-lead"],
  "Strategic Lead - Senior": ["strategic-lead"],
  "Strategic Lead - Executive": ["strategic-lead"],
  "Strategic Lead - C-Suite": ["strategic-lead"],
};

const STAGE_FOCUS_CATEGORIES: Record<string, Category[]> = {
  Explorer: ["UX Fundamentals", "Collaboration & Communication"],
  Practitioner: ["UI Craft & Visual Design", "Collaboration & Communication"],
  "Emerging Lead": ["User Research & Validation", "Product Thinking & Strategy"],
  "Strategic Lead - Senior": ["Collaboration & Communication", "Product Thinking & Strategy"],
  "Strategic Lead - Executive": ["Collaboration & Communication", "Product Thinking & Strategy"],
  "Strategic Lead - C-Suite": ["Collaboration & Communication", "Product Thinking & Strategy"],
};

function getLevelForStage(stage: string): ResourceLevel {
  return STAGE_TO_LEVEL[stage] ?? "explorer";
}

function getStretchLevelsForStage(stage: string): ResourceLevel[] {
  return STRETCH_LEVELS[stage] ?? ["strategic-lead"];
}

function normalizeCategories(categories?: string[]): Category[] {
  if (!categories || categories.length === 0) {
    return [];
  }
  return categories.filter((cat: string): cat is Category =>
    CATEGORY_WHITELIST.includes(cat as Category)
  );
}

function getFallbackFocusCategories(stage: string): Category[] {
  return STAGE_FOCUS_CATEGORIES[stage] ?? ["UX Fundamentals", "User Research & Validation"];
}

function pickResourcesByLevel(
  levels: ResourceLevel[],
  categories: Category[],
  limit: number,
  excludeIds: string[] = []
): Resource[] {
  if (levels.length === 0) {
    return [];
  }

  const exclude = new Set(excludeIds);
  return knowledgeBank
    .filter((resource) => levels.includes(resource.level))
    .filter((resource) => categories.length === 0 || categories.includes(resource.category))
    .filter((resource) => !exclude.has(resource.id))
    .slice(0, limit);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Job recommendations endpoint (uses mock data - kept for compatibility)
  app.get("/api/job-recommendations", async (req, res) => {
    try {
      const stage = req.query.stage as string || "Practitioner";
      
      const jobTitle = buildJobTitle(stage);
      const jobs = getMockJobs(jobTitle);
      
      res.json({ jobs });
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ error: "Failed to fetch job recommendations" });
    }
  });

  /**
   * Lightweight pregenerated endpoints
   *
   * These mirror the Python FastAPI routes but read from the static
   * JSON files in `server_py/pregenerated_data`. This allows the Vercel
   * deployment to serve AI-style results without requiring the Python/Ollama
   * stack to be running.
   *
   * When `VITE_PYTHON_API_URL` is not set on the client, the frontend
   * will call these relative `/api/...` routes instead.
   */

  // Improvement plan – returns { weeks: [...] }
  app.post("/api/generate-improvement-plan", (req, res) => {
    try {
      const { totalScore, categories } = req.body ?? {};
      const data = loadPregeneratedForScore(totalScore, categories);

      const weeks = data?.improvement_plan?.weeks;
      if (!weeks || !Array.isArray(weeks)) {
        return res.status(404).json({
          error: "No pregenerated improvement plan found for this score",
        });
      }

      return res.json({ weeks });
    } catch (error) {
      console.error("Error serving pregenerated improvement plan:", error);
      return res.status(500).json({ error: "Failed to load improvement plan" });
    }
  });

  // Helper function to replace hardcoded stage references in readup text
  function replaceStageReferences(readup: string, actualStage: string): string {
    if (!readup || !actualStage) return readup;
    
    // Map of stage variations that might appear in pregenerated data
    const stagePatterns = [
      { pattern: /As an Explorer UX designer/gi, replacement: `As an ${actualStage} UX designer` },
      { pattern: /As a Practitioner UX designer/gi, replacement: `As a ${actualStage} UX designer` },
      { pattern: /As an Emerging Senior UX designer/gi, replacement: `As an ${actualStage} UX designer` },
      { pattern: /As a Strategic Lead UX designer/gi, replacement: `As a ${actualStage} UX designer` },
      { pattern: /As an Explorer UX Designer/gi, replacement: `As an ${actualStage} UX Designer` },
      { pattern: /As a Practitioner UX Designer/gi, replacement: `As a ${actualStage} UX Designer` },
      { pattern: /As an Emerging Senior UX Designer/gi, replacement: `As an ${actualStage} UX Designer` },
      { pattern: /As a Strategic Lead UX Designer/gi, replacement: `As a ${actualStage} UX Designer` },
      { pattern: /As an Explorer/gi, replacement: `As an ${actualStage}` },
      { pattern: /As a Practitioner/gi, replacement: `As a ${actualStage}` },
      { pattern: /As an Emerging Senior/gi, replacement: `As an ${actualStage}` },
      { pattern: /As a Strategic Lead/gi, replacement: `As a ${actualStage}` },
      { pattern: /As a UX practitioner/gi, replacement: `As a ${actualStage} UX designer` },
      { pattern: /As an emerging senior UX designer/gi, replacement: `As an ${actualStage} UX designer` },
      { pattern: /as an Explorer/gi, replacement: `as an ${actualStage}` },
      { pattern: /as a Practitioner/gi, replacement: `as a ${actualStage}` },
      { pattern: /as an Emerging Senior/gi, replacement: `as an ${actualStage}` },
      { pattern: /as a Strategic Lead/gi, replacement: `as a ${actualStage}` },
    ];
    
    let updatedReadup = readup;
    for (const { pattern, replacement } of stagePatterns) {
      updatedReadup = updatedReadup.replace(pattern, replacement);
    }
    
    return updatedReadup;
  }

  // Resources + stage readup – returns { readup, resources: [...] }
  app.post("/api/generate-resources", (req, res) => {
    try {
      const { totalScore, categories, stage } = req.body ?? {};
      console.log("generate-resources called with:", { totalScore, categoriesLength: categories?.length, stage });
      
      const data = loadPregeneratedForScore(totalScore, categories);
      const resourcesBlock = data?.resources;

      if (!data) {
        console.warn("No pregenerated data found for score:", totalScore);
      } else if (!resourcesBlock) {
        console.warn("Pregenerated data found but no resources block");
      } else {
        console.log("Found resources:", resourcesBlock.resources?.length || 0);
      }

      // Replace hardcoded stage references with actual stage
      let readupText = resourcesBlock?.readup ?? "";
      if (readupText && stage && typeof stage === "string") {
        readupText = replaceStageReferences(readupText, stage);
      }

      const result = {
        readup: readupText,
        resources: Array.isArray(resourcesBlock?.resources)
          ? resourcesBlock!.resources
          : [],
      };

      return res.json(result);
    } catch (error) {
      console.error("Error serving pregenerated resources:", error);
      return res.status(500).json({ error: "Failed to load resources", details: String(error) });
    }
  });

  // Deep dive topics – returns { topics: [...] }
  app.post("/api/generate-deep-dive", (req, res) => {
    try {
      const { totalScore, categories } = req.body ?? {};
      const data = loadPregeneratedForScore(totalScore, categories);
      const topics = data?.deep_dive?.topics;

      return res.json({
        topics: Array.isArray(topics) ? topics : [],
      });
    } catch (error) {
      console.error("Error serving pregenerated deep dive:", error);
      return res.status(500).json({ error: "Failed to load deep dive topics" });
    }
  });

  // Layout strategy – returns layout object
  app.post("/api/generate-layout", (req, res) => {
    try {
      const { stage, totalScore, maxScore, categories } = req.body ?? {};
      const data = loadPregeneratedForScore(totalScore, categories);
      const layout = data?.layout;

      if (layout && layout.section_order && layout.section_visibility) {
        return res.json(layout);
      }

      // Fallback: default layout (mirrors Python backend fallback)
      const fallback = {
        section_order: [
          "hero",
          "stage-readup",
          "skill-breakdown",
          "resources",
          "deep-dive",
          "improvement-plan",
          "jobs",
        ],
        section_visibility: {
          hero: true,
          "stage-readup": true,
          "skill-breakdown": true,
          resources: true,
          "deep-dive": true,
          "improvement-plan": true,
          jobs: true,
        },
        content_depth: {
          resources: "standard",
          "deep-dive": "standard",
          "improvement-plan": "standard",
        },
        priority_message:
          stage && typeof stage === "string"
            ? `Based on your ${stage} level, here's your personalized roadmap.`
            : "Let's review your UX skills assessment results.",
      };

      return res.json(fallback);
    } catch (error) {
      console.error("Error serving pregenerated layout:", error);
      return res.status(500).json({ error: "Failed to load layout strategy" });
    }
  });

  // Category insights – returns { insights: [...] }
  app.post("/api/generate-category-insights", (req, res) => {
    try {
      const { totalScore, categories } = req.body ?? {};
      const data = loadPregeneratedForScore(totalScore, categories);

      let insights: any[] | null | undefined = data?.insights;

      // If pregenerated insights are not available, fall back to score-aware computed ones
      if (!insights || !Array.isArray(insights) || insights.length === 0) {
        if (Array.isArray(categories)) {
          insights = categories.map((cat: any) => {
            // Score is already a percentage (0-100), so use it directly
            const percentage = typeof cat.score === "number" ? Math.round(cat.score) : 0;

            // Generate score-appropriate messages
            let detailed: string;
            let actionable: string[];

            if (percentage >= 90) {
              detailed = `Excellent work! Your ${cat.name} skills are at an advanced level. Continue refining your expertise and consider mentoring others or contributing to design systems.`;
              actionable = [
                `Share your ${cat.name} expertise through mentorship or writing`,
                `Contribute to design systems or industry best practices`,
                `Explore advanced techniques and emerging trends in ${cat.name}`,
              ];
            } else if (percentage >= 80) {
              detailed = `Strong performance in ${cat.name}! You have a solid foundation. Focus on refining advanced techniques and expanding your knowledge in specialized areas.`;
              actionable = [
                `Deepen your understanding of advanced ${cat.name} concepts`,
                `Practice applying ${cat.name} principles to complex projects`,
                `Seek feedback from senior designers on your ${cat.name} work`,
              ];
            } else if (percentage >= 60) {
              detailed = `Your ${cat.name} skills are developing well. Continue building on your foundation and practice applying these concepts in real projects.`;
              actionable = [
                `Practice ${cat.name} skills through hands-on projects`,
                `Study case studies and examples of strong ${cat.name} work`,
                `Get feedback on your ${cat.name} work from peers or mentors`,
              ];
            } else if (percentage >= 40) {
              detailed = `Your performance in ${cat.name} shows room for growth. Focus on building stronger foundations through structured learning and practice.`;
              actionable = [
                `Review core concepts in ${cat.name}`,
                `Complete beginner-friendly ${cat.name} tutorials or courses`,
                `Practice ${cat.name} skills daily with small projects`,
              ];
            } else {
              detailed = `Your ${cat.name} skills need significant development. Start with fundamentals and build gradually through consistent practice and learning.`;
              actionable = [
                `Start with beginner ${cat.name} courses or resources`,
                `Practice basic ${cat.name} concepts regularly`,
                `Seek guidance from experienced designers in ${cat.name}`,
              ];
            }

            return {
              category: cat.name ?? "Category",
              brief: `You scored ${percentage}% in ${cat.name}.`,
              detailed,
              actionable,
            };
          });
        } else {
          insights = [];
        }
      }

      return res.json({ insights });
    } catch (error) {
      console.error("Error serving pregenerated insights:", error);
      return res.status(500).json({ error: "Failed to load category insights" });
    }
  });

  // Job search links – mirrors Python `/api/job-search-links`
  app.get("/api/job-search-links", (req, res) => {
    try {
      const stage = (req.query.stage as string) || "Practitioner";
      const location = (req.query.location as string) || "Remote";

      const jobTitle = buildJobTitle(stage);
      const encodedLocation = encodeURIComponent(location);
      const encodedTitle = encodeURIComponent(jobTitle);

      const linkedinUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodedTitle}&location=${encodedLocation}`;
      const googleQuery = encodeURIComponent(`${jobTitle} jobs in ${location}`);
      const googleUrl = `https://www.google.com/search?q=${googleQuery}&ibp=htl;jobs`;

      return res.json({
        job_title: jobTitle,
        linkedin_url: linkedinUrl,
        google_url: googleUrl,
      });
    } catch (error) {
      console.error("Error generating job search links:", error);
      return res.status(500).json({ error: "Failed to generate job search links" });
    }
  });

// ========================================
// V2 API ENDPOINTS - New Results Page
// ========================================
// These endpoints support the new results page with fresh logic.
// They utilize OpenAI if configured, or fall back to template generation.

// Helper to fetch RAG context from Python backend
async function fetchRAGContext(stage: string, categories: any[]): Promise<any[]> {
  try {
    // Set a short timeout (2s) to ensure RAG doesn't slow down the response
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch("http://localhost:8000/api/rag/retrieve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stage,
        categories: categories.map(c => ({
          name: c.name,
          score: c.finalScore || c.score,
          maxScore: 100
        })),
        top_k: 5
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.resources)) {
        console.log(`✓ RAG Context: Retrieved ${data.resources.length} resources`);
        return data.resources;
      }
    }
  } catch (error) {
    // Silent failure for RAG - fallback to pure OpenAI
    console.warn("RAG Context Retrieval skipped:", error instanceof Error ? error.message : "Unknown error");
  }
  return [];
}

// Helper: Fetch Learning Paths from RAG
async function fetchLearningPaths(categories: string[]): Promise<any> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch("http://localhost:8000/api/rag/learning-paths", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categories }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (response.ok) return (await response.json()).paths;
  } catch (e) { console.warn("Learning Path RAG skipped"); }
  return {};
}

// Helper: Fetch Stage Competencies from RAG
async function fetchStageCompetencies(stage: string): Promise<any[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch("http://localhost:8000/api/rag/stage-competencies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (response.ok) return (await response.json()).competencies;
  } catch (e) { console.warn("Stage Comp RAG skipped"); }
  return [];
}

// Helper: Fetch Skill Relationships from RAG
async function fetchSkillRelationships(weak: string[], strong: string[]): Promise<any[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch("http://localhost:8000/api/rag/skill-relationships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weak_categories: weak, strong_categories: strong }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (response.ok) return (await response.json()).relationships;
  } catch (e) { console.warn("Skill Rel RAG skipped"); }
  return [];
}

/**
 * POST /api/v2/meaning
 * Generate "What this means for you" AI text
 * 
 * Input: { stage, totalScore, strongCategories[], weakCategories[] }
 * Output: { meaning: string }
 */
app.post("/api/v2/meaning", async (req, res) => {
  try {
    const { stage, totalScore, strongCategories, weakCategories } = req.body ?? {};
    
    // Check if OpenAI is configured
    if (isOpenAIConfigured()) {
      // Construct categories for RAG context
      const categories = [
        ...(strongCategories || []).map((c: string) => ({ name: c, score: 100, maxScore: 100 })),
        ...(weakCategories || []).map((c: string) => ({ name: c, score: 50, maxScore: 100 }))
      ];
      // 1. Fetch RAG Context (Knowledge Base)
      const ragResources = await fetchRAGContext(stage, categories);
      
      let contextString = "";
      if (ragResources.length > 0) {
        contextString = "\n\nRELEVANT LEARNING RESOURCES (Use these to tailor your advice):\n";
        ragResources.forEach((res, idx) => {
          contextString += `${idx + 1}. ${res.title} (${res.category || 'General'})\n   Summary: ${res.content_preview?.substring(0, 150) || 'N/A'}...\n`;
        });
      }

      const systemPrompt = `You are an expert UX career mentor. Write a short, personalized "What This Means For You" summary (max 50 words) for a UX designer. 
      Use an encouraging but professional tone. Focus on their current stage and growth potential.
      ${contextString ? "Incorporate insights from the provided learning resources where relevant." : ""}`;
      
      const userPrompt = `
      Stage: ${stage}
      Total Score: ${totalScore}/100
      Strongest Areas: ${strongCategories?.join(", ") || "None specific"}
      Areas for Improvement: ${weakCategories?.join(", ") || "General fundamentals"}
      ${contextString}
      `;
      
      const response = await generateText(systemPrompt, userPrompt);
      
      if (response.content) {
        return res.json({ meaning: response.content });
      }
    }
    
    // Fallback to template if OpenAI not configured or failed
    const meaning = generateMeaningText(stage, totalScore, strongCategories, weakCategories);
    return res.json({ meaning });
  } catch (error) {
    console.error("Error generating meaning:", error);
    // Silent fallback to template
    const { stage, totalScore, strongCategories, weakCategories } = req.body ?? {};
    const meaning = generateMeaningText(stage, totalScore, strongCategories, weakCategories);
    return res.json({ meaning });
  }
});

/**
 * POST /api/v2/skill-analysis
 * Generate category insights with descriptions and checklists
 * 
 * Input: { categories[], stage }
 * Output: { insights: [{ categoryId, categoryName, score, band, description, checklist[] }] }
 */
app.post("/api/v2/skill-analysis", async (req, res) => {
  try {
    const { categories, stage } = req.body ?? {};
    
    if (!Array.isArray(categories)) {
      return res.status(400).json({ error: "Categories must be an array" });
    }
    
    if (isOpenAIConfigured()) {
      // 1. Fetch RAG Context
      const ragResources = await fetchRAGContext(stage, categories);
      
      let contextString = "";
      if (ragResources.length > 0) {
        contextString = "\n\nRECOMMENDED RESOURCES (Reference these in checklists where applicable):\n";
        ragResources.forEach((res, idx) => {
          contextString += `- ${res.title}: ${res.content_preview?.substring(0, 100)}...\n`;
        });
      }

      const systemPrompt = `You are a senior UX hiring manager. Analyze the user's skill scores and generate specific insights.
      For each category, provide:
      1. A 2-sentence description of their current capability level.
      2. A checklist of 3-5 specific, actionable tasks to improve.
      ${contextString ? "3. Suggest specific resources from the provided list if they match the category." : ""}
      
      Return valid JSON with an "insights" array.`;
      
      const userPrompt = `
      Stage: ${stage}
      Categories and Scores:
      ${JSON.stringify(categories.map((c: any) => ({ name: c.name, score: c.finalScore, band: c.band })))}
      ${contextString}
      `;
      
      type InsightResponse = {
        insights: Array<{
          categoryName: string;
          description: string;
          checklist: string[];
        }>;
      };
      
      const response = await generateJSON<InsightResponse>(systemPrompt, userPrompt);
      
      if (response.data && response.data.insights) {
        // Merge AI response with original category data to preserve IDs
        const mergedInsights = categories.map((cat: any) => {
          const aiInsight = response.data?.insights.find(i => i.categoryName === cat.name);
          // Fallback logic for individual categories if AI missed one
          const fallback = generateCategoryInsight(cat, stage);
          
          if (aiInsight) {
            return {
              categoryId: cat.id,
              categoryName: cat.name,
              score: cat.finalScore,
              band: cat.band,
              description: aiInsight.description,
              checklist: aiInsight.checklist.map((text, idx) => ({ 
                id: `${cat.id}-${idx}`, 
                text 
              }))
            };
          }
          return fallback;
        });
        
        return res.json({ insights: mergedInsights });
      }
    }
    
    // Fallback
    const insights = categories.map((cat: any) => 
      generateCategoryInsight(cat, stage)
    );
    
    return res.json({ insights });
  } catch (error) {
    console.error("Error generating skill analysis:", error);
    const { categories, stage } = req.body ?? {};
    if (Array.isArray(categories)) {
      const insights = categories.map((cat: any) => generateCategoryInsight(cat, stage));
      return res.json({ insights });
    }
    return res.status(500).json({ error: "Failed to generate skill analysis" });
  }
});

/**
 * POST /api/v2/resources
 * Select curated beginner resources with AI-powered personalization
 */
app.post("/api/v2/resources", async (req, res) => {
  try {
    const { stage, weakCategories } = req.body ?? {};
    const normalizedWeakCategories = normalizeCategories(weakCategories);
    const focusCategories =
      normalizedWeakCategories.length > 0
        ? normalizedWeakCategories
        : getFallbackFocusCategories(stage);
    const level = getLevelForStage(stage);
    
    console.log("[/api/v2/resources] Request:", { stage, focusCategories, level });
    console.log("[/api/v2/resources] KB size:", knowledgeBank.length);
    
    // Get all stage-level resources from knowledge bank
    const stageResources = knowledgeBank.filter(r => r.level === level);
    console.log("[/api/v2/resources] Stage resources found:", stageResources.length);
    
    // Prioritize focus categories, then fill with other stage resources
    let candidates: Resource[] = [];
    
    if (focusCategories.length > 0) {
      const focusMatches = stageResources.filter(r => focusCategories.includes(r.category));
      candidates.push(...focusMatches);
    }
    
    const candidateIds = new Set(candidates.map(c => c.id));
    const others = stageResources.filter(r => !candidateIds.has(r.id));
    candidates.push(...others);
    
    // Limit to 15 candidates for AI selection
    candidates = candidates.slice(0, 15);
    console.log("[/api/v2/resources] Candidates:", candidates.map(c => c.id));

    let selectedResources: any[] = [];

    if (isOpenAIConfigured()) {
      try {
        // Fetch RAG Context
        const learningPaths = await fetchLearningPaths(normalizedWeakCategories);
        const stageCompetencies = await fetchStageCompetencies(stage);
        
        // Prompt OpenAI
        const systemPrompt = `You are a UX learning advisor. Select the 5 BEST beginner resources for this user.
        Explain WHY each one specifically addresses their gaps based on the learning paths and stage expectations.
        Return JSON: { resources: [{ id, reasonSelected }] }
        IMPORTANT: Only use IDs from the provided Candidates list.`;
        
        const userPrompt = `
        Stage: ${stage}
        Focus Categories: ${focusCategories.join(", ")}
        Candidates: ${JSON.stringify(candidates.map(r => ({ id: r.id, title: r.title, category: r.category, summary: r.summary })))}
        Learning Context: ${JSON.stringify(learningPaths)}
        Stage Context: ${JSON.stringify(stageCompetencies)}
        `;
        
        type ResourceResponse = { resources: { id: string, reasonSelected: string }[] };
        const response = await generateJSON<ResourceResponse>(systemPrompt, userPrompt);
        
        if (response.data && response.data.resources) {
          selectedResources = response.data.resources.map(sel => {
            const original = knowledgeBank.find(r => r.id === sel.id);
            if (original) {
              return { ...original, reasonSelected: sel.reasonSelected };
            }
            return null;
          }).filter(Boolean);
          console.log("[/api/v2/resources] AI selected:", selectedResources.length, "resources");
        } else {
          console.warn("[/api/v2/resources] AI returned no data:", response.error || "Unknown error");
        }
      } catch (aiError) {
        console.warn("[/api/v2/resources] AI failed, using fallback:", aiError);
      }
    }

    // Fallback: use candidates directly from knowledge bank
    if (selectedResources.length === 0) {
      console.log("[/api/v2/resources] Using fallback - selecting from candidates");
      // Shuffle and select 5
      const shuffled = [...candidates].sort(() => 0.5 - Math.random());
      selectedResources = shuffled.slice(0, 5).map(r => ({
        ...r,
        reasonSelected: `Recommended to strengthen your ${r.category} skills.`
      }));
      console.log("[/api/v2/resources] Fallback selected:", selectedResources.map(r => r.id));
    }

    return res.json({ resources: selectedResources });
  } catch (error) {
    console.error("[/api/v2/resources] Error:", error);
    return res.status(500).json({ error: "Failed to generate resources" });
  }
});

/**
 * POST /api/v2/deep-insights
 * Select advanced strategic content with RAG + AI
 */
app.post("/api/v2/deep-insights", async (req, res) => {
  try {
    const { stage, strongCategories, weakCategories } = req.body ?? {};
    const stretchLevels = getStretchLevelsForStage(stage);
    const normalizedStrong = normalizeCategories(strongCategories);
    const normalizedWeak = normalizeCategories(weakCategories);
    
    console.log("[/api/v2/deep-insights] Request:", { stage, stretchLevels, normalizedStrong, normalizedWeak });
    console.log("[/api/v2/deep-insights] KB size:", knowledgeBank.length);
    
    let candidates = knowledgeBank.filter(r => stretchLevels.includes(r.level));
    
    const priorityCategories = [...normalizedStrong, ...normalizedWeak];
    if (priorityCategories.length > 0) {
      const prioritized = candidates.filter(r => priorityCategories.includes(r.category));
      const remainder = candidates.filter(r => !priorityCategories.includes(r.category));
      candidates = [...prioritized, ...remainder];
    }
    
    candidates = candidates.sort(() => 0.5 - Math.random()).slice(0, 25);
    console.log("[/api/v2/deep-insights] Candidates:", candidates.map(c => c.id));

    let deepInsights: any[] = [];

    if (isOpenAIConfigured()) {
      const stageCompetencies = await fetchStageCompetencies(stage);
      const skillRelationships = await fetchSkillRelationships(normalizedWeak, normalizedStrong);
      
      // 3. Prompt OpenAI
      const systemPrompt = `You are a UX career strategist. Select 6 ADVANCED resources that:
      1. Deepen expertise in strong areas
      2. Are stage-appropriate (e.g., leadership for seniors)
      3. Bridge weak to strong areas strategically
      
      Explain WHY each resource is strategically valuable.
      Return JSON: { insights: [{ id, whyThisForYou }] }`;
      
      const userPrompt = `
      Stage: ${stage}
      Strong Categories: ${normalizedStrong.join(", ")}
      Weak Categories: ${normalizedWeak.join(", ")}
      Candidates: ${JSON.stringify(candidates.map(r => ({ id: r.id, title: r.title, category: r.category, level: r.level, summary: r.summary })))}
      Stage Strategy: ${JSON.stringify(stageCompetencies)}
      Skill Bridging: ${JSON.stringify(skillRelationships)}
      `;
      
      type InsightResponse = { insights: { id: string, whyThisForYou: string }[] };
      const response = await generateJSON<InsightResponse>(systemPrompt, userPrompt);
      
      if (response.data && response.data.insights) {
        deepInsights = response.data.insights.map(sel => {
          const original = knowledgeBank.find(r => r.id === sel.id);
          if (original) {
            return { ...original, whyThisForYou: sel.whyThisForYou };
          }
          return null;
        }).filter(Boolean);
      }
    }

    // Fallback: use candidates directly from knowledge bank
    if (deepInsights.length === 0) {
      console.log("[/api/v2/deep-insights] Using fallback - selecting from candidates");
      
      const strongOnly = candidates.filter(r => normalizedStrong.includes(r.category));
      const otherCandidates = candidates.filter(r => !normalizedStrong.includes(r.category));
      
      const selection = [
        ...strongOnly.slice(0, 3),
        ...otherCandidates
      ].slice(0, 6);

      deepInsights = selection.map(r => ({
        ...r,
        whyThisForYou: `Selected to help you advance your expertise in ${r.category}.`
      }));
      console.log("[/api/v2/deep-insights] Fallback selected:", deepInsights.map(i => i.id));
    }

    return res.json({ insights: deepInsights });
  } catch (error) {
    console.error("[/api/v2/deep-insights] Error:", error);
    return res.status(500).json({ error: "Failed to generate deep insights" });
  }
});

/**
 * POST /api/v2/improvement-plan
 * Generate 3-week personalized improvement plan
 * 
 * Input: { stage, strongCategories[], weakCategories[] }
 * Output: { weeks[] }
 */
app.post("/api/v2/improvement-plan", async (req, res) => {
  try {
    const { stage, strongCategories, weakCategories } = req.body ?? {};
    
    if (isOpenAIConfigured()) {
      // Construct categories for RAG context
      const categories = [
        ...(strongCategories || []).map((c: string) => ({ name: c, score: 100, maxScore: 100 })),
        ...(weakCategories || []).map((c: string) => ({ name: c, score: 50, maxScore: 100 }))
      ];
      // 1. Fetch RAG Context
      const ragResources = await fetchRAGContext(stage, categories);
      
      let contextString = "";
      if (ragResources.length > 0) {
        contextString = "\n\nKNOWLEDGE BASE RESOURCES (Build tasks around these):\n";
        ragResources.forEach((res, idx) => {
          contextString += `${idx + 1}. ${res.title} (${res.category})\n   Link: ${res.url}\n`;
        });
      }

      const systemPrompt = `You are a UX career coach. Create a 3-week improvement plan.
      Structure:
      - Week 1: Foundational improvements
      - Week 2: Deepening skills
      - Week 3: Strategic application
      
      For each week provide:
      - Theme
      - Focus areas (from their weak categories)
      - 3 Daily tasks (short, < 1hr)
      - 2 Deep work sessions (long, > 1.5hr)
      - Expected outcome
      
      ${contextString ? "IMPORTANT: Explicitly recommend reading/watching the provided Knowledge Base Resources in the daily tasks." : ""}
      
      Return strictly valid JSON.`;
      
      const userPrompt = `
      Stage: ${stage}
      Weakest Categories (Focus on these): ${weakCategories?.join(", ")}
      Strongest Categories (Leverage these): ${strongCategories?.join(", ")}
      ${contextString}
      `;
      
      type PlanResponse = {
        weeks: Array<{
          weekNumber: number;
          theme: string;
          focusAreas: string[];
          dailyTasks: Array<{ title: string; description: string; duration: string; category?: string }>;
          deepWorkTasks: Array<{ title: string; description: string; duration: string }>;
          expectedOutcome: string;
        }>;
      };
      
      const response = await generateJSON<PlanResponse>(systemPrompt, userPrompt);
      
      if (response.data && response.data.weeks) {
        // Map to ensure ID stability for React keys
        const weeks = response.data.weeks.map((week, wIdx) => ({
          ...week,
          dailyTasks: week.dailyTasks.map((t, tIdx) => ({ ...t, id: `w${wIdx}-d${tIdx}`, type: "daily" })),
          deepWorkTasks: week.deepWorkTasks.map((t, tIdx) => ({ ...t, id: `w${wIdx}-dw${tIdx}`, type: "deep-work" }))
        }));
        return res.json({ weeks });
      }
    }
    
    // Fallback
    const weeks = generateImprovementPlan(stage, strongCategories, weakCategories);
    return res.json({ weeks });
  } catch (error) {
    console.error("Error generating improvement plan:", error);
    const { stage, strongCategories, weakCategories } = req.body ?? {};
    const weeks = generateImprovementPlan(stage, strongCategories, weakCategories);
    return res.json({ weeks });
  }
});

  // ========================================
  // PREMIUM ACCESS API ENDPOINTS
  // ========================================
  // These endpoints manage device-level access tracking for premium features

  /**
   * GET /api/premium/access/status?deviceId=...
   * Returns the current access status for a device
   */
  app.get("/api/premium/access/status", async (req, res) => {
    try {
      const deviceId = req.query.deviceId as string;
      
      if (!deviceId) {
        return res.status(400).json({ error: "deviceId is required" });
      }

      let deviceAccess = await storage.getDeviceAccess(deviceId);
      
      // If device doesn't exist, create it with defaults
      if (!deviceAccess) {
        deviceAccess = await storage.createDeviceAccess({
          deviceId,
          attemptCount: 0,
          premiumUnlocked: false,
        });
      }

      return res.json({
        attemptCount: deviceAccess.attemptCount,
        premiumUnlocked: deviceAccess.premiumUnlocked,
      });
    } catch (error) {
      console.error("Error fetching device access status:", error);
      return res.status(500).json({ error: "Failed to fetch access status" });
    }
  });

  /**
   * POST /api/premium/access/increment
   * Increments the attempt count for a device (only if not premium)
   * Body: { deviceId }
   */
  app.post("/api/premium/access/increment", async (req, res) => {
    try {
      const { deviceId } = req.body;
      
      if (!deviceId) {
        return res.status(400).json({ error: "deviceId is required" });
      }

      let deviceAccess = await storage.getDeviceAccess(deviceId);
      
      // Create device if it doesn't exist
      if (!deviceAccess) {
        deviceAccess = await storage.createDeviceAccess({
          deviceId,
          attemptCount: 0,
          premiumUnlocked: false,
        });
      }

      // Only increment if not premium
      if (!deviceAccess.premiumUnlocked) {
        deviceAccess = await storage.updateDeviceAccess(deviceId, {
          attemptCount: deviceAccess.attemptCount + 1,
        });
      }

      return res.json({
        attemptCount: deviceAccess?.attemptCount ?? 0,
        premiumUnlocked: deviceAccess?.premiumUnlocked ?? false,
      });
    } catch (error) {
      console.error("Error incrementing attempt count:", error);
      return res.status(500).json({ error: "Failed to increment attempt count" });
    }
  });

  /**
   * POST /api/premium/access/set-premium
   * Marks a device as premium (internal use after payment verification)
   * Body: { deviceId, premiumUnlocked }
   */
  app.post("/api/premium/access/set-premium", async (req, res) => {
    try {
      const { deviceId, premiumUnlocked } = req.body;
      
      if (!deviceId) {
        return res.status(400).json({ error: "deviceId is required" });
      }

      let deviceAccess = await storage.getDeviceAccess(deviceId);
      
      // Create device if it doesn't exist
      if (!deviceAccess) {
        deviceAccess = await storage.createDeviceAccess({
          deviceId,
          attemptCount: 0,
          premiumUnlocked: premiumUnlocked ?? true,
        });
      } else {
        deviceAccess = await storage.updateDeviceAccess(deviceId, {
          premiumUnlocked: premiumUnlocked ?? true,
        });
      }

      return res.json({
        attemptCount: deviceAccess?.attemptCount ?? 0,
        premiumUnlocked: deviceAccess?.premiumUnlocked ?? false,
      });
    } catch (error) {
      console.error("Error setting premium status:", error);
      return res.status(500).json({ error: "Failed to set premium status" });
    }
  });

  // ========================================
  // PREMIUM PAYMENT API ENDPOINTS (STRIPE)
  // ========================================

  /**
   * POST /api/premium/payments/create-checkout-session
   * Creates a Stripe Checkout session for premium purchase
   * Body: { deviceId, redirectTo? }
   */
  app.post("/api/premium/payments/create-checkout-session", async (req, res) => {
    try {
      if (!isStripeConfigured()) {
        return res.status(503).json({ 
          error: "Payment system not configured. Please contact support." 
        });
      }

      const { deviceId, redirectTo } = req.body;
      
      if (!deviceId) {
        return res.status(400).json({ error: "deviceId is required" });
      }

      const priceId = getStripePriceId();
      if (!priceId) {
        return res.status(503).json({ 
          error: "Payment pricing not configured. Please contact support." 
        });
      }

      // Determine the base URL for redirects
      const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
      const host = req.headers.host || "localhost:3001";
      const baseUrl = `${protocol}://${host}`;

      // Build success and cancel URLs
      const successUrl = `${baseUrl}/premium/payment-success?session_id={CHECKOUT_SESSION_ID}&deviceId=${encodeURIComponent(deviceId)}${redirectTo ? `&redirectTo=${encodeURIComponent(redirectTo)}` : ""}`;
      const cancelUrl = `${baseUrl}/premium/quiz`;

      // Create Stripe Checkout Session
      const session = await stripe!.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          deviceId,
        },
      });

      return res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      return res.status(500).json({ 
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  /**
   * GET /api/premium/payments/confirm?session_id=...&deviceId=...
   * Confirms a payment and unlocks premium for the device
   */
  app.get("/api/premium/payments/confirm", async (req, res) => {
    try {
      if (!isStripeConfigured()) {
        return res.status(503).json({ 
          error: "Payment system not configured" 
        });
      }

      const sessionId = req.query.session_id as string;
      const deviceId = req.query.deviceId as string;
      
      if (!sessionId || !deviceId) {
        return res.status(400).json({ 
          error: "session_id and deviceId are required" 
        });
      }

      // Retrieve the Checkout Session from Stripe
      const session = await stripe!.checkout.sessions.retrieve(sessionId);

      // Verify the payment was successful
      if (session.payment_status !== "paid") {
        return res.status(400).json({ 
          error: "Payment not completed",
          paymentStatus: session.payment_status 
        });
      }

      // Verify the deviceId matches (security check)
      if (session.metadata?.deviceId !== deviceId) {
        return res.status(400).json({ 
          error: "Device ID mismatch" 
        });
      }

      // Mark the device as premium
      let deviceAccess = await storage.getDeviceAccess(deviceId);
      
      if (!deviceAccess) {
        deviceAccess = await storage.createDeviceAccess({
          deviceId,
          attemptCount: 0,
          premiumUnlocked: true,
        });
      } else {
        deviceAccess = await storage.updateDeviceAccess(deviceId, {
          premiumUnlocked: true,
        });
      }

      return res.json({
        success: true,
        premiumUnlocked: true,
        attemptCount: deviceAccess?.attemptCount ?? 0,
      });
    } catch (error) {
      console.error("Error confirming payment:", error);
      return res.status(500).json({ 
        error: "Failed to confirm payment",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
