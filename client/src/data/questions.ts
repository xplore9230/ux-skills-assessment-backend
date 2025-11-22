import type { Question } from "@/types";

export const allQuestions: Question[] = [
  // UX Fundamentals (12 questions)
  {
    id: "Q1",
    text: "When you start a new project, how often do you explicitly define the problem statement and success metrics?",
    category: "UX Fundamentals",
    options: [
      { value: 1, label: "Rarely, I mostly start directly with screens" },
      { value: 2, label: "Sometimes, but not always written down" },
      { value: 3, label: "Often, but metrics are vague" },
      { value: 4, label: "Usually, with clear problem + direction" },
      { value: 5, label: "Always, I write a clear problem, constraints, and success metrics" }
    ]
  },
  {
    id: "Q2",
    text: "How confident are you in breaking down a user journey into flows and edge cases?",
    category: "UX Fundamentals",
    options: [
      { value: 1, label: "I struggle with this" },
      { value: 2, label: "I can do simple flows" },
      { value: 3, label: "I can handle typical product flows" },
      { value: 4, label: "I cover most states and edge cases" },
      { value: 5, label: "I systematically cover all states, edge cases, and system rules" }
    ]
  },
  {
    id: "Q3",
    text: "When designing, how often do you consciously apply usability principles (heuristics, Fitts' law, etc.)?",
    category: "UX Fundamentals",
    options: [
      { value: 1, label: "Almost never" },
      { value: 2, label: "Occasionally" },
      { value: 3, label: "Sometimes" },
      { value: 4, label: "Often" },
      { value: 5, label: "Very often and intentionally" }
    ]
  },
  {
    id: "Q4",
    text: "How comfortable are you creating wireframes that clearly communicate interaction patterns?",
    category: "UX Fundamentals",
    options: [
      { value: 1, label: "I avoid wireframing" },
      { value: 2, label: "Basic boxes and text" },
      { value: 3, label: "Functional wireframes" },
      { value: 4, label: "Clear wireframes with annotations" },
      { value: 5, label: "Detailed wireframes with all interactions documented" }
    ]
  },
  {
    id: "Q5",
    text: "How often do you test your designs for accessibility (WCAG compliance, etc.)?",
    category: "UX Fundamentals",
    options: [
      { value: 1, label: "Never" },
      { value: 2, label: "Rarely" },
      { value: 3, label: "Sometimes, but not systematically" },
      { value: 4, label: "Often, for critical features" },
      { value: 5, label: "Always, it's part of my process" }
    ]
  },
  {
    id: "Q6",
    text: "How well do you understand mental models and how users think about products?",
    category: "UX Fundamentals",
    options: [
      { value: 1, label: "Not much" },
      { value: 2, label: "Basic understanding" },
      { value: 3, label: "Decent understanding" },
      { value: 4, label: "Strong understanding" },
      { value: 5, label: "I actively research and apply mental models" }
    ]
  },
  {
    id: "Q7",
    text: "How experienced are you with different UX methodologies (Jobs to be Done, Design Thinking, etc.)?",
    category: "UX Fundamentals",
    options: [
      { value: 1, label: "Not familiar" },
      { value: 2, label: "Aware but rarely use them" },
      { value: 3, label: "Use one or two methods" },
      { value: 4, label: "Proficient with several methods" },
      { value: 5, label: "Expert, can choose the right method for each situation" }
    ]
  },
  {
    id: "Q8",
    text: "How do you handle conflicting user needs in your designs?",
    category: "UX Fundamentals",
    options: [
      { value: 1, label: "I pick one group and ignore the other" },
      { value: 2, label: "I try to compromise in the middle" },
      { value: 3, label: "I consider both but lack a systematic approach" },
      { value: 4, label: "I analyze trade-offs and document decisions" },
      { value: 5, label: "I systematically prioritize using research and data" }
    ]
  },
  {
    id: "Q9",
    text: "How well do you understand information architecture principles?",
    category: "UX Fundamentals",
    options: [
      { value: 1, label: "Barely" },
      { value: 2, label: "Basic understanding" },
      { value: 3, label: "Good understanding" },
      { value: 4, label: "Very good understanding" },
      { value: 5, label: "Expert, I could teach it" }
    ]
  },
  {
    id: "Q10",
    text: "How often do you create user personas or empathy maps?",
    category: "UX Fundamentals",
    options: [
      { value: 1, label: "Never" },
      { value: 2, label: "Rarely" },
      { value: 3, label: "Sometimes" },
      { value: 4, label: "Often" },
      { value: 5, label: "Always, and I update them regularly" }
    ]
  },
  {
    id: "Q11",
    text: "How comfortable are you explaining design decisions through UX principles?",
    category: "UX Fundamentals",
    options: [
      { value: 1, label: "I just say 'it looks good'" },
      { value: 2, label: "I can give basic reasons" },
      { value: 3, label: "I can reference principles" },
      { value: 4, label: "I can reference principles with examples" },
      { value: 5, label: "I fluently explain using psychology and usability science" }
    ]
  },
  {
    id: "Q12",
    text: "How do you approach error handling and edge case design?",
    category: "UX Fundamentals",
    options: [
      { value: 1, label: "I don't think about errors" },
      { value: 2, label: "Basic error messages" },
      { value: 3, label: "Thoughtful error prevention" },
      { value: 4, label: "Comprehensive error handling" },
      { value: 5, label: "Proactive error prevention + clear recovery paths" }
    ]
  },

  // UI Craft & Visual Design (12 questions)
  {
    id: "Q13",
    text: "How would you rate your skills in layout, spacing, and visual hierarchy?",
    category: "UI Craft & Visual Design",
    options: [
      { value: 1, label: "Weak, my designs often feel cluttered or misaligned" },
      { value: 2, label: "Basic, I can follow existing patterns" },
      { value: 3, label: "Decent, I can make things look 'good enough'" },
      { value: 4, label: "Strong, I can craft polished clean UIs" },
      { value: 5, label: "Very strong, I obsess over details, grids, and spacing" }
    ]
  },
  {
    id: "Q14",
    text: "How often do you use and contribute to a design system (tokens, components, patterns)?",
    category: "UI Craft & Visual Design",
    options: [
      { value: 1, label: "I don't really use design systems" },
      { value: 2, label: "I consume components but don't modify them" },
      { value: 3, label: "I sometimes suggest improvements" },
      { value: 4, label: "I actively extend and maintain components" },
      { value: 5, label: "I help define or govern the design system" }
    ]
  },
  {
    id: "Q15",
    text: "How comfortable are you with designing for different screen sizes and platforms (Android, iOS, Web)?",
    category: "UI Craft & Visual Design",
    options: [
      { value: 1, label: "Mostly design for one screen/platform" },
      { value: 2, label: "I try but struggle to adapt patterns" },
      { value: 3, label: "I can adapt for major platforms" },
      { value: 4, label: "Comfortable across multiple platforms" },
      { value: 5, label: "Very comfortable with platform guidelines and responsive behaviour" }
    ]
  },
  {
    id: "Q16",
    text: "How skilled are you with typography and its impact on readability?",
    category: "UI Craft & Visual Design",
    options: [
      { value: 1, label: "I pick fonts randomly" },
      { value: 2, label: "I use safe font combinations" },
      { value: 3, label: "I understand typography basics" },
      { value: 4, label: "I carefully choose typefaces and sizes" },
      { value: 5, label: "I master typography and can explain hierarchy, contrast, and rhythm" }
    ]
  },
  {
    id: "Q17",
    text: "How comfortable are you creating and applying color systems?",
    category: "UI Craft & Visual Design",
    options: [
      { value: 1, label: "I use random colors" },
      { value: 2, label: "I follow brand colors loosely" },
      { value: 3, label: "I use consistent color palettes" },
      { value: 4, label: "I create accessible color systems" },
      { value: 5, label: "I design sophisticated color systems with semantic meaning" }
    ]
  },
  {
    id: "Q18",
    text: "How experienced are you with creating iconography and illustrations?",
    category: "UI Craft & Visual Design",
    options: [
      { value: 1, label: "I don't create visuals" },
      { value: 2, label: "I use stock icons" },
      { value: 3, label: "I can modify and customize icons" },
      { value: 4, label: "I can create custom icons" },
      { value: 5, label: "I create comprehensive icon systems and illustrations" }
    ]
  },
  {
    id: "Q19",
    text: "How proficient are you with design tools (Figma, Adobe XD, etc.)?",
    category: "UI Craft & Visual Design",
    options: [
      { value: 1, label: "Struggling with basics" },
      { value: 2, label: "Basic proficiency" },
      { value: 3, label: "Competent with core features" },
      { value: 4, label: "Advanced user" },
      { value: 5, label: "Expert, I use advanced features and optimize workflows" }
    ]
  },
  {
    id: "Q20",
    text: "How comfortable are you with micro-interactions and animation?",
    category: "UI Craft & Visual Design",
    options: [
      { value: 1, label: "I don't think about animations" },
      { value: 2, label: "I use basic transitions" },
      { value: 3, label: "I understand animation purpose" },
      { value: 4, label: "I design purposeful micro-interactions" },
      { value: 5, label: "I master animation for delight and feedback" }
    ]
  },
  {
    id: "Q21",
    text: "How experienced are you with creating design specs and handoff documentation?",
    category: "UI Craft & Visual Design",
    options: [
      { value: 1, label: "I don't document" },
      { value: 2, label: "Basic documentation" },
      { value: 3, label: "Decent specs" },
      { value: 4, label: "Thorough design specs" },
      { value: 5, label: "Comprehensive developer-ready specs with all details" }
    ]
  },
  {
    id: "Q22",
    text: "How good are you at maintaining visual consistency across products?",
    category: "UI Craft & Visual Design",
    options: [
      { value: 1, label: "Each project looks different" },
      { value: 2, label: "I try to maintain consistency but it's loose" },
      { value: 3, label: "Reasonably consistent" },
      { value: 4, label: "Highly consistent" },
      { value: 5, label: "I enforce brand consistency across all touchpoints" }
    ]
  },
  {
    id: "Q23",
    text: "How comfortable are you with dark mode and theme systems?",
    category: "UI Craft & Visual Design",
    options: [
      { value: 1, label: "Not experienced" },
      { value: 2, label: "I've tried it" },
      { value: 3, label: "I can design for light and dark modes" },
      { value: 4, label: "I can design comprehensive theme systems" },
      { value: 5, label: "Expert in dynamic theming systems" }
    ]
  },
  {
    id: "Q24",
    text: "How do you approach visual design for empty states and loading states?",
    category: "UI Craft & Visual Design",
    options: [
      { value: 1, label: "I don't think about these states" },
      { value: 2, label: "Basic placeholder design" },
      { value: 3, label: "Thoughtful but inconsistent" },
      { value: 4, label: "Well-designed across states" },
      { value: 5, label: "Comprehensive state design with delight and feedback" }
    ]
  },

  // User Research & Validation (12 questions)
  {
    id: "Q25",
    text: "How often do you talk to users or observe them using your product?",
    category: "User Research & Validation",
    options: [
      { value: 1, label: "Almost never" },
      { value: 2, label: "Rarely, maybe once or twice a year" },
      { value: 3, label: "Sometimes, when the project demands it" },
      { value: 4, label: "Regularly for key projects" },
      { value: 5, label: "Very regularly, I push for it proactively" }
    ]
  },
  {
    id: "Q26",
    text: "When you design something, how often is it validated (usability test, A/B test, analytics)?",
    category: "User Research & Validation",
    options: [
      { value: 1, label: "Hardly ever" },
      { value: 2, label: "Rarely, only big features" },
      { value: 3, label: "Sometimes" },
      { value: 4, label: "Often, especially critical flows" },
      { value: 5, label: "Almost always, I push for validation" }
    ]
  },
  {
    id: "Q27",
    text: "How confident are you in turning research insights into clear product decisions?",
    category: "User Research & Validation",
    options: [
      { value: 1, label: "Not confident" },
      { value: 2, label: "I can summarise feedback but struggle to prioritise" },
      { value: 3, label: "I can identify patterns and suggest changes" },
      { value: 4, label: "I can define clear recommendations with rationale" },
      { value: 5, label: "I can frame insights into roadmap-level decisions" }
    ]
  },
  {
    id: "Q28",
    text: "How experienced are you with different research methodologies (interviews, surveys, moderated testing)?",
    category: "User Research & Validation",
    options: [
      { value: 1, label: "Not experienced" },
      { value: 2, label: "I know the basics" },
      { value: 3, label: "I can conduct simple research" },
      { value: 4, label: "I can conduct multiple methods" },
      { value: 5, label: "Expert, I can design and execute rigorous research plans" }
    ]
  },
  {
    id: "Q29",
    text: "How comfortable are you with quantitative data and analytics?",
    category: "User Research & Validation",
    options: [
      { value: 1, label: "I avoid numbers" },
      { value: 2, label: "I can read basic metrics" },
      { value: 3, label: "I understand analytics" },
      { value: 4, label: "I can interpret complex data" },
      { value: 5, label: "I design analytics strategies and make data-driven decisions" }
    ]
  },
  {
    id: "Q30",
    text: "How often do you advocate for user research when stakeholders resist it?",
    category: "User Research & Validation",
    options: [
      { value: 1, label: "I don't" },
      { value: 2, label: "Rarely" },
      { value: 3, label: "Sometimes" },
      { value: 4, label: "Often" },
      { value: 5, label: "Very often, I'm a strong advocate" }
    ]
  },
  {
    id: "Q31",
    text: "How skilled are you at creating research artifacts (personas, user flows, journey maps)?",
    category: "User Research & Validation",
    options: [
      { value: 1, label: "Rarely create these" },
      { value: 2, label: "Basic versions" },
      { value: 3, label: "Competent versions" },
      { value: 4, label: "Detailed and useful" },
      { value: 5, label: "Expert, they drive product decisions" }
    ]
  },
  {
    id: "Q32",
    text: "How comfortable are you analyzing qualitative data (transcripts, notes)?",
    category: "User Research & Validation",
    options: [
      { value: 1, label: "Not comfortable" },
      { value: 2, label: "I pick out obvious points" },
      { value: 3, label: "I can identify themes" },
      { value: 4, label: "I systematically analyze data" },
      { value: 5, label: "I expertly find patterns and generate insights" }
    ]
  },
  {
    id: "Q33",
    text: "How often do you test with real users vs. making assumptions?",
    category: "User Research & Validation",
    options: [
      { value: 1, label: "I mostly make assumptions" },
      { value: 2, label: "Occasional user testing" },
      { value: 3, label: "Regular testing" },
      { value: 4, label: "Frequent testing" },
      { value: 5, label: "Always validate with real users before launch" }
    ]
  },
  {
    id: "Q34",
    text: "How experienced are you with A/B testing and experimentation?",
    category: "User Research & Validation",
    options: [
      { value: 1, label: "Not experienced" },
      { value: 2, label: "I've run a few tests" },
      { value: 3, label: "I can run basic tests" },
      { value: 4, label: "I can design sound experiments" },
      { value: 5, label: "Expert in experimental design and statistical analysis" }
    ]
  },
  {
    id: "Q35",
    text: "How do you handle negative or contradictory feedback?",
    category: "User Research & Validation",
    options: [
      { value: 1, label: "I dismiss it" },
      { value: 2, label: "I defend my design" },
      { value: 3, label: "I listen but don't always act" },
      { value: 4, label: "I investigate the root cause" },
      { value: 5, label: "I systematically understand and incorporate feedback" }
    ]
  },
  {
    id: "Q36",
    text: "How often do you track design performance post-launch?",
    category: "User Research & Validation",
    options: [
      { value: 1, label: "Never" },
      { value: 2, label: "Rarely" },
      { value: 3, label: "Sometimes" },
      { value: 4, label: "Often" },
      { value: 5, label: "Always, I have a continuous monitoring system" }
    ]
  },

  // Product Thinking & Strategy (12 questions)
  {
    id: "Q37",
    text: "How well do you understand the business model and metrics of the product you work on?",
    category: "Product Thinking & Strategy",
    options: [
      { value: 1, label: "Barely" },
      { value: 2, label: "I know a few high-level metrics" },
      { value: 3, label: "I know main KPIs and track them loosely" },
      { value: 4, label: "I understand core funnels and business impact" },
      { value: 5, label: "I can explain trade-offs between UX, revenue, and tech in detail" }
    ]
  },
  {
    id: "Q38",
    text: "When prioritising design ideas, how often do you consider impact vs. effort?",
    category: "Product Thinking & Strategy",
    options: [
      { value: 1, label: "Hardly ever, I just design what's asked" },
      { value: 2, label: "Sometimes, but not systematically" },
      { value: 3, label: "I think about it but don't always voice it" },
      { value: 4, label: "I actively push for high-impact/low-effort ideas" },
      { value: 5, label: "I help PM/Eng prioritise with clear impact/effort framing" }
    ]
  },
  {
    id: "Q39",
    text: "How often are you involved early (problem-definition stage) vs. late (UI-polish stage)?",
    category: "Product Thinking & Strategy",
    options: [
      { value: 1, label: "Almost always brought in late" },
      { value: 2, label: "Mostly late, rarely early" },
      { value: 3, label: "Mixed" },
      { value: 4, label: "Often early in the process" },
      { value: 5, label: "Usually at the very beginning" }
    ]
  },
  {
    id: "Q40",
    text: "How well do you understand your product's competitive landscape?",
    category: "Product Thinking & Strategy",
    options: [
      { value: 1, label: "Not at all" },
      { value: 2, label: "Vaguely" },
      { value: 3, label: "I know the main competitors" },
      { value: 4, label: "I understand competitive differentiation" },
      { value: 5, label: "I deeply analyze competitive landscape and inform strategy" }
    ]
  },
  {
    id: "Q41",
    text: "How often do you think about the longer-term product strategy vs. just the next feature?",
    category: "Product Thinking & Strategy",
    options: [
      { value: 1, label: "Almost never" },
      { value: 2, label: "Rarely" },
      { value: 3, label: "Sometimes" },
      { value: 4, label: "Often" },
      { value: 5, label: "Always, I think in terms of product roadmap" }
    ]
  },
  {
    id: "Q42",
    text: "How comfortable are you making trade-off decisions between UX and other constraints?",
    category: "Product Thinking & Strategy",
    options: [
      { value: 1, label: "I avoid making trade-offs" },
      { value: 2, label: "I begrudgingly accept trade-offs" },
      { value: 3, label: "I make trade-offs but document them" },
      { value: 4, label: "I make thoughtful trade-offs" },
      { value: 5, label: "I lead trade-off discussions with data and strategy" }
    ]
  },
  {
    id: "Q43",
    text: "How experienced are you with different go-to-market strategies?",
    category: "Product Thinking & Strategy",
    options: [
      { value: 1, label: "Not experienced" },
      { value: 2, label: "I know the basics" },
      { value: 3, label: "I understand how GTM affects design" },
      { value: 4, label: "I consider GTM in my designs" },
      { value: 5, label: "I actively influence GTM strategy" }
    ]
  },
  {
    id: "Q44",
    text: "How often do you think about scalability and long-term product growth?",
    category: "Product Thinking & Strategy",
    options: [
      { value: 1, label: "Almost never" },
      { value: 2, label: "Rarely" },
      { value: 3, label: "Sometimes" },
      { value: 4, label: "Often" },
      { value: 5, label: "Always, I design for scale" }
    ]
  },
  {
    id: "Q45",
    text: "How well do you understand user segments and their different needs?",
    category: "Product Thinking & Strategy",
    options: [
      { value: 1, label: "I treat all users the same" },
      { value: 2, label: "I know there are segments" },
      { value: 3, label: "I design for main segments" },
      { value: 4, label: "I deeply understand segment needs" },
      { value: 5, label: "I optimize for different segments strategically" }
    ]
  },
  {
    id: "Q46",
    text: "How often do you contribute to product strategy discussions?",
    category: "Product Thinking & Strategy",
    options: [
      { value: 1, label: "Almost never" },
      { value: 2, label: "Rarely" },
      { value: 3, label: "Sometimes" },
      { value: 4, label: "Often" },
      { value: 5, label: "Always, I'm a key strategic partner" }
    ]
  },
  {
    id: "Q47",
    text: "How comfortable are you with pivot scenarios and design flexibility?",
    category: "Product Thinking & Strategy",
    options: [
      { value: 1, label: "I resist changes" },
      { value: 2, label: "I struggle with changes" },
      { value: 3, label: "I can adapt" },
      { value: 4, label: "I can quickly pivot" },
      { value: 5, label: "I design for flexibility and quick pivots" }
    ]
  },
  {
    id: "Q48",
    text: "How experienced are you with pricing strategy and its impact on design?",
    category: "Product Thinking & Strategy",
    options: [
      { value: 1, label: "Not experienced" },
      { value: 2, label: "I'm aware pricing exists" },
      { value: 3, label: "I understand basic pricing models" },
      { value: 4, label: "I consider pricing in my designs" },
      { value: 5, label: "I actively influence pricing through design" }
    ]
  },

  // Collaboration & Communication (12 questions)
  {
    id: "Q49",
    text: "How comfortable are you presenting your work to stakeholders (PMs, engineers, leadership)?",
    category: "Collaboration & Communication",
    options: [
      { value: 1, label: "Very uncomfortable" },
      { value: 2, label: "Somewhat uncomfortable" },
      { value: 3, label: "Neutral" },
      { value: 4, label: "Quite comfortable" },
      { value: 5, label: "Very confident, I enjoy it" }
    ]
  },
  {
    id: "Q50",
    text: "How often do you write documentation (rationale, specs, handoff notes)?",
    category: "Collaboration & Communication",
    options: [
      { value: 1, label: "Almost never" },
      { value: 2, label: "Rarely" },
      { value: 3, label: "Sometimes" },
      { value: 4, label: "Often" },
      { value: 5, label: "Almost always, with clear and structured docs" }
    ]
  },
  {
    id: "Q51",
    text: "How would you rate your relationship with developers and PMs?",
    category: "Collaboration & Communication",
    options: [
      { value: 1, label: "Often misaligned or tense" },
      { value: 2, label: "Functional but not smooth" },
      { value: 3, label: "Mostly okay, some friction" },
      { value: 4, label: "Generally strong and collaborative" },
      { value: 5, label: "Very strong, I'm seen as a trusted partner" }
    ]
  },
  {
    id: "Q52",
    text: "How often do you seek feedback from your team and stakeholders?",
    category: "Collaboration & Communication",
    options: [
      { value: 1, label: "Rarely" },
      { value: 2, label: "Sometimes" },
      { value: 3, label: "Often" },
      { value: 4, label: "Very often" },
      { value: 5, label: "Always, I actively solicit feedback throughout the process" }
    ]
  },
  {
    id: "Q53",
    text: "How skilled are you at handling difficult conversations or disagreements?",
    category: "Collaboration & Communication",
    options: [
      { value: 1, label: "I avoid them" },
      { value: 2, label: "I'm uncomfortable" },
      { value: 3, label: "I can handle them" },
      { value: 4, label: "I'm quite good at it" },
      { value: 5, label: "I excel at finding win-win solutions" }
    ]
  },
  {
    id: "Q54",
    text: "How often do you mentor or help junior designers?",
    category: "Collaboration & Communication",
    options: [
      { value: 1, label: "Never" },
      { value: 2, label: "Rarely" },
      { value: 3, label: "Sometimes" },
      { value: 4, label: "Often" },
      { value: 5, label: "Very often, I'm invested in growing others" }
    ]
  },
  {
    id: "Q55",
    text: "How comfortable are you with asynchronous communication and documentation?",
    category: "Collaboration & Communication",
    options: [
      { value: 1, label: "I struggle with it" },
      { value: 2, label: "I can do it but prefer meetings" },
      { value: 3, label: "I'm comfortable" },
      { value: 4, label: "I prefer async" },
      { value: 5, label: "I excel at async communication and documentation" }
    ]
  },
  {
    id: "Q56",
    text: "How skilled are you at communicating with non-technical stakeholders?",
    category: "Collaboration & Communication",
    options: [
      { value: 1, label: "I struggle" },
      { value: 2, label: "I can do it with difficulty" },
      { value: 3, label: "I'm okay" },
      { value: 4, label: "I'm good" },
      { value: 5, label: "I'm excellent at translating concepts for any audience" }
    ]
  },
  {
    id: "Q57",
    text: "How often do you participate in design critiques and give/receive feedback?",
    category: "Collaboration & Communication",
    options: [
      { value: 1, label: "Never" },
      { value: 2, label: "Rarely" },
      { value: 3, label: "Sometimes" },
      { value: 4, label: "Often" },
      { value: 5, label: "Always, I actively participate" }
    ]
  },
  {
    id: "Q58",
    text: "How experienced are you with cross-functional project management?",
    category: "Collaboration & Communication",
    options: [
      { value: 1, label: "Not experienced" },
      { value: 2, label: "Basic experience" },
      { value: 3, label: "Decent experience" },
      { value: 4, label: "Strong experience" },
      { value: 5, label: "Expert, I lead complex cross-functional projects" }
    ]
  },
  {
    id: "Q59",
    text: "How well do you adapt your communication style to different audiences?",
    category: "Collaboration & Communication",
    options: [
      { value: 1, label: "I use the same approach for everyone" },
      { value: 2, label: "I try but often miss" },
      { value: 3, label: "I adapt reasonably" },
      { value: 4, label: "I adapt well" },
      { value: 5, label: "I expertly adapt to any audience" }
    ]
  },
  {
    id: "Q60",
    text: "How comfortable are you building relationships with senior leadership?",
    category: "Collaboration & Communication",
    options: [
      { value: 1, label: "Very uncomfortable" },
      { value: 2, label: "Uncomfortable" },
      { value: 3, label: "Neutral" },
      { value: 4, label: "Comfortable" },
      { value: 5, label: "Very comfortable, I build strong executive relationships" }
    ]
  }
];

// Shuffle function
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get 15 random questions (3 from each category)
export function getRandomQuestions(): Question[] {
  const categories = [
    "UX Fundamentals",
    "UI Craft & Visual Design",
    "User Research & Validation",
    "Product Thinking & Strategy",
    "Collaboration & Communication"
  ];

  const questions: Question[] = [];

  categories.forEach(category => {
    const categoryQuestions = allQuestions.filter(q => q.category === category);
    const shuffled = shuffleArray(categoryQuestions);
    questions.push(...shuffled.slice(0, 3));
  });

  return shuffleArray(questions);
}

export const categoryNames = {
  "UX Fundamentals": "UX Fundamentals",
  "UI Craft & Visual Design": "UI Craft & Visual Design",
  "User Research & Validation": "User Research & Validation",
  "Product Thinking & Strategy": "Product Thinking & Strategy",
  "Collaboration & Communication": "Collaboration & Communication"
};
