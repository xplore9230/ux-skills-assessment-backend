import { ArrowSquareOut, Radio } from "@phosphor-icons/react";
import type { TopPodcastsData } from "@/lib/results/types";

interface TopPodcastsProps {
  data: TopPodcastsData;
}

export default function TopPodcasts({ data }: TopPodcastsProps) {
  const podcasts = data?.podcasts || [];
  if (podcasts.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-2 items-center text-center">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2 md:mb-1">
            Top Podcasts to Stay Sharp
          </h2>
          <p className="text-sm text-muted-foreground">
            Follow these shows to keep new ideas, leadership lessons, and practical tips on rotation.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {podcasts.map((podcast) => (
          <a
            key={podcast.id}
            href={podcast.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-xl border border-border/30 bg-card p-5 hover:border-foreground/20 transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center">
                <Radio size={20} weight="duotone" className="text-foreground" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground group-hover:text-foreground/80">
                  {podcast.name}
                </h3>
                <p className="text-xs text-muted-foreground">{podcast.focus}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {podcast.description}
            </p>
            <div className="flex items-center gap-1 text-sm font-medium text-foreground group-hover:text-foreground/80">
              <span>Listen now</span>
              <ArrowSquareOut size={14} weight="duotone" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
