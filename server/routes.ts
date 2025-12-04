/**
 * ⚠️ CRITICAL WARNING: This file is NOT deployed to Vercel
 * 
 * Repository: ux-skills-assessment-backend
 * Deployment Target: ❌ NONE (Local development only)
 * 
 * This file exists for local development/testing purposes only.
 * Changes made here will NOT be deployed to production.
 * 
 * For production Vercel deployments, modify:
 * → ux-skills-assessment/server/routes.ts (Frontend repository)
 * 
 * See DEPLOYMENT_MAP.md for complete file-to-deployment mapping.
 * 
 * Last Updated: 2025-12-04
 */

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
  weakCategories: string[] = [],
  categoryScores?: any[]
): any[] {
  // Normalize stage name for backward compatibility
  const normalizedStage = stage === "Emerging Senior" ? "Emerging Lead" 
    : stage === "Strategic Lead" ? "Strategic Lead - Executive"
    : stage;
  
  // Check if user needs skill building (if categories available)
  const needsSkillBuilding = Array.isArray(categoryScores) && categoryScores.length > 0
    ? categoryScores.some((c: any) => 
        (c.score || 0) < 75 || c.band === "Needs Work" || c.band === "Learn the Basics"
      )
    : weakCategories.length > 0; // Conservative: if weakCategories provided, assume needs building
  
  const normalizedWeak = normalizeCategories(weakCategories);
  const normalizedStrong = normalizeCategories(strongCategories);
  const focusAreas =
    normalizedWeak.length > 0 ? normalizedWeak : getFallbackFocusCategories(normalizedStage);
  const stageLevel = getLevelForStage(normalizedStage);
  const stretchLevels = getStretchLevelsForStage(normalizedStage);

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

  // Stage-specific themes and tasks
  const getStageSpecificPlan = () => {
    if (stage === "Strategic Lead - C-Suite") {
      return {
        week1: {
          theme: "Organizational Strategy Foundation",
          practiceLabel: "Strategic analysis",
          practiceDescription: (category: Category) =>
            `Analyze how ${category} impacts organizational design maturity and business outcomes at the executive level.`,
          deepWork: [
            {
              title: "Design vision & transformation roadmap",
              description: "Create a strategic design vision document and transformation roadmap for board-level presentation.",
            },
            {
              title: "Design ROI framework",
              description: "Develop a framework to measure and communicate design's impact on business metrics at the C-suite level.",
            },
          ],
          expectedOutcome: "Clear strategic design vision aligned with business transformation goals.",
        },
        week2: {
          theme: "Executive Leadership & Influence",
          practiceLabel: "Executive communication",
          practiceDescription: (category: Category) =>
            `Prepare a board-level presentation on ${category} strategy and its business impact.`,
          deepWork: [
            {
              title: "Cross-functional executive alignment",
              description: "Lead a strategic session with C-suite peers to align design strategy with company-wide initiatives.",
            },
            {
              title: "Design-driven business transformation",
              description: "Document how design can drive organizational transformation and competitive advantage.",
            },
          ],
          expectedOutcome: "Established design as a strategic business function with executive buy-in.",
        },
        week3: {
          theme: "Design Vision & Organizational Impact",
          practiceLabel: "Vision articulation",
          practiceDescription: (category: Category) =>
            `Articulate how ${category} contributes to the company's long-term design vision and competitive positioning.`,
          deepWork: [
            {
              title: "Board-level design strategy presentation",
              description: "Create and deliver a comprehensive design strategy presentation to the board or executive team.",
            },
            {
              title: "Design maturity assessment & roadmap",
              description: "Assess organizational design maturity and create a multi-year roadmap for design excellence.",
            },
          ],
          expectedOutcome: "Design positioned as a core strategic capability driving business transformation.",
        },
      };
    } else if (normalizedStage === "Strategic Lead - Executive") {
      return {
        week1: {
          theme: "VP-Level Strategy Foundation",
          practiceLabel: "Strategic planning",
          practiceDescription: (category: Category) =>
            `Develop a VP-level strategy for ${category} that aligns with organizational goals and cross-functional priorities.`,
          deepWork: [
            {
              title: "Design team growth strategy",
              description: "Create a comprehensive plan for scaling the design team and establishing design excellence standards.",
            },
            {
              title: "Cross-functional partnership framework",
              description: "Develop a framework for building strategic partnerships with VP-level peers across product, engineering, and business.",
            },
          ],
          expectedOutcome: "Clear VP-level design strategy with cross-functional alignment.",
        },
        week2: {
          theme: "Organizational Influence & Culture Building",
          practiceLabel: "Organizational influence",
          practiceDescription: (category: Category) =>
            `Build influence and alignment around ${category} strategy with VP-level stakeholders across the organization.`,
          deepWork: [
            {
              title: "Design culture at scale",
              description: "Design and implement initiatives to build design culture across multiple teams and products.",
            },
            {
              title: "Design metrics & impact at scale",
              description: "Establish metrics and frameworks to measure design impact across the organization.",
            },
          ],
          expectedOutcome: "Design culture and influence established at the organizational level.",
        },
        week3: {
          theme: "Strategic Execution & Scale",
          practiceLabel: "Strategic execution",
          practiceDescription: (category: Category) =>
            `Execute on ${category} strategy with measurable impact and clear communication to executive leadership.`,
          deepWork: [
            {
              title: "Executive design review & presentation",
              description: "Present design strategy and impact to executive leadership with clear business outcomes.",
            },
            {
              title: "Design team development & scaling plan",
              description: "Create a comprehensive plan for developing and scaling the design organization.",
            },
          ],
          expectedOutcome: "Design strategy executed with measurable organizational impact.",
        },
      };
    } else if (normalizedStage === "Strategic Lead - Senior") {
      return {
        week1: {
          theme: "Design Direction & Team Leadership",
          practiceLabel: "Design direction",
          practiceDescription: (category: Category) =>
            `Establish design direction and standards for ${category} across your team and products.`,
          deepWork: [
            {
              title: "Design system & standards",
              description: "Lead the creation or evolution of design systems and quality standards for your team.",
            },
            {
              title: "Team development & mentoring",
              description: "Create a development plan for your design team and establish mentoring relationships.",
            },
          ],
          expectedOutcome: "Clear design direction and team development framework established.",
        },
        week2: {
          theme: "Process Excellence & Quality Standards",
          practiceLabel: "Process improvement",
          practiceDescription: (category: Category) =>
            `Improve design processes and quality standards for ${category} work across your team.`,
          deepWork: [
            {
              title: "Design process optimization",
              description: "Audit and optimize design processes to improve quality and efficiency across your team.",
            },
            {
              title: "Design quality framework",
              description: "Establish a framework for measuring and maintaining design quality at scale.",
            },
          ],
          expectedOutcome: "Design processes and quality standards improved and documented.",
        },
        week3: {
          theme: "Strategic Impact & Visibility",
          practiceLabel: "Strategic impact",
          practiceDescription: (category: Category) =>
            `Demonstrate strategic impact of ${category} work and increase visibility of design's value.`,
          deepWork: [
            {
              title: "Design impact case study",
              description: "Create a comprehensive case study demonstrating design's impact on business outcomes.",
            },
            {
              title: "Design leadership presentation",
              description: "Present design strategy and impact to leadership with clear recommendations.",
            },
          ],
          expectedOutcome: "Design impact demonstrated with clear strategic value and visibility.",
        },
      };
    } else if (normalizedStage === "Emerging Lead") {
      // If user has weak skills, focus on skill building first
      if (needsSkillBuilding) {
        return {
          week1: {
            theme: "Skill Foundation Building",
            practiceLabel: "Skill practice",
            practiceDescription: (category: Category) =>
              `Focus on building your ${category} skills through hands-on practice and structured learning.`,
            deepWork: [
              {
                title: "Hands-on skill building",
                description: "Complete 2-3 practical exercises to strengthen your capabilities in your weakest areas.",
              },
              {
                title: "Structured learning project",
                description: "Apply concepts in a real project with measurable outcomes to demonstrate improvement.",
              },
            ],
            expectedOutcome: "Stronger foundation with measurable skill improvement.",
          },
          week2: {
            theme: "Strategic Application",
            practiceLabel: "Strategic practice",
            practiceDescription: (category: Category) =>
              `Apply your improved ${category} skills in strategic contexts and real-world scenarios.`,
            deepWork: [
              {
                title: "Strategic project application",
                description: "Lead a project that applies your strengthened skills to solve a strategic problem.",
              },
              {
                title: "Cross-functional collaboration",
                description: "Collaborate with product and engineering to demonstrate your growing expertise.",
              },
            ],
            expectedOutcome: "Skills applied strategically with visible impact.",
          },
          week3: {
            theme: "Leadership Transition Foundation",
            practiceLabel: "Leadership practice",
            practiceDescription: (category: Category) =>
              `Begin transitioning to leadership by mentoring others in ${category}.`,
            deepWork: [
              {
                title: "Mentorship & coaching",
                description: "Share your strengthened skills by mentoring junior designers.",
              },
              {
                title: "Strategic thinking exercise",
                description: "Practice strategic thinking by analyzing product decisions from a business perspective.",
              },
            ],
            expectedOutcome: "Foundation for leadership transition established after skill strengthening.",
          },
        };
      }
      
      // Default leadership-focused plan for users with strong skills
      return {
        week1: {
          theme: "Leadership Transition Foundation",
          practiceLabel: "Leadership practice",
          practiceDescription: (category: Category) =>
            `Practice leading ${category} initiatives and mentoring junior designers.`,
          deepWork: [
            {
              title: "Mentorship & coaching",
              description: "Establish mentoring relationships and practice coaching junior designers.",
            },
            {
              title: "Strategic thinking exercise",
              description: "Practice strategic thinking by analyzing product decisions from a business perspective.",
            },
          ],
          expectedOutcome: "Foundation for leadership transition established.",
        },
        week2: {
          theme: "Influence & Product Impact",
          practiceLabel: "Influence building",
          practiceDescription: (category: Category) =>
            `Build influence around ${category} decisions with product and engineering partners.`,
          deepWork: [
            {
              title: "Product strategy influence",
              description: "Participate in product strategy discussions and influence decisions with design thinking.",
            },
            {
              title: "Cross-functional collaboration",
              description: "Lead a cross-functional initiative demonstrating design's strategic value.",
            },
          ],
          expectedOutcome: "Increased influence on product decisions and cross-functional collaboration.",
        },
        week3: {
          theme: "Strategic Application & Visibility",
          practiceLabel: "Strategic application",
          practiceDescription: (category: Category) =>
            `Apply strategic thinking to ${category} work and increase visibility of your leadership potential.`,
          deepWork: [
            {
              title: "Strategic design narrative",
              description: "Create a strategic narrative connecting your design work to business outcomes.",
            },
            {
              title: "Leadership visibility project",
              description: "Lead a visible project that demonstrates your readiness for senior leadership.",
            },
          ],
          expectedOutcome: "Strategic mindset demonstrated with increased leadership visibility.",
        },
      };
    } else if (normalizedStage === "Practitioner") {
      return {
        week1: {
      theme: "Foundation Fix",
      practiceLabel: "Apply fundamentals",
          practiceDescription: (category: Category) =>
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
          expectedOutcome: "Solid understanding of foundational concepts and initial practice experience.",
        },
        week2: {
      theme: "Depth & Ownership",
      practiceLabel: "Critique & iterate",
          practiceDescription: (category: Category) =>
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
          expectedOutcome: "Clearer craftsmanship, improved documentation habits, and tighter stakeholder alignment.",
        },
        week3: {
      theme: "Strategy & Visibility",
      practiceLabel: "Share and mentor",
          practiceDescription: (category: Category) =>
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
          expectedOutcome: "Strategic mindset and increased visibility through documented work.",
        },
      };
    } else {
      // Explorer - default
      return {
        week1: {
          theme: "Foundation Fix",
          practiceLabel: "Apply fundamentals",
          practiceDescription: (category: Category) =>
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
          expectedOutcome: "Solid understanding of foundational concepts and initial practice experience.",
        },
        week2: {
          theme: "Depth & Ownership",
          practiceLabel: "Critique & iterate",
          practiceDescription: (category: Category) =>
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
          expectedOutcome: "Clearer craftsmanship, improved documentation habits, and tighter stakeholder alignment.",
        },
        week3: {
          theme: "Strategy & Visibility",
          practiceLabel: "Share and mentor",
          practiceDescription: (category: Category) =>
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
          expectedOutcome: "Strategic mindset and increased visibility through documented work.",
        },
      };
    }
  };

  const plan = getStageSpecificPlan();

  return [
    buildWeekPlan({
      weekNumber: 1,
      theme: plan.week1.theme,
      focusAreas: focusAreas.slice(0, 2),
      resources: week1Resources,
      practiceLabel: plan.week1.practiceLabel,
      practiceDescription: plan.week1.practiceDescription,
      deepWork: plan.week1.deepWork,
      expectedOutcome: plan.week1.expectedOutcome,
    }),
    buildWeekPlan({
      weekNumber: 2,
      theme: plan.week2.theme,
      focusAreas,
      resources: week2Resources,
      practiceLabel: plan.week2.practiceLabel,
      practiceDescription: plan.week2.practiceDescription,
      deepWork: plan.week2.deepWork,
      expectedOutcome: plan.week2.expectedOutcome,
    }),
    buildWeekPlan({
      weekNumber: 3,
      theme: plan.week3.theme,
      focusAreas,
      resources: week3Resources,
      practiceLabel: plan.week3.practiceLabel,
      practiceDescription: plan.week3.practiceDescription,
      deepWork: plan.week3.deepWork,
      expectedOutcome: plan.week3.expectedOutcome,
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
  expectedOutcome,
}: {
  weekNumber: number;
  theme: string;
  focusAreas: Category[];
  resources: Resource[];
  practiceLabel: string;
  practiceDescription: (category: Category) => string;
  deepWork: Array<{ title: string; description: string }>;
  expectedOutcome?: string;
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
    expectedOutcome: expectedOutcome || (
      weekNumber === 1
        ? "Solid understanding of foundational concepts and initial practice experience."
        : weekNumber === 2
        ? "Clearer craftsmanship, improved documentation habits, and tighter stakeholder alignment."
        : "Strategic mindset and increased visibility through documented work."
    ),
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

const STAGE_DESCRIPTIONS: Record<string, string> = {
  "Explorer": "Entry-level UX designer learning fundamentals. Focus on building core skills, understanding basic UX principles, and getting hands-on experience with real projects.",
  "Practitioner": "Mid-level UX designer (including Senior Product Designer). Focus on deepening expertise in specific areas, taking ownership of end-to-end design work, and improving research and craft skills.",
  "Emerging Lead": "Senior individual contributor transitioning to leadership. Focus on strategic thinking, mentoring others, and learning to influence product decisions beyond just design execution.",
  "Emerging Senior": "Senior individual contributor transitioning to leadership. Focus on strategic thinking, mentoring others, and learning to influence product decisions beyond just design execution.", // Backward compatibility
  "Strategic Lead - Senior": "Design Director/AVP level. Focus on design direction, team leadership, driving design excellence across products, and establishing design processes and standards.",
  "Strategic Lead - Executive": "VP of Design level. Focus on organizational design strategy, cross-functional influence at the executive level, building design culture at scale, and connecting design to business outcomes.",
  "Strategic Lead - C-Suite": "SVP/CDO/Chief Design Officer level. Focus on design vision and organizational transformation, board-level presentations, driving design as a strategic business function, and shaping company-wide design strategy.",
  "Strategic Lead": "VP of Design level. Focus on organizational design strategy, cross-functional influence at the executive level, building design culture at scale, and connecting design to business outcomes.", // Backward compatibility
};

function getLevelForStage(stage: string): ResourceLevel {
  // Backward compatibility: map old stage names to new ones
  const normalizedStage = stage === "Emerging Senior" ? "Emerging Lead" 
    : stage === "Strategic Lead" ? "Strategic Lead - Executive"
    : stage;
  return STAGE_TO_LEVEL[normalizedStage] ?? STAGE_TO_LEVEL[stage] ?? "explorer";
}

function getStretchLevelsForStage(stage: string): ResourceLevel[] {
  // Backward compatibility: map old stage names to new ones
  const normalizedStage = stage === "Emerging Senior" ? "Emerging Lead" 
    : stage === "Strategic Lead" ? "Strategic Lead - Executive"
    : stage;
  return STRETCH_LEVELS[normalizedStage] ?? STRETCH_LEVELS[stage] ?? ["strategic-lead"];
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
  // Backward compatibility: map old stage names to new ones
  const normalizedStage = stage === "Emerging Senior" ? "Emerging Lead" 
    : stage === "Strategic Lead" ? "Strategic Lead - Executive"
    : stage;
  return STAGE_FOCUS_CATEGORIES[normalizedStage] ?? STAGE_FOCUS_CATEGORIES[stage] ?? ["UX Fundamentals", "User Research & Validation"];
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

// Helper: Get RAG URL from environment
// Updated: 2025-12-04 - Increased timeout to 10s for cross-cloud communication
function getRAGUrl(): string {
  return process.env.PYTHON_API_URL || process.env.RAG_API_URL || "http://localhost:8000";
}

// Diagnostic endpoint to check RAG configuration
app.get("/api/debug/rag-config", (_req, res) => {
  const ragUrl = getRAGUrl();
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasPythonUrl = !!process.env.PYTHON_API_URL;
  const hasRagUrl = !!process.env.RAG_API_URL;
  
  return res.json({
    ragUrl,
    configured: {
      OPENAI_API_KEY: hasOpenAI,
      PYTHON_API_URL: hasPythonUrl,
      RAG_API_URL: hasRagUrl,
    },
    env: process.env.NODE_ENV || "development"
  });
});

// Helper to fetch RAG context from Python backend
async function fetchRAGContext(stage: string, categories: any[]): Promise<any[]> {
  try {
    // Set timeout for cross-cloud communication (10s for Vercel → Railway)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    // Use environment variable or default to localhost for local dev
    const ragUrl = getRAGUrl();
    const response = await fetch(`${ragUrl}/api/rag/retrieve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stage,
        categories: categories.map(c => ({
          name: c.name,
          score: c.finalScore || c.score,
          maxScore: 100
        })),
        top_k: 15  // Request more resources for better diversity
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
    const ragUrl = getRAGUrl();
    console.warn(`RAG Context Retrieval skipped (URL: ${ragUrl}):`, error instanceof Error ? error.message : "Unknown error");
  }
  return [];
}

// Helper: Fetch Learning Paths from RAG
async function fetchLearningPaths(categories: string[]): Promise<any> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // Increased timeout
    const ragUrl = getRAGUrl();
    const response = await fetch(`${ragUrl}/api/rag/learning-paths`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categories }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (response.ok) return (await response.json()).paths;
  } catch (e) { 
    console.warn("Learning Path RAG skipped:", e instanceof Error ? e.message : "Unknown error"); 
  }
  return {};
}

// Helper: Fetch Stage Competencies from RAG
async function fetchStageCompetencies(stage: string): Promise<any[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // Increased timeout
    const ragUrl = getRAGUrl();
    const response = await fetch(`${ragUrl}/api/rag/stage-competencies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (response.ok) return (await response.json()).competencies;
  } catch (e) { 
    console.warn("Stage Comp RAG skipped:", e instanceof Error ? e.message : "Unknown error"); 
  }
  return [];
}

// Helper: Fetch Skill Relationships from RAG
async function fetchSkillRelationships(weak: string[], strong: string[]): Promise<any[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // Increased timeout
    const ragUrl = getRAGUrl();
    const response = await fetch(`${ragUrl}/api/rag/skill-relationships`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weak_categories: weak, strong_categories: strong }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (response.ok) return (await response.json()).relationships;
  } catch (e) { 
    console.warn("Skill Rel RAG skipped:", e instanceof Error ? e.message : "Unknown error"); 
  }
  return [];
}

// Helper: Fetch Social Media Resources from Vector Store
async function fetchSocialMediaResources(stage: string, categories: any[]): Promise<any[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // Increased timeout
    const ragUrl = getRAGUrl();
    
    // Query vector store for social media content (videos, podcasts, tweets)
    const response = await fetch(`${ragUrl}/api/rag/social-media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stage,
        categories: categories.map(c => ({
          name: c.name,
          score: c.finalScore || c.score || 0,
          maxScore: 100
        })),
        resource_types: ["video", "podcast", "tweet"],
        limit: 8
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.resources)) {
        console.log(`✓ Social Media: Retrieved ${data.resources.length} resources`);
        return data.resources;
      }
    }
  } catch (error) {
    console.warn("Social Media RAG skipped:", error instanceof Error ? error.message : "Unknown error");
  }
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
        contextString = "\n\nAVAILABLE RESOURCES:\n";
        ragResources.forEach((res, idx) => {
          contextString += `${idx + 1}. "${res.title}" (${res.category}) - ${res.url}\n`;
        });
      }

      const systemPrompt = `You are a senior UX mentor creating personalized action plans.

For each category, analyze:
- Their EXACT score - what does this specific number mean?
- Their stage (${stage}) - what are the expectations and growth path?
- Their band - what's the appropriate challenge level?

Generate:
1. A 2-sentence description SPECIFIC to their score and ${stage} stage
2. A checklist of 3-5 HIGHLY SPECIFIC tasks that:
   - Reference actual resources from the provided list when relevant (use exact titles in quotes)
   - Are appropriate for ${stage} level (not too basic, not too advanced)
   - Address the specific gap to the next level (e.g., 67% → 75%)
   - Include concrete examples and measurable outcomes
   - Are time-bound when possible (e.g., "this week", "within 2 weeks")

${contextString ? `${contextString}\n\nReference specific resources by title in your tasks. Example: "Read 'User Interviews 101' from NN/g and practice conducting 2 interviews this week."` : ""}
      
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
    const { stage, weakCategories, categories } = req.body ?? {};
    const normalizedWeakCategories = normalizeCategories(weakCategories);
    const level = getLevelForStage(stage);
    
    // 40% SKILL-BASED: Build score-aware prioritization (SECONDARY)
    const categoryScores = Array.isArray(categories) ? categories.map((cat: any) => {
      const computedScore = cat.score || cat.finalScore || 0;
      return {
      name: cat.name,
        score: computedScore,
        band: cat.band || (computedScore >= 80 ? "Strong" : computedScore >= 40 ? "Needs Work" : "Learn the Basics")
      };
    }) : [];
    
    // Find weakest categories by actual score (for 40% personalization)
    const sortedByScore = [...categoryScores].sort((a, b) => a.score - b.score);
    const scoreBasedWeakCategories = sortedByScore
      .filter(cat =>
        // Treat anything below ~B+ (75%) as a growth/weak area
        cat.score < 75 ||
        cat.band === "Needs Work" ||
        cat.band === "Learn the Basics"
      )
      .map(cat => cat.name)
      .slice(0, 2);
    
    // Combine: Use score-based weak categories if available, otherwise use provided weakCategories
    const focusCategories = scoreBasedWeakCategories.length > 0
      ? scoreBasedWeakCategories
      : (normalizedWeakCategories.length > 0
          ? normalizedWeakCategories
          : getFallbackFocusCategories(stage));
    
    console.log("[/api/v2/resources] Request:", { 
      stage, 
      level,
      focusCategories,
      scoreBasedWeak: scoreBasedWeakCategories,
      categoryScores: categoryScores.map(c => `${c.name}: ${c.score}%`)
    });
    
    // PRIMARY: Use RAG to retrieve resources from vector database
    let candidates: any[] = [];
    let ragResources: any[] = [];
    
    try {
      // Fetch resources from RAG vector database
      ragResources = await fetchRAGContext(stage, categoryScores.length > 0 ? categoryScores : []);
      console.log(`[/api/v2/resources] RAG retrieved ${ragResources.length} resources from vector database`);
      
      if (ragResources.length > 0) {
        // Convert RAG resources to Resource format
        candidates = ragResources.map((ragRes: any) => {
          // Map RAG resource to knowledge bank format
          const mappedResource: any = {
            id: ragRes.resource_id || `rag-${ragRes.url?.replace(/[^a-zA-Z0-9]/g, '-')}`,
            title: ragRes.title || ragRes.metadata?.title || 'Untitled Resource',
            url: ragRes.url || ragRes.metadata?.url || '',
            summary: ragRes.summary || ragRes.metadata?.summary || ragRes.content?.substring(0, 200) || '',
            category: ragRes.category || ragRes.metadata?.category || 'UX Fundamentals',
            level: ragRes.level || ragRes.metadata?.level || level,
            type: ragRes.resource_type || ragRes.metadata?.resource_type || 'article',
            difficulty: ragRes.difficulty || ragRes.metadata?.difficulty || 'intermediate',
            tags: ragRes.tags || ragRes.metadata?.tags || [],
            author: ragRes.author || ragRes.metadata?.author || '',
            duration: ragRes.estimated_read_time ? `${ragRes.estimated_read_time} min` : '',
            _rag: true, // Mark as RAG resource
            _relevance_score: ragRes.relevance_score || 0
          };
          return mappedResource;
        });
        
        // Filter by level for progressive learning: 70% current level, 30% stretch
        const exactLevelMatches = candidates.filter(r => r.level === level);
        const stretchLevels = getStretchLevelsForStage(stage);
        const stretchMatches = candidates.filter(r => 
          stretchLevels.some(stretchLevel => r.level === stretchLevel)
        );
        
        // Progressive learning targets: ~11 current level, ~4 stretch
        const targetCurrent = Math.ceil(15 * 0.7);
        const targetStretch = Math.floor(15 * 0.3);
        
        console.log(`[/api/v2/resources] Level filtering: ${exactLevelMatches.length} at ${level}, ${stretchMatches.length} stretch (${stretchLevels.join(', ')})`);
        
        if (exactLevelMatches.length >= targetCurrent) {
          // Enough current-level resources, use 70/30 split
          candidates = [
            ...exactLevelMatches.slice(0, targetCurrent),
            ...stretchMatches.slice(0, targetStretch)
          ];
        } else {
          // Not enough current-level, use what we have + stretch to fill
          candidates = [
            ...exactLevelMatches,
            ...stretchMatches.slice(0, 15 - exactLevelMatches.length)
          ];
        }
        
        console.log(`[/api/v2/resources] After level filtering: ${candidates.length} candidates (${candidates.filter(r => r.level === level).length} current, ${candidates.filter(r => stretchLevels.includes(r.level)).length} stretch)`);
        
        // Group by category for diversity
        const byCategory: Record<string, any[]> = {};
        candidates.forEach(r => {
          if (!byCategory[r.category]) byCategory[r.category] = [];
          byCategory[r.category].push(r);
        });
        
        // Ensure diversity: prioritize focus categories but limit per category
        const diverseCandidates: any[] = [];
        
        // Add 2-3 from focus categories
        for (const cat of focusCategories) {
          const catResources = byCategory[cat] || [];
          diverseCandidates.push(...catResources.slice(0, 3));
        }
        
        // Add 1-2 from other categories
        const otherCategories = Object.keys(byCategory).filter(cat => !focusCategories.includes(cat));
        for (const cat of otherCategories) {
          const catResources = byCategory[cat] || [];
          diverseCandidates.push(...catResources.slice(0, 2));
        }
        
        // Sort by relevance score and limit to 15
        diverseCandidates.sort((a, b) => (b._relevance_score || 0) - (a._relevance_score || 0));
        candidates = diverseCandidates.slice(0, 15);
        
        console.log(`[/api/v2/resources] RAG candidates (${candidates.length}):`, candidates.map(c => `${c.category}: ${c.title.substring(0, 40)}...`));
      }
    } catch (ragError) {
      console.warn("[/api/v2/resources] RAG retrieval failed, falling back to static knowledge bank:", ragError);
    }
    
    // FALLBACK: If RAG returned no resources, use static knowledge bank
    if (candidates.length === 0) {
      console.log("[/api/v2/resources] Using static knowledge bank fallback");
      
      // 60% LEVEL-BASED: Get all stage-level resources (PRIMARY)
      let stageResources = knowledgeBank.filter(r => r.level === level);
      console.log("[/api/v2/resources] Stage resources found:", stageResources.length, "for level:", level);
      
      // Safety check: If no resources found for this level, use stretch levels as fallback
      if (stageResources.length === 0) {
        const stretchLevels = getStretchLevelsForStage(stage);
        console.warn(`[/api/v2/resources] No ${level} resources found for stage "${stage}"; using stretch levels:`, stretchLevels);
        stageResources = knowledgeBank.filter(r => stretchLevels.includes(r.level));
        console.log("[/api/v2/resources] Stretch resources found:", stageResources.length);
        
        // If still empty (shouldn't happen), fall back to entire knowledge bank as last resort
        if (stageResources.length === 0) {
          console.error("[/api/v2/resources] CRITICAL: No resources found even with stretch levels! Falling back to entire knowledge bank.");
          stageResources = [...knowledgeBank];
        }
      }
      
      // Group stage resources by category for balanced selection
      const byCategory: Record<string, Resource[]> = {};
      stageResources.forEach(r => {
        if (!byCategory[r.category]) byCategory[r.category] = [];
        byCategory[r.category].push(r);
      });
      
      // 40% SKILL-BASED: Add resources from focus categories (weakest by score)
      // But limit per category to ensure diversity
    if (focusCategories.length > 0) {
        for (const cat of focusCategories) {
          const catResources = byCategory[cat] || [];
          // Add up to 3 resources per focus category (to allow for diversity)
          candidates.push(...catResources.slice(0, 3));
        }
      }
      
      // 60% LEVEL-BASED: Add diverse resources from other categories
      const otherCategories = Object.keys(byCategory).filter(cat => !focusCategories.includes(cat));
      for (const cat of otherCategories) {
        // Add up to 2 resources per other category
        const catResources = byCategory[cat] || [];
        candidates.push(...catResources.slice(0, 2));
      }
      
      // Limit to 15 candidates for AI selection (ensuring category diversity)
    candidates = candidates.slice(0, 15);
    }
    
    console.log("[/api/v2/resources] Final candidates:", candidates.length, candidates.map(c => c.id));

    let selectedResources: any[] = [];

    if (isOpenAIConfigured()) {
      try {
        // Use score-based weak categories for RAG context (40% skill-based personalization)
        const learningPaths = await fetchLearningPaths(focusCategories);
        const stageCompetencies = await fetchStageCompetencies(stage);
        
        // Prompt emphasizes 60% level, 40% skill scores, with category diversity
        const systemPrompt = `You are a UX learning advisor. Select the 5 BEST resources for this user.

SELECTION CRITERIA (weighted):
- 60% PRIMARY: Resources MUST be appropriate for "${stage}" level (${level} level content)
- 40% SECONDARY: Prioritize resources that address their weakest skill areas based on actual scores (shown below)
- DIVERSITY: Ensure variety across categories - don't select all resources from the same category. Aim for 2-3 different categories.

Explain WHY each one specifically addresses their gaps while being appropriate for their ${stage} level.
Return JSON: { resources: [{ id, reasonSelected }] }
IMPORTANT: Only use IDs from the provided Candidates list.`;
        
        const userPrompt = `
Stage: ${stage} (Level: ${level})
Focus Categories (weakest by score): ${focusCategories.join(", ")}

Category Scores (for 40% prioritization within ${level} level):
${categoryScores.map(c => `- ${c.name}: ${c.score}% (${c.band})`).join("\n")}

Candidates (all from ${level} level): ${JSON.stringify(candidates.map(r => ({ id: r.id, title: r.title, category: r.category, summary: r.summary })))}
Learning Context: ${JSON.stringify(learningPaths)}
Stage Context: ${JSON.stringify(stageCompetencies)}
`;
        
        type ResourceResponse = { resources: { id: string, reasonSelected: string }[] };
        const response = await generateJSON<ResourceResponse>(systemPrompt, userPrompt);
        
        if (response.data && response.data.resources) {
          selectedResources = response.data.resources.map(sel => {
            // First try to find in candidates (which may include RAG resources)
            let original = candidates.find(r => r.id === sel.id);
            // Fallback to knowledge bank if not found in candidates
            if (!original) {
              original = knowledgeBank.find(r => r.id === sel.id);
            }
            if (original) {
              return { ...original, reasonSelected: sel.reasonSelected };
            }
            return null;
          }).filter(Boolean);
          
          // Ensure category diversity: if all resources are from the same category, diversify
          const selectedCategories = new Set(selectedResources.map((r: any) => r.category));
          if (selectedCategories.size === 1 && selectedResources.length >= 3) {
            // Replace 1-2 resources with different categories from candidates
            const singleCategory = Array.from(selectedCategories)[0];
            const diverseCandidates = candidates.filter(r => r.category !== singleCategory);
            const toReplace = Math.min(2, Math.floor(selectedResources.length / 2));
            for (let i = 0; i < toReplace && diverseCandidates.length > 0; i++) {
              const replacement = diverseCandidates[i];
              if (!selectedResources.find((r: any) => r.id === replacement.id)) {
                selectedResources[i] = {
                  ...replacement,
                  reasonSelected: `Recommended to strengthen your ${replacement.category} skills at ${stage} level.`
                };
              }
            }
          }
          
          console.log("[/api/v2/resources] AI selected:", selectedResources.length, "resources");
          console.log("[/api/v2/resources] Categories:", Array.from(new Set(selectedResources.map((r: any) => r.category))));
        } else {
          console.warn("[/api/v2/resources] AI returned no data:", response.error || "Unknown error");
        }
      } catch (aiError) {
        console.warn("[/api/v2/resources] AI failed, using fallback:", aiError);
      }
    }

    // Fallback: use candidates directly (already level-filtered, skill-prioritized)
    if (selectedResources.length === 0) {
      console.log("[/api/v2/resources] Using fallback - selecting from candidates");
      
      // If candidates is empty, fallback to static knowledge bank
      if (candidates.length === 0) {
        console.warn("[/api/v2/resources] Candidates empty, falling back to static knowledge bank");
        const level = getLevelForStage(stage);
        let stageResources = knowledgeBank.filter(r => r.level === level);
        if (stageResources.length === 0) {
          const stretchLevels = getStretchLevelsForStage(stage);
          stageResources = knowledgeBank.filter(r => stretchLevels.includes(r.level));
        }
        candidates = stageResources.slice(0, 15);
      }
      
      // 40% skill-based: Prioritize focus categories first, then others (60% level-based)
      // Ensure category diversity
      const focusMatches = candidates.filter(r => focusCategories.includes(r.category));
      const others = candidates.filter(r => !focusCategories.includes(r.category));
      
      // Group by category for diversity
      const byCategory: Record<string, Resource[]> = {};
      candidates.forEach(r => {
        if (!byCategory[r.category]) byCategory[r.category] = [];
        byCategory[r.category].push(r);
      });
      
      // Select diverse resources: prioritize focus categories but ensure variety
      const selected: Resource[] = [];
      const usedIds = new Set<string>();
      
      // First, add 1-2 from each focus category (up to 2 total)
      for (const cat of focusCategories) {
        if (selected.length >= 2) break;
        const catResources = byCategory[cat] || [];
        for (const r of catResources) {
          if (!usedIds.has(r.id) && selected.length < 2) {
            selected.push(r);
            usedIds.add(r.id);
            break;
          }
        }
      }
      
      // Then add diverse resources from other categories (up to 5 total)
      const otherCategories = Object.keys(byCategory).filter(cat => !focusCategories.includes(cat));
      for (const cat of otherCategories) {
        if (selected.length >= 5) break;
        const catResources = byCategory[cat] || [];
        for (const r of catResources) {
          if (!usedIds.has(r.id) && selected.length < 5) {
            selected.push(r);
            usedIds.add(r.id);
            break;
          }
        }
      }
      
      // Fill remaining slots from any category if needed
      if (selected.length < 5) {
        for (const r of candidates) {
          if (!usedIds.has(r.id) && selected.length < 5) {
            selected.push(r);
            usedIds.add(r.id);
          }
        }
      }
      
      selectedResources = selected.slice(0, 5).map(r => ({
        ...r,
        reasonSelected: `Recommended to strengthen your ${r.category} skills at ${stage} level.`
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
    const { stage, strongCategories, weakCategories, categories } = req.body ?? {};
    const stretchLevels = getStretchLevelsForStage(stage);
    const normalizedStrong = normalizeCategories(strongCategories);
    const normalizedWeak = normalizeCategories(weakCategories);
    
    // 70% LEVEL-BASED: Get stretch-level resources (PRIMARY)
    let candidates = knowledgeBank.filter(r => stretchLevels.includes(r.level));
    console.log("[/api/v2/deep-insights] Stretch-level candidates:", candidates.length);
    
    // 30% SKILL-BASED: Build score-aware prioritization (SECONDARY)
    const categoryScores = Array.isArray(categories) ? categories.map((cat: any) => {
      const computedScore = cat.score || cat.finalScore || 0;
      return {
      name: cat.name,
        score: computedScore,
        band: cat.band || (computedScore >= 80 ? "Strong" : computedScore >= 40 ? "Needs Work" : "Learn the Basics")
      };
    }) : [];
    
    // Identify strong/weak by actual scores (for 30% personalization)
    const scoreBasedStrong = categoryScores
      .filter(cat => cat.score >= 80)
      .map(cat => cat.name);
    const scoreBasedWeak = categoryScores
      .filter(cat => cat.score < 60)
      .map(cat => cat.name);
    
    // Combine: Use score-based if available, otherwise use provided categories
    const actualStrong = scoreBasedStrong.length > 0 ? scoreBasedStrong : normalizedStrong;
    const actualWeak = scoreBasedWeak.length > 0 ? scoreBasedWeak : normalizedWeak;
    
    console.log("[/api/v2/deep-insights] Request:", { 
      stage, 
      stretchLevels,
      actualStrong,
      actualWeak,
      categoryScores: categoryScores.map(c => `${c.name}: ${c.score}%`)
    });
    
    // 30% SKILL-BASED: Prioritize within stretch-level resources
    const priorityCategories = [...actualStrong, ...actualWeak];
    if (priorityCategories.length > 0) {
      const prioritized = candidates.filter(r => priorityCategories.includes(r.category));
      const remainder = candidates.filter(r => !priorityCategories.includes(r.category));
      // 30% from prioritized (skill-based), 70% from remainder (level-based)
      candidates = [
        ...prioritized,
        ...remainder
      ];
    }
    
    candidates = candidates.slice(0, 25);
    console.log("[/api/v2/deep-insights] Candidates:", candidates.map(c => c.id));

    let deepInsights: any[] = [];

    if (isOpenAIConfigured()) {
      const stageCompetencies = await fetchStageCompetencies(stage);
      // Use score-based categories for RAG context (30% skill-based personalization)
      const skillRelationships = await fetchSkillRelationships(actualWeak, actualStrong);
      // Normalize stage name for backward compatibility
      const normalizedStage = stage === "Emerging Senior" ? "Emerging Lead" 
        : stage === "Strategic Lead" ? "Strategic Lead - Executive"
        : stage;
      const stageDescription = STAGE_DESCRIPTIONS[normalizedStage] || STAGE_DESCRIPTIONS[stage] || `Career stage: ${stage}`;
      
      // Prompt emphasizes 70% level, 30% skill scores
      const systemPrompt = `You are a UX career strategist. Select 6 ADVANCED resources that:

SELECTION CRITERIA (weighted):
- 70% PRIMARY: Resources MUST be from stretch levels (${stretchLevels.join(", ")}) appropriate for "${normalizedStage}" level role
- 30% SECONDARY: Prioritize based on their actual skill scores:
  * High scores (80%+): Recommend advanced content to deepen expertise
  * Low scores (<60%): Recommend bridging content that connects weak to strong areas

CRITICAL: The user is at "${normalizedStage}" level. ${stageDescription}

Role-Specific Content Requirements:
${normalizedStage === "Strategic Lead - C-Suite" ? "- Focus on C-suite level content: organizational transformation, board-level strategy, design vision, design-driven business transformation, executive leadership\n- Resources should address challenges like design ROI at scale, design maturity models, design as competitive advantage\n- Content should be strategic and business-focused, not tactical execution" : ""}
${normalizedStage === "Strategic Lead - Executive" ? "- Focus on VP-level content: organizational design strategy, cross-functional executive influence, building design culture at scale\n- Resources should address challenges like design team growth, VP-level partnerships, design metrics at organizational scale\n- Content should emphasize organizational impact and executive leadership" : ""}
${normalizedStage === "Strategic Lead - Senior" ? "- Focus on Director/AVP level content: design direction, team leadership, design excellence, design systems\n- Resources should address challenges like leading design teams, establishing processes, design quality standards\n- Content should emphasize team leadership and design direction" : ""}
${normalizedStage === "Emerging Lead" ? "- Focus on leadership transition content: strategic thinking, mentoring, influencing product decisions\n- Resources should address challenges like transitioning from IC to leadership, building influence\n- Content should bridge individual contributor and leadership skills" : ""}
${normalizedStage === "Practitioner" ? "- Focus on mid-level content: deepening expertise, taking ownership, improving craft\n- Resources should address mid-level challenges and skill development" : ""}
${normalizedStage === "Explorer" ? "- Focus on foundational content: building core skills, understanding basics\n- Resources should address beginner-level learning and fundamentals" : ""}

Explain WHY each resource is strategically valuable for someone at "${normalizedStage}" level, considering their skill scores.
Return JSON: { insights: [{ id, whyThisForYou }] }`;
      
      const userPrompt = `
Stage: ${normalizedStage} (Stretch Levels: ${stretchLevels.join(", ")})
Stage Description: ${stageDescription}

Category Scores (use for 30% prioritization within ${stretchLevels.join(", ")} level):
${categoryScores.map(c => `- ${c.name}: ${c.score}% (${c.band})`).join("\n")}

Strong Categories (by score >= 80%): ${actualStrong.join(", ")}
Weak Categories (by score < 60%): ${actualWeak.join(", ")}

Candidates (all from ${stretchLevels.join(", ")} levels): ${JSON.stringify(candidates.map(r => ({ id: r.id, title: r.title, category: r.category, level: r.level, summary: r.summary })))}
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

    // Fallback: use candidates directly (already level-filtered, skill-prioritized)
    if (deepInsights.length === 0) {
      console.log("[/api/v2/deep-insights] Using fallback - selecting from candidates");
      
      // 30% skill-based: Prioritize strong categories first, then others (70% level-based)
      const strongOnly = candidates.filter(r => actualStrong.includes(r.category));
      const otherCandidates = candidates.filter(r => !actualStrong.includes(r.category));
      
      // Select ~2 from strong (30%), ~4 from others (70%)
      const selection = [
        ...strongOnly.slice(0, 2),
        ...otherCandidates.slice(0, 4)
      ].slice(0, 6);

      deepInsights = selection.map(r => ({
        ...r,
        whyThisForYou: `Selected to help you advance your expertise in ${r.category} at ${stage} level.`
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
    const { stage, strongCategories, weakCategories, categories: categoryScores } = req.body ?? {};
    
    // Check if user has weak skills (needs building) or strong skills (ready for leadership)
    const hasWeakSkills = Array.isArray(categoryScores) && categoryScores.some((c: any) => 
      (c.score || 0) < 75 || c.band === "Needs Work" || c.band === "Learn the Basics"
    );
    
    const skillGapGuidance = hasWeakSkills 
      ? `CRITICAL: User has weak skills (scores below 75%). Focus Week 1 on BUILDING SKILLS, not leadership. Only introduce leadership/mentorship in Week 3 after skills are strengthened.`
      : `User has strong skills (scores 75%+). They're ready for leadership transition content.`;
    
    if (isOpenAIConfigured()) {
      // Construct categories for RAG context
      const categories = Array.isArray(categoryScores) && categoryScores.length > 0
        ? categoryScores.map((c: any) => ({ 
            name: c.name, 
            score: c.score || c.finalScore || 0, 
            maxScore: c.maxScore || 100 
          }))
        : [
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

      // Normalize stage name for backward compatibility
      const normalizedStage = stage === "Emerging Senior" ? "Emerging Lead" 
        : stage === "Strategic Lead" ? "Strategic Lead - Executive"
        : stage;
      const stageDescription = STAGE_DESCRIPTIONS[normalizedStage] || STAGE_DESCRIPTIONS[stage] || `Career stage: ${stage}`;
      
      const systemPrompt = `You are a UX career coach. Create a 3-week improvement plan tailored to the specific role level.

      CRITICAL: The user is at "${normalizedStage}" level. ${stageDescription}
      
      ${skillGapGuidance}
      
      Role-Specific Expectations:
      ${normalizedStage === "Strategic Lead - C-Suite" ? "- Focus on organizational transformation, board-level strategy, and design vision\n- Tasks should involve executive leadership, company-wide initiatives, and strategic business impact\n- Deep work should address C-suite level challenges like design ROI, organizational design maturity, and design-driven business transformation" : ""}
      ${normalizedStage === "Strategic Lead - Executive" ? "- Focus on VP-level leadership, cross-functional influence, and building design culture\n- Tasks should involve executive collaboration, organizational strategy, and scaling design impact\n- Deep work should address VP-level challenges like design team growth, cross-functional partnerships, and design metrics at scale" : ""}
      ${normalizedStage === "Strategic Lead - Senior" ? "- Focus on design direction, team leadership, and driving design excellence\n- Tasks should involve leading design teams, establishing processes, and mentoring designers\n- Deep work should address director-level challenges like design systems, team development, and design quality standards" : ""}
      ${normalizedStage === "Emerging Lead" ? "- Focus on transitioning from IC to leadership, strategic thinking, and mentoring\n- Tasks should involve taking on leadership responsibilities and influencing product decisions\n- Deep work should address leadership transition challenges" : ""}
      ${normalizedStage === "Practitioner" ? "- Focus on deepening expertise and taking ownership of end-to-end work\n- Tasks should involve improving craft, research skills, and project ownership\n- Deep work should address mid-level challenges" : ""}
      ${normalizedStage === "Explorer" ? "- Focus on building fundamentals and getting hands-on experience\n- Tasks should be foundational and practical\n- Deep work should address beginner-level learning" : ""}
      
      Structure:
      - Week 1: ${hasWeakSkills ? "Skill Foundation Building" : "Leadership Transition Foundation"} appropriate for ${normalizedStage} level
        ${hasWeakSkills ? "Focus on hands-on practice, structured learning, and measurable skill improvement" : "Focus on transitioning from IC to leadership"}
      - Week 2: Deepening skills relevant to ${normalizedStage} role
      - Week 3: Strategic application aligned with ${normalizedStage} responsibilities
      
      For each week provide:
      - Theme (should reflect ${normalizedStage} level expectations)
      - Focus areas (from their weak categories)
      - 3 Daily tasks (short, < 1hr, appropriate for ${normalizedStage} level)
      - 2 Deep work sessions (long, > 1.5hr, relevant to ${normalizedStage} role)
      - Expected outcome (should reflect ${normalizedStage} level impact)
      
      ${contextString ? "IMPORTANT: Explicitly recommend reading/watching the provided Knowledge Base Resources in the daily tasks." : ""}
      
      Return strictly valid JSON.`;
      
      const userPrompt = `
      Stage: ${stage}
      Stage Description: ${stageDescription}
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
    const weeks = generateImprovementPlan(stage, strongCategories, weakCategories, categoryScores);
    return res.json({ weeks });
  } catch (error) {
    console.error("Error generating improvement plan:", error);
    const { stage, strongCategories, weakCategories, categories: categoryScores } = req.body ?? {};
    const weeks = generateImprovementPlan(stage, strongCategories, weakCategories, categoryScores);
    return res.json({ weeks });
  }
});

/**
 * POST /api/v2/social-media
 * Fetch social media content (YouTube videos, podcasts, tweets) from vector store
 */
app.post("/api/v2/social-media", async (req, res) => {
  try {
    const { stage, categories } = req.body ?? {};
    
    if (!stage) {
      return res.status(400).json({ error: "Stage is required" });
    }

    // Normalize categories format
    const normalizedCategories = Array.isArray(categories) 
      ? categories 
      : [];

    // Fetch social media resources from vector store
    const socialResources = await fetchSocialMediaResources(stage, normalizedCategories);
    
    // Transform to frontend format
    const formattedResources = socialResources.map((resource: any) => {
      const metadata = resource.metadata || {};
      return {
        id: metadata.resource_id || `social-${Date.now()}-${Math.random()}`,
        title: metadata.title || resource.title || "Untitled",
        url: metadata.url || resource.url || "#",
        type: metadata.resource_type || (metadata.source === "Twitter" ? "tweet" : metadata.resource_type) || "video",
        source: metadata.source || "Unknown",
        summary: resource.content?.substring(0, 200) || metadata.summary || "",
        author: metadata.author || metadata.source || "",
        engagementScore: metadata.engagement_score || 0,
        viewCount: metadata.view_count || 0,
        publishedAt: metadata.published_at || metadata.date || "",
        thumbnail: metadata.thumbnail || ""
      };
    });

    // Get unique sources
    const sources = [...new Set(formattedResources.map(r => r.source))].filter(Boolean);

    return res.json({
      resources: formattedResources,
      sources: sources.length > 0 ? sources : ["YouTube", "Twitter", "Podcasts"]
    });
  } catch (error) {
    console.error("[/api/v2/social-media] Error:", error);
    return res.status(500).json({ error: "Failed to fetch social media content" });
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
