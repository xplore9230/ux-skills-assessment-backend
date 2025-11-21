import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // AI-generated improvement plan endpoint
  app.post("/api/generate-improvement-plan", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "AI service not configured" });
      }

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const { stage, totalScore, maxScore, categories } = req.body;

      const categoryDetails = categories
        .map((c: any) => `${c.name}: ${c.score}/${c.maxScore}`)
        .join("\n");

      const prompt = `You are a UX career coach. Based on this assessment result, generate a personalized 4-week improvement plan.

Career Stage: ${stage}
Total Score: ${totalScore}/${maxScore}

Skill Breakdown:
${categoryDetails}

Create a concise, actionable 4-week plan. For each week, provide 3 specific, practical tasks that build on previous weeks. Focus on the weakest areas. Format as JSON:
{
  "weeks": [
    {"week": 1, "tasks": ["task1", "task2", "task3"]},
    {"week": 2, "tasks": ["task1", "task2", "task3"]},
    {"week": 3, "tasks": ["task1", "task2", "task3"]},
    {"week": 4, "tasks": ["task1", "task2", "task3"]}
  ]
}`;

      const message = await openai.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = message.choices[0].message.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const plan = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

      res.json(plan || { weeks: [] });
    } catch (error) {
      console.error("Error generating plan:", error);
      res.status(500).json({ error: "Failed to generate plan" });
    }
  });

  // Career stage readup and resource recommendations endpoint
  app.post("/api/generate-resources", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "AI service not configured" });
      }

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const { stage, categories } = req.body;

      const categoryDetails = categories
        .map((c: any) => `${c.name}: ${c.score}/${c.maxScore}`)
        .join("\n");

      const prompt = `You are a UX career expert. Based on this assessment result, provide:
1. A brief, inspiring career stage readup (2-3 sentences)
2. 4-5 highly relevant and real articles/resources with actual URLs

Career Stage: ${stage}

Skill Breakdown:
${categoryDetails}

Focus on resources that directly address the weakest skill areas. Format as JSON:
{
  "readup": "Brief inspiring paragraph about their career stage",
  "resources": [
    {"title": "Article Title", "url": "https://...", "description": "Brief description"},
    {"title": "Article Title", "url": "https://...", "description": "Brief description"}
  ]
}

IMPORTANT: Only include real, verified articles and resources with correct URLs. Research actual UX articles and resources.`;

      const message = await openai.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = message.choices[0].message.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const data = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

      res.json(data || { readup: "", resources: [] });
    } catch (error) {
      console.error("Error generating resources:", error);
      res.status(500).json({ error: "Failed to generate resources" });
    }
  });

  // AI-powered deep dive topics endpoint
  app.post("/api/generate-deep-dive", async (req, res) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "AI service not configured" });
      }

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const { stage, categories } = req.body;

      const categoryDetails = categories
        .map((c: any) => `${c.name}: ${c.score}/${c.maxScore}`)
        .join("\n");

      const prompt = `You are a UX career expert. Based on this assessment result, provide 2-3 deep dive topics for focused learning.

Career Stage: ${stage}

Skill Breakdown:
${categoryDetails}

For each topic, provide:
- name: Topic title
- pillar: Which skill area (from the 5 categories)
- level: Beginner/Intermediate/Advanced
- summary: 1-2 sentence explanation of why this matters for them
- practice_points: 3 specific action items
- resources: 3 real learning resources (articles, videos, guides)

Focus on their weakest areas first. Format as JSON:
{
  "topics": [
    {
      "name": "Topic Name",
      "pillar": "Category Name",
      "level": "Intermediate",
      "summary": "Why this matters...",
      "practice_points": ["action1", "action2", "action3"],
      "resources": [
        {
          "title": "Resource Title",
          "type": "article|video|guide",
          "estimated_read_time": "12 min",
          "source": "Source Name",
          "url": "https://example.com",
          "tags": ["tag1", "tag2"]
        }
      ]
    }
  ]
}

IMPORTANT: Include ONLY real, verified resources with correct URLs.`;

      const message = await openai.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = message.choices[0].message.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const data = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

      res.json(data || { topics: [] });
    } catch (error) {
      console.error("Error generating deep dive:", error);
      res.status(500).json({ error: "Failed to generate deep dive" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
