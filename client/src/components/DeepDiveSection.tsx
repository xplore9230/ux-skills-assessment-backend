import { motion } from "framer-motion";
import { Loader, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DeepDiveResource {
  title: string;
  type: "article" | "video" | "guide";
  estimated_read_time: string;
  source: string;
  url: string;
  tags: string[];
}

interface DeepDiveTopic {
  name: string;
  pillar: string;
  level: string;
  summary: string;
  practice_points: string[];
  resources: DeepDiveResource[];
}

interface DeepDiveSectionProps {
  topics: DeepDiveTopic[];
  isLoading: boolean;
}

export default function DeepDiveSection({
  topics,
  isLoading,
}: DeepDiveSectionProps) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="space-y-6 max-w-4xl mx-auto"
      >
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Deeper Learning, Curated by AI</h2>
          <p className="text-lg text-muted-foreground">
            Based on your assessment, here are the topics you'll benefit most
            from.
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader className="w-6 h-6 animate-spin mr-3" />
          <span>Finding resources just for you…</span>
        </div>
      </motion.div>
    );
  }

  if (topics.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="space-y-8 max-w-4xl mx-auto"
    >
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Deeper Learning, Curated by AI</h2>
        <p className="text-lg text-muted-foreground">
          Based on your assessment, here are the topics you'll benefit most
          from, plus hand-picked resources to level up faster.
        </p>
      </div>

      <div className="space-y-8">
        {topics.map((topic, topicIndex) => (
          <motion.div
            key={topicIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 + topicIndex * 0.1 }}
            className="border border-border rounded-lg p-6 space-y-4"
          >
            {/* Topic header */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <h3 className="text-2xl font-bold">{topic.name}</h3>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">Pillar: {topic.pillar}</Badge>
                    <Badge variant="outline">Level: {topic.level}</Badge>
                  </div>
                </div>
              </div>

              <p className="text-base text-muted-foreground leading-relaxed">
                {topic.summary}
              </p>
            </div>

            {/* Practice points */}
            <div className="space-y-2">
              <p className="font-semibold text-sm">What to practice next</p>
              <ul className="space-y-1">
                {topic.practice_points.map((point, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    • {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div className="border-t border-border pt-4 space-y-3">
              <p className="font-semibold text-sm">Smart Reading List for You</p>
              <div className="space-y-3">
                {topic.resources.map((resource, resIdx) => (
                  <motion.a
                    key={resIdx}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.8 + resIdx * 0.1 }}
                    className="flex items-start justify-between gap-3 p-3 rounded border border-border hover:bg-muted transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm group-hover:underline">
                        {resource.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {resource.type === "video" ? "Video" : resource.type === "guide" ? "Guide" : "Article"} · {resource.estimated_read_time} · {resource.source}
                      </p>
                      <div className="flex gap-1 flex-wrap mt-2">
                        {resource.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center text-xs text-muted-foreground p-4 border border-border rounded bg-muted/30">
        🔍 <strong>Powered by AI search</strong> — We continuously refresh
        these picks as new, high-quality resources appear.
      </div>
    </motion.div>
  );
}
