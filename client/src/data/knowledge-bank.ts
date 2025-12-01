/**
 * Knowledge Bank - Curated UX Learning Resources
 * 
 * ============================================================================
 * IMPORTANT: This is the SINGLE SOURCE OF TRUTH for all learning resources.
 * ============================================================================
 * 
 * All resources displayed in:
 * - Curated Resources section
 * - Deep Insights section
 * - Improvement Plan resource links
 * 
 * MUST come from this file. Do NOT create placeholder generators elsewhere.
 * 
 * Each resource must have:
 * - Unique ID (e.g., "explorer-001")
 * - Real, working URL to actual content
 * - Accurate title, summary, and metadata
 * 
 * Organization:
 * - Category: UX Fundamentals, UI Craft & Visual Design, User Research & Validation,
 *             Product Thinking & Strategy, Collaboration & Communication
 * - Level: explorer, practitioner, emerging-senior, strategic-lead
 * - Type: article, video, podcast
 * 
 * To add new resources: Add entries to the knowledgeBank array below.
 * To remove resources: Delete entries from the array.
 * 
 * DO NOT create fake/placeholder data in server/routes.ts or anywhere else.
 * ============================================================================
 */

export type ResourceType = "article" | "video" | "podcast";

export type ResourceLevel =
  | "explorer"
  | "practitioner"
  | "emerging-senior"
  | "strategic-lead";

export type Category =
  | "UX Fundamentals"
  | "UI Craft & Visual Design"
  | "User Research & Validation"
  | "Product Thinking & Strategy"
  | "Collaboration & Communication";

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: ResourceType;
  category: Category;
  level: ResourceLevel;
  duration?: string; // "5 min read", "12 min video", "45 min podcast"
  summary: string; // 2-3 sentences
  tags: string[];
  author?: string;
  source?: string; // "NN/g", "Smashing Magazine", etc.
}

export const knowledgeBank: Resource[] = [
  // ========================================
  // EXPLORER (0-40) — Foundations & Mindset
  // ========================================
  {
    id: "explorer-001",
    title: "Definition of User Experience (NN/g)",
    url: "https://www.nngroup.com/articles/definition-user-experience/",
    type: "article",
    category: "UX Fundamentals",
    level: "explorer",
    duration: "5 min read",
    summary: "Nielsen Norman Group's definitive explanation of what user experience means, covering users, system, and context.",
    tags: ["definition", "basics", "nng", "ux"],
    source: "NN/g"
  },
  {
    id: "explorer-002",
    title: "What is UX Design? (IxDF 2025)",
    url: "https://www.interaction-design.org/literature/topics/ux-design",
    type: "article",
    category: "UX Fundamentals",
    level: "explorer",
    duration: "10 min read",
    summary: "Interaction Design Foundation's evergreen primer that explains UX roles, history, and why customer-centricity matters.",
    tags: ["introduction", "ixdf", "career", "basics"],
    source: "Interaction Design Foundation"
  },
  {
    id: "explorer-003",
    title: "What Is UX? User Experience Basics (Baymard)",
    url: "https://baymard.com/learn/what-is-ux",
    type: "article",
    category: "UX Fundamentals",
    level: "explorer",
    duration: "7 min read",
    summary: "Baymard Institute breaks down UX terminology, the relationship to CRO, and how usability testing fits in.",
    tags: ["baymard", "basics", "usability"],
    source: "Baymard"
  },
  {
    id: "explorer-004",
    title: "UX vs UI – What's the Difference?",
    url: "https://www.interaction-design.org/literature/article/ux-vs-ui-what-s-the-difference",
    type: "article",
    category: "UX Fundamentals",
    level: "explorer",
    duration: "8 min read",
    summary: "Clarifies the responsibilities of UX versus UI design so beginners understand how the roles overlap and diverge.",
    tags: ["ux", "ui", "roles", "beginners"],
    source: "Interaction Design Foundation"
  },
  {
    id: "explorer-005",
    title: "A Comprehensive Guide to UX Design (Smashing)",
    url: "https://www.smashingmagazine.com/2018/02/comprehensive-guide-user-experience-design/",
    type: "article",
    category: "UX Fundamentals",
    level: "explorer",
    duration: "15 min read",
    summary: "Smashing Magazine's handbook that walks through research, flows, IA, and testing for first-time UX designers.",
    tags: ["ux", "guide", "smashing"],
    source: "Smashing Magazine"
  },
  {
    id: "explorer-006",
    title: "Usability 101: Introduction to Usability",
    url: "https://www.nngroup.com/articles/usability-101-introduction-to-usability/",
    type: "article",
    category: "UX Fundamentals",
    level: "explorer",
    duration: "6 min read",
    summary: "Explains why usability matters, how to measure it, and the core components of user-centered design.",
    tags: ["usability", "beginners", "nng"],
    source: "NN/g"
  },
  {
    id: "explorer-007",
    title: "10 Usability Heuristics Every Designer Should Know",
    url: "https://uxdesign.cc/10-usability-heuristics-every-designer-should-know",
    type: "article",
    category: "UX Fundamentals",
    level: "explorer",
    duration: "9 min read",
    summary: "UX Collective's approachable breakdown of Nielsen's heuristics with modern interface examples.",
    tags: ["heuristics", "principles", "uxcollective"],
    source: "UX Collective"
  },
  {
    id: "explorer-008",
    title: "UX Design: How to Get Started (Workshopper)",
    url: "https://www.workshopper.com/post/ux-design-how-to-get-started-a-full-guide",
    type: "article",
    category: "UX Fundamentals",
    level: "explorer",
    duration: "12 min read",
    summary: "Step-by-step plan covering mindset shifts, study habits, and portfolio tips for brand-new designers.",
    tags: ["career", "beginners", "workflow"],
    source: "Workshopper"
  },
  {
    id: "explorer-009",
    title: "You Are Ready to Become a UX Designer",
    url: "https://blog.prototypr.io/you-are-ready-to-become-a-ux-designer-but-dont-know-where-to-start",
    type: "article",
    category: "Collaboration & Communication",
    level: "explorer",
    duration: "7 min read",
    summary: "Motivational essay that demystifies impostor syndrome and outlines practical first steps into UX.",
    tags: ["career", "mindset", "prototypr"],
    source: "Prototypr"
  },
  {
    id: "explorer-010",
    title: "Ten Tips for Aspiring Designers (Part 1)",
    url: "https://www.smashingmagazine.com/2022/01/ten-tips-aspiring-designer-beginners-part1/",
    type: "article",
    category: "Collaboration & Communication",
    level: "explorer",
    duration: "10 min read",
    summary: "Smashing Magazine shares actionable advice on feedback, mentorship, and practicing core craft early.",
    tags: ["career", "tips", "smashing"],
    source: "Smashing Magazine"
  },
  {
    id: "explorer-011",
    title: "Free UX Design Course",
    url: "https://www.uxdesigninstitute.com/courses/free-ux-design-course",
    type: "article",
    category: "UX Fundamentals",
    level: "explorer",
    duration: "Self-paced",
    summary: "UX Design Institute's free video course that covers research, wireframes, and testing with downloadable exercises.",
    tags: ["course", "video", "uxdesigninstitute"],
    source: "UX Design Institute"
  },
  {
    id: "explorer-012",
    title: "3 Underrated Fundamentals of UX",
    url: "https://www.appcues.com/blog/ux-fundamentals",
    type: "article",
    category: "UX Fundamentals",
    level: "explorer",
    duration: "6 min read",
    summary: "Appcues highlights journey mapping, expectation setting, and friction reduction as often-missed basics.",
    tags: ["fundamentals", "appcues", "basics"],
    source: "Appcues"
  },
  {
    id: "explorer-013",
    title: "What Is UX Design & Why It's Important",
    url: "https://www.youtube.com/watch?v=nWtLbeq0M-o",
    type: "video",
    category: "UX Fundamentals",
    level: "explorer",
    duration: "9 min video",
    summary: "YouTube explainer that frames UX value for stakeholders and shows real-world examples of good and bad flows.",
    tags: ["video", "ux", "basics"],
    source: "YouTube"
  },

  // ========================================
  // PRACTITIONER (41-65) — UI Craft & Systems
  // ========================================
  {
    id: "practitioner-001",
    title: "A Comprehensive Guide to UI Design",
    url: "https://www.smashingmagazine.com/2018/02/comprehensive-guide-ui-design/",
    type: "article",
    category: "UI Craft & Visual Design",
    level: "practitioner",
    duration: "18 min read",
    summary: "Smashing Magazine dives into layout, color, and prototyping techniques for designers shipping production work.",
    tags: ["ui", "smashing", "patterns"],
    source: "Smashing Magazine"
  },
  {
    id: "practitioner-002",
    title: "5 Principles of Visual Design in UX",
    url: "https://www.nngroup.com/articles/principles-visual-design/",
    type: "article",
    category: "UI Craft & Visual Design",
    level: "practitioner",
    duration: "7 min read",
    summary: "NN/g outlines hierarchy, balance, contrast, gestalt, and consistency with examples from modern products.",
    tags: ["visual-design", "principles", "nng"],
    source: "NN/g"
  },
  {
    id: "practitioner-003",
    title: "Using Color to Enhance Your Design",
    url: "https://www.nngroup.com/articles/color-enhance-design/",
    type: "article",
    category: "UI Craft & Visual Design",
    level: "practitioner",
    duration: "8 min read",
    summary: "Explains how to apply color intentionally for call-to-action clarity, state changes, and accessibility.",
    tags: ["color", "visual", "nng"],
    source: "NN/g"
  },
  {
    id: "practitioner-004",
    title: "The UX Designer's Guide to Typography",
    url: "https://medium.com/the-interaction-design-foundation/the-ux-designers-guide-to-typography",
    type: "article",
    category: "UI Craft & Visual Design",
    level: "practitioner",
    duration: "9 min read",
    summary: "IxDF covers font pairing, readability, and responsive type scales for product teams.",
    tags: ["typography", "ixdf", "ui"],
    source: "Interaction Design Foundation"
  },
  {
    id: "practitioner-005",
    title: "5 Visual Treatments that Improve Accessibility",
    url: "https://www.nngroup.com/articles/visual-treatments-accessibility/",
    type: "article",
    category: "UI Craft & Visual Design",
    level: "practitioner",
    duration: "6 min read",
    summary: "Shows how contrast, outlines, focus states, and motion cues can remove visual barriers for users.",
    tags: ["accessibility", "ui", "nng"],
    source: "NN/g"
  },
  {
    id: "practitioner-006",
    title: "Design Systems: An Overview",
    url: "https://uxplanet.org/design-systems-an-overview-243b07534b64",
    type: "article",
    category: "Product Thinking & Strategy",
    level: "practitioner",
    duration: "10 min read",
    summary: "UX Planet explains tokens, governance, and component libraries so designers can partner with engineering.",
    tags: ["design-systems", "tokens", "uxplanet"],
    source: "UX Planet"
  },
  {
    id: "practitioner-007",
    title: "Testing Visual Design",
    url: "https://www.nngroup.com/articles/testing-visual-design/",
    type: "article",
    category: "UI Craft & Visual Design",
    level: "practitioner",
    duration: "7 min read",
    summary: "Guidance on preference tests, desirability studies, and which metrics reveal visual quality.",
    tags: ["testing", "visual", "nng"],
    source: "NN/g"
  },
  {
    id: "practitioner-008",
    title: "Flat Design: Problems & Flat 2.0",
    url: "https://www.nngroup.com/articles/flat-design/",
    type: "article",
    category: "UI Craft & Visual Design",
    level: "practitioner",
    duration: "9 min read",
    summary: "NN/g dissects why overly minimal interfaces hurt usability and how Flat 2.0 reintroduces helpful cues.",
    tags: ["flat-design", "visual", "nng"],
    source: "NN/g"
  },
  {
    id: "practitioner-009",
    title: "Material 3 Expressive: Building on the Failures of Flat Design",
    url: "https://uxdesign.cc/material-3-expressive-building-on-the-failures-of-flat-design-d7a9bb627298",
    type: "article",
    category: "UI Craft & Visual Design",
    level: "practitioner",
    duration: "8 min read",
    summary: "UX Collective analyzes Google's Material 3 evolution and how expressive systems help complex products.",
    tags: ["material", "design-language", "uxcollective"],
    source: "UX Collective"
  },

  // ========================================
  // EMERGING SENIOR (66-85) — Research & Product Strategy
  // ========================================
  {
    id: "emerging-001",
    title: "When to Use Which UX Research Methods",
    url: "https://www.nngroup.com/articles/which-ux-research-methods/",
    type: "article",
    category: "User Research & Validation",
    level: "emerging-senior",
    duration: "12 min read",
    summary: "Matrix from NN/g that maps generative vs evaluative methods to project constraints.",
    tags: ["research", "methods", "nng"],
    source: "NN/g"
  },
  {
    id: "emerging-002",
    title: "User Interviews 101",
    url: "https://www.nngroup.com/articles/user-interviews/",
    type: "article",
    category: "User Research & Validation",
    level: "emerging-senior",
    duration: "10 min read",
    summary: "How to plan, recruit, script, and synthesize user interviews with fewer biases.",
    tags: ["interviews", "qualitative", "nng"],
    source: "NN/g"
  },
  {
    id: "emerging-003",
    title: "How Many Users Should You Interview?",
    url: "https://blog.ferpection.com/en/how-many-users-should-we-interview",
    type: "article",
    category: "User Research & Validation",
    level: "emerging-senior",
    duration: "6 min read",
    summary: "Ferpection shares sample-size guidance and how to iterate research rounds efficiently.",
    tags: ["sample-size", "research", "qual"],
    source: "Ferpection"
  },
  {
    id: "emerging-004",
    title: "Usability Testing 101",
    url: "https://www.nngroup.com/articles/usability-testing-101/",
    type: "article",
    category: "User Research & Validation",
    level: "emerging-senior",
    duration: "8 min read",
    summary: "Explains planning, facilitation, note-taking, and reporting steps for lab or remote usability tests.",
    tags: ["usability", "testing", "nng"],
    source: "NN/g"
  },
  {
    id: "emerging-005",
    title: "What is A/B Testing?",
    url: "https://www.interaction-design.org/literature/topics/a-b-testing",
    type: "article",
    category: "User Research & Validation",
    level: "emerging-senior",
    duration: "8 min read",
    summary: "IxDF overview of experimentation workflows, metrics, and when to use multivariate tests.",
    tags: ["experimentation", "ab-testing", "ixdf"],
    source: "Interaction Design Foundation"
  },
  {
    id: "emerging-006",
    title: "Writing Good Survey Questions",
    url: "https://www.nngroup.com/articles/survey-best-practices/",
    type: "article",
    category: "User Research & Validation",
    level: "emerging-senior",
    duration: "7 min read",
    summary: "Best practices on bias-free wording, Likert design, and screening logic for UX surveys.",
    tags: ["surveys", "quant", "nng"],
    source: "NN/g"
  },
  {
    id: "emerging-007",
    title: "Running Surveys in the Design Cycle",
    url: "https://www.nngroup.com/articles/surveys-design-cycle/",
    type: "article",
    category: "User Research & Validation",
    level: "emerging-senior",
    duration: "6 min read",
    summary: "How to place surveys at discovery, validation, or post-launch phases for stronger evidence.",
    tags: ["surveys", "process", "nng"],
    source: "NN/g"
  },
  {
    id: "emerging-008",
    title: "Tips on Conducting Guerrilla Usability Testing",
    url: "https://uxplanet.org/tips-on-conducting-guerrilla-usability-testing-941b46d2fce6",
    type: "article",
    category: "User Research & Validation",
    level: "emerging-senior",
    duration: "7 min read",
    summary: "UX Planet walkthrough on recruiting fast, scripting short tasks, and using findings responsibly.",
    tags: ["guerrilla", "testing", "uxplanet"],
    source: "UX Planet"
  },
  {
    id: "emerging-009",
    title: "Personas Make Users Memorable",
    url: "https://www.nngroup.com/articles/persona/",
    type: "article",
    category: "User Research & Validation",
    level: "emerging-senior",
    duration: "10 min read",
    summary: "Explains persona attributes, storytelling, and pitfalls so teams keep user mental models aligned.",
    tags: ["personas", "story", "nng"],
    source: "NN/g"
  },
  {
    id: "emerging-010",
    title: "Card Sorting: How to Organize Information",
    url: "https://www.interaction-design.org/literature/topics/card-sorting",
    type: "article",
    category: "User Research & Validation",
    level: "emerging-senior",
    duration: "9 min read",
    summary: "Covers open vs closed sorts, recruiting, and when to pair with tree testing.",
    tags: ["ia", "cardsorting", "ixdf"],
    source: "Interaction Design Foundation"
  },
  {
    id: "emerging-011",
    title: "First Click Testing",
    url: "https://blog.uxtweak.com/first-click-testing/",
    type: "article",
    category: "User Research & Validation",
    level: "emerging-senior",
    duration: "6 min read",
    summary: "UXtweak explains setup, metrics, and how to interpret first-click success.",
    tags: ["testing", "navigation", "uxtweak"],
    source: "UXtweak"
  },
  {
    id: "emerging-012",
    title: "Why Product Thinking Is the Next Big Thing in UX",
    url: "https://medium.com/@jaf_designer/why-product-thinking-is-the-next-big-thing-in-ux-design-ee7de959f3fe",
    type: "article",
    category: "Product Thinking & Strategy",
    level: "emerging-senior",
    duration: "8 min read",
    summary: "Shows how UX designers can align problem framing and outcomes with product strategy.",
    tags: ["product-thinking", "strategy", "medium"],
    source: "Medium"
  },
  {
    id: "emerging-013",
    title: "UX Strategy: Definition & Components",
    url: "https://www.nngroup.com/articles/ux-strategy/",
    type: "article",
    category: "Product Thinking & Strategy",
    level: "emerging-senior",
    duration: "10 min read",
    summary: "Breaks down vision, KPIs, prioritization, and sequencing for UX leaders.",
    tags: ["ux-strategy", "roadmap", "nng"],
    source: "NN/g"
  },
  {
    id: "emerging-014",
    title: "Product & UX Study Guide",
    url: "https://www.nngroup.com/articles/product-and-ux-study-guide/",
    type: "article",
    category: "Product Thinking & Strategy",
    level: "emerging-senior",
    duration: "12 min read",
    summary: "Reading roadmap from NN/g that links business, analytics, and UX craft topics.",
    tags: ["study-guide", "product", "nng"],
    source: "NN/g"
  },
  {
    id: "emerging-015",
    title: "The Fusion Phenomenon: Product Strategy vs UX Strategy",
    url: "https://www.mindtheproduct.com/the-fusion-phenomenon-product-strategy-vs-ux-strategy/",
    type: "article",
    category: "Product Thinking & Strategy",
    level: "emerging-senior",
    duration: "10 min read",
    summary: "Mind the Product clarifies responsibilities between product managers and UX strategists.",
    tags: ["strategy", "mindtheproduct", "collaboration"],
    source: "Mind the Product"
  },
  {
    id: "emerging-016",
    title: "Building a Practical UX Strategy Framework",
    url: "https://www.smashingmagazine.com/2025/05/building-practical-ux-strategy-framework/",
    type: "article",
    category: "Product Thinking & Strategy",
    level: "emerging-senior",
    duration: "14 min read",
    summary: "2025 Smashing Magazine piece detailing templates for mission, KPIs, and governance.",
    tags: ["ux-strategy", "framework", "smashing"],
    source: "Smashing Magazine"
  },
  {
    id: "emerging-017",
    title: "UX KPIs",
    url: "https://www.interaction-design.org/literature/topics/kpi",
    type: "article",
    category: "Product Thinking & Strategy",
    level: "emerging-senior",
    duration: "7 min read",
    summary: "Defines leading and lagging indicators designers can attach to product objectives.",
    tags: ["kpi", "metrics", "ixdf"],
    source: "Interaction Design Foundation"
  },
  {
    id: "emerging-018",
    title: "Best UX Metrics & KPIs (2025)",
    url: "https://qualaroo.com/blog/measure-user-experience/",
    type: "article",
    category: "Product Thinking & Strategy",
    level: "emerging-senior",
    duration: "9 min read",
    summary: "Qualaroo compiles CSAT, SUS, CES, and behavioral metrics with sample dashboards.",
    tags: ["metrics", "qualaroo", "measurement"],
    source: "Qualaroo"
  },
  {
    id: "emerging-019",
    title: "Measuring UX and ROI",
    url: "https://rgp.com/2024/06/06/measuring-ux-and-roi/",
    type: "article",
    category: "Product Thinking & Strategy",
    level: "emerging-senior",
    duration: "8 min read",
    summary: "RGP explains how to link UX initiatives to revenue, retention, and efficiency gains.",
    tags: ["roi", "business", "rgp"],
    source: "RGP"
  },

  // ========================================
  // STRATEGIC LEAD (86-100) — Leadership & Org Influence
  // ========================================
  {
    id: "strategic-001",
    title: "Developer–Designer Relationship",
    url: "https://www.nngroup.com/articles/developer-designer-relationship/",
    type: "article",
    category: "Collaboration & Communication",
    level: "strategic-lead",
    duration: "8 min read",
    summary: "NN/g guidance on building trust, shared vocabulary, and smoother handoffs with engineering.",
    tags: ["collaboration", "engineering", "nng"],
    source: "NN/g"
  },
  {
    id: "strategic-002",
    title: "Why Product Managers Need to Know UX",
    url: "https://www.uxdesigninstitute.com/blog/product-manager-ux/",
    type: "article",
    category: "Product Thinking & Strategy",
    level: "strategic-lead",
    duration: "7 min read",
    summary: "Outlines how PMs and UX leaders share outcomes, experimentation, and empathy work.",
    tags: ["product", "pm", "collaboration"],
    source: "UX Design Institute"
  },
  {
    id: "strategic-003",
    title: "Communication Practices for Increasing UX Maturity",
    url: "https://www.nngroup.com/articles/communication-practices/",
    type: "article",
    category: "Collaboration & Communication",
    level: "strategic-lead",
    duration: "10 min read",
    summary: "Shows how storytelling, demos, and office hours accelerate UX maturity inside enterprises.",
    tags: ["ux-maturity", "communication", "nng"],
    source: "NN/g"
  },
  {
    id: "strategic-004",
    title: "Evangelizing UX Across an Entire Organization",
    url: "https://www.uxmatters.com/mt/archives/2009/03/evangelizing-ux-across-an-entire-organization.php",
    type: "article",
    category: "Collaboration & Communication",
    level: "strategic-lead",
    duration: "9 min read",
    summary: "UX Matters article on stakeholder roadshows, toolkits, and governance committees.",
    tags: ["evangelism", "stakeholders", "uxmatters"],
    source: "UX Matters"
  },
  {
    id: "strategic-005",
    title: "Design Critiques: Building a Positive Culture",
    url: "https://www.nngroup.com/articles/design-critiques/",
    type: "article",
    category: "Collaboration & Communication",
    level: "strategic-lead",
    duration: "8 min read",
    summary: "Framework for facilitating critiques so teams share intent, context, and actionable feedback.",
    tags: ["critiques", "culture", "nng"],
    source: "NN/g"
  },
  {
    id: "strategic-006",
    title: "Using Video Evidence for Stakeholders",
    url: "https://www.nngroup.com/videos/video-evidence/",
    type: "video",
    category: "Collaboration & Communication",
    level: "strategic-lead",
    duration: "5 min video",
    summary: "NN/g video on how short highlight reels change executive perceptions faster than slide decks.",
    tags: ["video", "stakeholders", "evidence"],
    source: "NN/g"
  },
  {
    id: "strategic-007",
    title: "Facilitating UX Workshops with Stakeholders",
    url: "https://www.nngroup.com/videos/ux-workshops-stakeholders/",
    type: "video",
    category: "Collaboration & Communication",
    level: "strategic-lead",
    duration: "6 min video",
    summary: "Tips for planning agendas, activities, and follow-ups that keep workshops outcomes-focused.",
    tags: ["workshops", "facilitation", "nng"],
    source: "NN/g"
  },
  {
    id: "strategic-008",
    title: "UX Stakeholder Engagement 101",
    url: "https://www.nngroup.com/videos/ux-stakeholder-engagement-101/",
    type: "video",
    category: "Collaboration & Communication",
    level: "strategic-lead",
    duration: "4 min video",
    summary: "Explains how to map influence, run previews, and use storytelling to keep leaders aligned.",
    tags: ["stakeholders", "leadership", "video"],
    source: "NN/g"
  }
];

export function getCategories(): Category[] {
  return [
    "UX Fundamentals",
    "UI Craft & Visual Design",
    "User Research & Validation",
    "Product Thinking & Strategy",
    "Collaboration & Communication"
  ];
}

export function getResourceTypes(): ResourceType[] {
  return ["article", "video", "podcast"];
}

export function getLevels(): ResourceLevel[] {
  return ["explorer", "practitioner", "emerging-senior", "strategic-lead"];
}
