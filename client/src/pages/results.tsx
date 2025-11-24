import { memo, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import WeekCard from "@/components/WeekCard";
import DeepDiveSection from "@/components/DeepDiveSection";
import CategoryCard from "@/components/CategoryCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { useResultsData } from "@/hooks/useResultsData";
import type { CategoryScore, ImprovementWeek } from "@/types";
import type { PrecomputedResults } from "@/hooks/useBackgroundComputation";

// Helper function to clean resource descriptions
// Now handles contextual AI-generated descriptions from backend
function cleanResourceDescription(description: string | undefined, title: string): string {
  if (!description) return `Explore ${title} to improve your UX skills.`;
  
  // If description is already clean and contextual (from AI), use it as-is
  // Check if it looks like an AI-generated contextual description
  const isContextual = description.length > 30 && 
    !description.includes('* [') && 
    !description.includes('](http') &&
    !description.includes('English Español');
  
  if (isContextual) {
    return description.length > 150 ? description.slice(0, 147) + '...' : description;
  }
  
  // Otherwise, clean markdown formatting
  let cleaned = description
    .replace(/\*\s*\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links, keep text
    .replace(/\*\s*/g, '') // Remove asterisks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove any remaining markdown links
    .replace(/!\[[^\]]*\]\([^\)]+\)/g, '') // Remove images
    .replace(/=+/g, '') // Remove separator lines
    .replace(/^\d+\s+/, '') // Remove leading numbers
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  // Check if it's just a list of languages
  const languagePattern = /^(English|Español|Francais|عربي|中文|日本語)[\s\w\s\.,]*$/i;
  if (languagePattern.test(cleaned) || cleaned.length < 20) {
    return `Learn about ${title} - Available in multiple languages.`;
  }
  
  // Return cleaned description (limit to 150 chars)
  return cleaned.length > 150 ? cleaned.slice(0, 147) + '...' : cleaned;
}

// Helper function to extract domain from URL
function extractSource(url: string | undefined): string {
  if (!url) return '';
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return domain.split('.')[0] || '';
  } catch {
    return '';
  }
}

interface ResultsPageProps {
  stage: string;
  totalScore: number;
  maxScore: number;
  summary: string;
  categories: CategoryScore[];
  improvementPlan: ImprovementWeek[];
  onRestart: () => void;
  cachedResults?: PrecomputedResults | null;
}

const ResultsPage = memo(function ResultsPage({
  stage,
  totalScore,
  maxScore,
  summary,
  categories,
  improvementPlan,
  onRestart,
  cachedResults,
}: ResultsPageProps) {
  const {
    stageReadup,
    resources,
    deepDiveTopics,
    jobLinks,
    layoutStrategy,
    categoryInsights,
    isLoadingResources,
    isLoadingDeepDive,
    isLoadingJobs,
    isLoadingLayout,
    isLoadingInsights,
  } = useResultsData(stage, categories, totalScore, maxScore, cachedResults);

  // Score is displayed immediately - no animation needed

  // Map category insights by category name for easy lookup
  const insightsMap = useMemo(() => {
    const map = new Map();
    categoryInsights.forEach(insight => {
      map.set(insight.category, insight);
    });
    return map;
  }, [categoryInsights]);

  // Define all sections as components
  const sections = useMemo(() => {
    // Format date for hero section: "23 November 2025"
    const formattedDate = new Date().toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
    const assessmentId = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return {
    hero: (
      <motion.div
        key="hero"
        // ANIMATION: Starts invisible and 30px below, fades in and slides up over 0.8 seconds
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        // LAYOUT: 
        // - relative = allows absolute positioning of children
        // - flex flex-col = stacks items vertically
        // - items-center = centers horizontally
        // - text-center = centers text
        // - py-16 = 64px padding top/bottom (change py-16 to py-8 for less, py-24 for more)
        // - px-6 = 24px padding left/right (change px-6 to px-4 for less, px-8 for more)
        // - container mx-auto = centers the container and adds horizontal margin
        // - max-w-5xl = max width of 80rem (1280px) - change to max-w-4xl (896px) or max-w-6xl (1152px)
        // - overflow-hidden = clips content that goes outside
        className="relative flex flex-col items-center text-center pt-12 sm:pt-16 pb-8 sm:pb-12 px-4 sm:px-6 container mx-auto max-w-5xl overflow-visible"
      >
        {/* 
          GRADIENT OVAL BLUR EFFECT (Desktop - tablets and up):
          This creates the green glowing blur behind the trophy/score.
          
          HOW TO EDIT:
          - width: '1356px' = width of the oval (change number for bigger/smaller)
          - height: '403px' = height of the oval (change number for taller/shorter)
          - background: '#54FF51' = green color (change hex code for different color)
          - opacity: 0.1 = how see-through it is (0 = invisible, 1 = solid, 0.1 = 10% visible)
          - filter: 'blur(144px)' = how blurry it is (higher number = more blur, lower = sharper)
          - translate-y-[30%] = moves it up by 30% (change -30% to -20% to move it down, -40% to move it up)
          - hidden md:block = hides on mobile, shows on medium screens and up
        */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[30%] pointer-events-none hidden md:block"
          style={{
            width: '100vw',
            maxWidth: '1356px',
            height: '403px',
            background: '#54FF51',
            opacity: 0.05,
            borderRadius: '50%',
            filter: 'blur(144px)',
            zIndex: 0,
          }}
        />
        {/* 
          GRADIENT OVAL BLUR EFFECT (Mobile):
          Smaller version for phones to save performance.
          
          HOW TO EDIT:
          - width: '100vw' = full screen width (vw = viewport width)
          - height: '300px' = height of blur (change number)
          - filter: 'blur(100px)' = blur amount (lower than desktop for better performance)
          - translate-y-[20%] = vertical position (adjust percentage)
          - md:hidden = shows on mobile only, hides on tablets and up
        */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[20%] pointer-events-none md:hidden"
          style={{
            width: '100vw',
            maxWidth: '100vw',
            height: '300px',
            background: '#54FF51',
            opacity: 0.05,
            borderRadius: '50%',
            filter: 'blur(100px)',
            zIndex: 0,
          }}
        />

        {/* 
          CONTENT WRAPPER:
          z-10 = sits above the blur effect (lower numbers = behind, higher = in front)
          relative = allows absolute positioning inside
          flex flex-col = stacks items vertically
          items-center = centers items horizontally
          w-full = full width of parent
        */}
        <div className="relative z-10 flex flex-col items-center w-full">
          {/* 
            DATE/ID BADGE STYLING:
            text-xs = extra small text (12px) - change to text-sm (14px) or text-base (16px) for bigger
            font-serif = fancy serif font - remove to use default font
            text-muted-foreground/70 = gray color at 70% opacity (change /70 to /50 for lighter, /90 for darker)
            tracking-wide = letter spacing (change to tracking-normal for less, tracking-wider for more)
            mb-8 = 32px margin bottom (space below) - change mb-8 to mb-4 for less space, mb-12 for more
          */}
          <div className="text-xs font-serif text-muted-foreground/70 tracking-wide mb-6 sm:mb-8">
            {formattedDate} • Assessment #{assessmentId}
          </div>

          {/* 
            TROPHY IMAGE STYLING:
            ANIMATION: Starts at 80% size, invisible, and 10px below, then grows to full size and fades in
            delay: 0.2 = waits 0.2 seconds before animating (change for timing)
            duration: 0.6 = takes 0.6 seconds to animate (change for speed)
          */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="flex items-center justify-center"
          >
            {/* 
              TROPHY IMAGE SIZE:
              w-[200px] = width 200px (change [200px] to [150px] for smaller, [250px] for bigger)
              h-[200px] = height 200px (should match width for square)
              object-contain = keeps image proportions (don't change this)
            */}
            <img 
              src="/trophy.png" 
              alt="Trophy" 
              className="w-[200px] h-[200px] object-contain"
            />
          </motion.div>

          {/* 
            MAIN SCORE NUMBER STYLING:
            ANIMATION: Starts at 90% size and invisible, grows to full size
            delay: 0.3 = starts 0.3 seconds after page loads (change for timing)
            mt-0 = no margin top (this keeps it touching the trophy above)
            
            FONT SIZE (responsive - changes on different screen sizes):
            text-[8rem] = 128px on mobile (tiny screens)
            sm:text-[10rem] = 160px on small screens (tablets)
            md:text-[12rem] = 192px on medium+ screens (desktops)
            Change these numbers to make bigger/smaller: [8rem] = smaller, [15rem] = huge
            
            font-bold = thick letters (change to font-normal for thin, font-black for extra thick)
            tracking-tight = letters close together (change to tracking-normal for more space)
            text-foreground = uses theme text color (black in light mode, white in dark mode)
            leading-none = no extra line height (keeps number compact)
            select-none = can't highlight text with mouse (remove if you want selectable)
          */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="flex items-baseline justify-center mt-0 w-full px-4"
          >
            <span className="font-sans text-[6rem] sm:text-[8rem] md:text-[10rem] lg:text-[12rem] font-bold tracking-tight text-black leading-none select-none break-all overflow-visible whitespace-nowrap">
              {totalScore}
            </span>
          </motion.div>

          {/* 
            STAGE TITLE (e.g., "Strategic Lead"):
            ANIMATION: Fades in and slides up from 10px below
            delay: 0.4 = starts 0.4 seconds after page loads
            mt-8 = 32px margin top (space above) - change mt-8 to mt-4 for less space, mt-12 for more
            
            FONT SIZE (responsive):
            text-4xl = 36px on mobile
            sm:text-5xl = 48px on tablets
            md:text-6xl = 60px on desktop
            Change these for bigger/smaller text
          */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-tight mt-6 sm:mt-8 px-4 break-words"
          >
            {stage}
          </motion.h1>

          {/* 
            DESCRIPTIVE QUOTE STYLING:
            ANIMATION: Fades in and slides up
            delay: 0.5 = starts 0.5 seconds after page loads (last element)
            mt-8 = 32px margin top (space above) - adjust for spacing
            
            TEXT SIZE (responsive):
            text-base = 16px on mobile
            sm:text-lg = 18px on tablets
            md:text-xl = 20px on desktop
            
            text-foreground/90 = text color at 90% opacity (slightly faded) - change /90 to /70 for lighter, /100 for solid
            max-w-3xl = max width of 48rem (768px) - prevents text from being too wide
            mx-auto = centers the text block horizontally
            leading-relaxed = comfortable line height (change to leading-normal for tighter, leading-loose for more space)
            font-serif = fancy serif font - remove to use default
            italic = slanted text - remove italic for normal text
          */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
            className="text-base sm:text-lg md:text-xl text-foreground/90 max-w-3xl mx-auto leading-relaxed font-serif italic mt-6 sm:mt-8 px-4 break-words pb-0"
          >
            "{summary}"
          </motion.p>
        </div>
      </motion.div>
    ),

    "stage-readup": stageReadup || isLoadingResources ? (
      stageReadup ? (
        <motion.div
          key="stage-readup"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto text-center border-t border-border/40 pt-8 sm:pt-10 pb-4 sm:pb-6 space-y-5 px-4"
        >
          <h2 className="text-2xl font-serif font-bold italic break-words">What this means for you</h2>
          <p className="text-lg leading-relaxed text-muted-foreground/90 font-medium break-words">
            {stageReadup}
          </p>
        </motion.div>
      ) : (
        <motion.div
          key="stage-readup-loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-3xl mx-auto text-center py-12 space-y-4"
        >
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-foreground/20 border-t-foreground rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground animate-pulse">AI analyzing your career stage...</p>
        </motion.div>
      )
    ) : null,

    "skill-breakdown": (
      <div key="skill-breakdown" className="space-y-8 sm:space-y-10 border-t border-border/40 pt-10 sm:pt-12 pb-4 sm:pb-6 w-full overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center space-y-3 px-4"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold break-words">Skill Analysis</h2>
          <p className="text-muted-foreground font-medium break-words">Your performance across key UX competencies</p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-fr w-full">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="h-full"
            >
              <CategoryCard 
                {...category}
                insight={insightsMap.get(category.name)}
                isLoadingInsight={isLoadingInsights}
              />
            </motion.div>
          ))}
        </div>
      </div>
    ),

    resources: resources.length > 0 ? (
      <div key="resources" className="space-y-6 sm:space-y-8 border-t border-border/40 pt-10 sm:pt-12 pb-4 sm:pb-6 w-full overflow-hidden">
        <div className="text-center space-y-3 px-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold break-words">Curated Resources</h2>
          <p className="text-muted-foreground font-medium break-words">Hand-picked for your specific skill gaps</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
          {resources.map((resource, index) => {
            const displayDescription = cleanResourceDescription(resource.description, resource.title);
            const source = extractSource(resource.url);
            
            return (
              <motion.a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className="group flex flex-col gap-3 p-4 sm:p-6 rounded-2xl border border-border/40 bg-card hover:border-foreground/20 hover:shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98] w-full overflow-hidden"
              >
                <div className="flex-1 min-w-0 space-y-2 overflow-hidden">
                  <div className="flex items-start justify-between gap-3 min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg group-hover:text-primary group-hover:underline transition-colors flex-1 break-words min-w-0">
                      {resource.title}
                    </h3>
                    <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity mt-1" aria-hidden="true" />
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed break-words line-clamp-3">
                    {displayDescription}
                  </p>
                  {source && (
                    <p className="text-xs text-muted-foreground/60 capitalize mt-1">
                      {source}
                    </p>
                  )}
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    ) : isLoadingResources && !resources.length ? (
      <div key="resources-loading" className="space-y-8 border-t border-border/40 pt-16 opacity-60">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-serif font-bold">Curated Resources</h2>
          <p className="text-muted-foreground font-medium">Hand-picked for your specific skill gaps</p>
          <div className="flex justify-center mt-4">
            <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" role="status" aria-label="Loading resources" />
          </div>
        </div>
      </div>
    ) : !isLoadingResources && !resources.length ? (
      <div key="resources-empty" className="space-y-8 border-t border-border/40 pt-16 text-center">
        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-serif font-bold">Curated Resources</h2>
          <p className="text-muted-foreground">
            Resources are being prepared for your profile.
          </p>
          <p className="text-sm text-muted-foreground/70">
            Check back in a moment for personalized recommendations.
          </p>
        </div>
      </div>
    ) : null,

    "deep-dive": !isLoadingDeepDive && deepDiveTopics.length > 0 ? (
      <div key="deep-dive-wrapper" className="border-t border-border/40 pt-10 sm:pt-12 pb-4 sm:pb-6 w-full overflow-hidden">
        <DeepDiveSection
          key="deep-dive"
          topics={deepDiveTopics}
          isLoading={false}
        />
      </div>
    ) : isLoadingDeepDive ? (
      <div key="deep-dive-loading" className="space-y-8 border-t border-border/40 pt-16 text-center">
        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-serif font-bold">Deeper Learning, Curated by AI</h2>
          <p className="text-muted-foreground font-medium animate-pulse">Generating personalized study paths...</p>
          <div className="flex justify-center mt-4">
            <div className="w-8 h-8 border-4 border-foreground/20 border-t-foreground rounded-full animate-spin" />
          </div>
        </div>
      </div>
    ) : null,

    "improvement-plan": (
      <div key="improvement-plan" className="space-y-8 sm:space-y-10 border-t border-border/40 pt-10 sm:pt-12 pb-4 sm:pb-6 w-full overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center space-y-3 px-4"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold break-words">4-Week Roadmap</h2>
          <p className="text-muted-foreground font-medium break-words">Your personalized action plan</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 auto-rows-fr hidden md:grid w-full">
          {improvementPlan.map((week, index) => (
            <WeekCard
              key={week.week}
              week={week.week}
              tasks={week.tasks}
              delay={0.2 + index * 0.1}
            />
          ))}
        </div>

        {/* Mobile Horizontal Scroll View */}
        <div className="flex md:hidden overflow-x-auto gap-4 pb-4 -mx-4 sm:-mx-6 px-4 sm:px-6 snap-x snap-mandatory scrollbar-hide w-full">
          {improvementPlan.map((week, index) => (
            <div key={week.week} className="min-w-[85vw] sm:min-w-[350px] snap-center h-full flex-shrink-0">
              <WeekCard
                week={week.week}
                tasks={week.tasks}
                delay={0.2 + index * 0.1}
              />
            </div>
          ))}
        </div>
      </div>
    ),

    jobs: !isLoadingJobs && jobLinks ? (
      <div key="jobs" className="space-y-6 sm:space-y-8 border-t border-border/40 pt-10 sm:pt-12 pb-8 sm:pb-12 w-full overflow-hidden">
        <div className="text-center space-y-3 px-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold break-words">Find Your Next Role</h2>
          <p className="text-muted-foreground font-medium text-base sm:text-lg break-words">
            Based on your experience, we recommend looking for 
            <span className="font-bold text-foreground mx-1 break-words inline-block">{jobLinks.job_title}</span>
            roles.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
          <a
            href={jobLinks.linkedin_url}
            target="_blank"
            rel="noreferrer"
            aria-label={`Search for ${jobLinks.job_title} jobs on LinkedIn (opens in new tab)`}
            className="flex items-center justify-center gap-2 px-6 sm:px-8 py-4 bg-foreground text-background rounded-full font-semibold hover:bg-foreground/90 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[44px] w-full sm:w-auto"
          >
            Search on LinkedIn
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </a>
          
          <a
            href={jobLinks.google_url}
            target="_blank"
            rel="noreferrer"
            aria-label={`Search for ${jobLinks.job_title} jobs on Google Jobs (opens in new tab)`}
            className="flex items-center justify-center gap-2 px-6 sm:px-8 py-4 bg-white/95 text-gray-900 rounded-full font-semibold hover:bg-white transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[44px] w-full sm:w-auto"
          >
            Search on Google Jobs
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    ) : isLoadingJobs ? (
      <div key="jobs-loading" className="space-y-8 border-t border-border/40 pt-16 text-center">
        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-serif font-bold">Find Your Next Role</h2>
          <p className="text-muted-foreground font-medium animate-pulse">Finding Relevant Roles...</p>
          <div className="flex justify-center mt-4">
            <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
          </div>
        </div>
      </div>
    ) : null,
  };
  }, [stage, totalScore, maxScore, summary, categories, improvementPlan, stageReadup, resources, deepDiveTopics, jobLinks, insightsMap, isLoadingResources, isLoadingDeepDive, isLoadingJobs, isLoadingInsights]);

  // Get section order from layout strategy or use default
  const sectionOrder = layoutStrategy?.section_order || [
    "hero",
    "stage-readup",
    "skill-breakdown",
    "resources",
    "deep-dive",
    "improvement-plan",
    "jobs"
  ];

  // Get section visibility from layout strategy or show all by default
  const sectionVisibility = layoutStrategy?.section_visibility || {
    hero: true,
    "stage-readup": true,
    "skill-breakdown": true,
    resources: true,
    "deep-dive": true,
    "improvement-plan": true,
    jobs: true,
  };

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-foreground/10">
      {/* 
        MAIN PAGE CONTAINER:
        min-h-screen = minimum height of full screen (keeps page from being too short)
        bg-background = uses theme background color
        font-sans = default sans-serif font (remove to use other font)
        selection:bg-foreground/10 = when you highlight text, background is light (change /10 to /20 for darker)
      */}

      {/* Dynamic Sections */}
      {sectionOrder.map((sectionId, index) => {
        const shouldShow = sectionVisibility[sectionId] !== false;
        const section = sections[sectionId as keyof typeof sections];
        
        if (!shouldShow || !section) return null;
        
        // HERO SECTION SPECIAL HANDLING:
        // isHero = checks if this is the hero section (with trophy and score)
        // Hero gets full-width gradient background, other sections get normal container
        const isHero = sectionId === 'hero';
        const isLastSection = index === sectionOrder.length - 1;
        const isStageReadup = sectionId === 'stage-readup';
        
        return (
          <div 
            key={sectionId} 
            // HERO SECTION: w-full = full width of screen (for gradient background)
            // Other sections: no special width class (uses default)
            className={isHero ? "w-full" : ""}
            // BACKGROUND GRADIENT (only on hero section):
            // linear-gradient = smooth color transition
            // to bottom = direction of gradient (change to "to right" for horizontal)
            // #f0fdf4 = light green at top (change hex code for different color)
            // #ffffff = white at bottom (change hex code)
            // 0% = where top color starts, 100% = where bottom color ends
            // Change 0% to 20% to make green start lower
            // Change 100% to 80% to make white start higher
            style={isHero ? {
              background: 'linear-gradient(to bottom, #f0fdf4 0%, #ffffff 100%)'
            } : {}}
          >
            {isHero ? (
              section
            ) : (
              // SECTION CONTAINER (for all non-hero sections):
              // container = adds horizontal padding automatically
              // mx-auto = centers the container horizontally
              // px-4 sm:px-6 = responsive padding (16px mobile, 24px desktop)
              // max-w-5xl = max width 1280px (change to max-w-4xl for narrower, max-w-6xl for wider)
              // overflow-hidden = prevents content from overflowing container
              // w-full = ensures full width with proper containment
              //
              // OPTIMIZED SPACING SYSTEM (consistent, reduced padding):
              // - stage-readup (first after hero): pt-8 sm:pt-10 (32px/40px), pb-0 (no extra bottom - handled by section)
              // - All other sections: pt-6 sm:pt-8 lg:pt-10 (24px/32px/40px top)
              // - Last section (jobs): pb-6 sm:pb-8 (24px/32px final bottom padding)
              // - Internal section spacing handled by each section's own padding
              <div className={`container mx-auto px-4 sm:px-6 max-w-5xl w-full overflow-hidden ${
                isStageReadup 
                  ? "pt-8 sm:pt-10 pb-0" 
                  : isLastSection 
                    ? "pt-6 sm:pt-8 lg:pt-10 pb-0" 
                    : "pt-6 sm:pt-8 lg:pt-10 pb-0"
              }`}>
                {section}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

export default ResultsPage;
