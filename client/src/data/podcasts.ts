import type { PodcastRecommendation, TopPodcastsData } from "@/lib/results/types";

const PODCASTS: PodcastRecommendation[] = [
  {
    id: "podcast-ux-podcast",
    name: "UX Podcast",
    url: "https://uxpodcast.com/",
    description: "Conversations with UX leaders about research, service design, and the business side of design.",
    focus: "All stages · Big-picture UX thinking",
  },
  {
    id: "podcast-user-defenders",
    name: "User Defenders",
    url: "https://userdefenders.com/",
    description: "Interviews that dig into career journeys, creative confidence, and human-centered product work.",
    focus: "Mindset & careers",
  },
  {
    id: "podcast-design-details",
    name: "Design Details",
    url: "https://designdetails.fm/",
    description: "Weekly chats with practitioners shipping consumer and enterprise products at scale.",
    focus: "Craft & product",
  },
  {
    id: "podcast-smashing",
    name: "Smashing Podcast",
    url: "https://podcast.smashingmagazine.com",
    description: "Deep dives from Smashing Magazine covering accessibility, performance, and process.",
    focus: "Systems & accessibility",
  },
  {
    id: "podcast-design-better",
    name: "Design Better",
    url: "https://www.aarronwalter.com/podcast",
    description: "Design Better's conversations with design execs on leadership, culture, and strategic impact.",
    focus: "Leadership & org influence",
  },
  {
    id: "podcast-spotify-design-details",
    name: "Design Details on Spotify",
    url: "https://open.spotify.com/show/7kAx8RJce757LXVoX2FIpf",
    description: "An easy-to-binge feed for keeping up with the latest design stories while commuting.",
    focus: "Ongoing inspiration",
  },
  {
    id: "podcast-uxdi-roundup",
    name: "Top UX Podcasts (UXDI)",
    url: "https://www.uxdesigninstitute.com/blog/top-podcasts-for-ux-designers/",
    description: "UX Design Institute’s curated roundup if you want even more shows to follow.",
    focus: "Curated list",
  },
];

export function getTopPodcasts(): PodcastRecommendation[] {
  return PODCASTS;
}

export function getTopPodcastsData(): TopPodcastsData {
  return { podcasts: PODCASTS };
}
