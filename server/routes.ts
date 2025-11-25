import type { Express } from "express";
import { createServer, type Server } from "http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { storage } from "./storage";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    case "Emerging Senior":
      return "Senior Product Designer";
    case "Strategic Lead":
      return "Lead Product Designer";
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

  const httpServer = createServer(app);

  return httpServer;
}
