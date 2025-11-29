/**
 * Title Block Section
 * 
 * Displays the static title and short description for the stage.
 */

import type { TitleData } from "@/lib/results/types";

interface TitleBlockProps {
  data: TitleData;
}

export default function TitleBlock({ data }: TitleBlockProps) {
  const { title, shortDescription } = data;
  const [stageTitle, stageSubtitle] = title.includes(" – ")
    ? title.split(" – ").map((part) => part.trim())
    : [title, ""];
  
  return (
    <div className="text-center max-w-2xl mx-auto mt-8 relative z-20">
      {/* Stage title */}
      <h1 className="text-5xl md:text-6xl font-playfair font-bold text-foreground mb-3 pb-[10px] tracking-tight">
        {stageTitle}
      </h1>
      
      {/* Subtitle / stage explanation */}
      {stageSubtitle && (
        <h2 className="text-lg md:text-xl font-playfair font-bold text-foreground/90 mb-2 block">
          {stageSubtitle}
        </h2>
      )}
      
      {/* Short description */}
      <p className="text-lg md:text-xl font-playfair italic text-muted-foreground leading-relaxed">
        {shortDescription}
      </p>
    </div>
  );
}


