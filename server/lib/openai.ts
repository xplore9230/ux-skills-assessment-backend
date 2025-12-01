import OpenAI from "openai";

// ============================================================================
// OpenAI Client - Lazy Initialization
// ============================================================================
// IMPORTANT: The client is lazy-initialized to prevent server crashes when
// OPENAI_API_KEY is not set. This allows the server to start and serve
// fallback content from the knowledge bank even without AI.
//
// DO NOT change this to eager initialization like:
//   export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// This will crash the server if the API key is missing.
// ============================================================================

let _openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  if (!_openai) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return _openai;
}

// Helper to check if OpenAI is configured
export function isOpenAIConfigured(): boolean {
  const configured = !!process.env.OPENAI_API_KEY;
  if (!configured) {
    console.log("[OpenAI] API key not configured");
  }
  return configured;
}

// Export for backward compatibility (may be null if API key not set)
export const openai = getOpenAIClient();

// Interfaces for AI responses
export interface AICompletionResponse {
  content: string;
  error?: string;
}

export interface AIJsonCompletionResponse<T> {
  data: T | null;
  error?: string;
}

/**
 * Generate text completion using GPT-5 Nano
 */
export async function generateText(
  systemPrompt: string,
  userPrompt: string,
  model: string = "gpt-4o-mini"
): Promise<AICompletionResponse> {
  const client = getOpenAIClient();
  if (!client) {
    console.log("[OpenAI] generateText: No client available");
    return { content: "", error: "OpenAI API key is not configured" };
  }

  try {
    console.log("[OpenAI] generateText: Calling API with model:", model);
    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || "";
    console.log("[OpenAI] generateText: Success, response length:", content.length);
    return { content };
  } catch (error) {
    console.error("[OpenAI] generateText Error:", error);
    return {
      content: "",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate JSON completion using GPT-5 Nano
 */
export async function generateJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  model: string = "gpt-4o-mini"
): Promise<AIJsonCompletionResponse<T>> {
  const client = getOpenAIClient();
  if (!client) {
    console.log("[OpenAI] generateJSON: No client available");
    return { data: null, error: "OpenAI API key is not configured" };
  }

  try {
    console.log("[OpenAI] generateJSON: Calling API with model:", model);
    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    console.log("[OpenAI] generateJSON: Success, parsing response...");
    const data = JSON.parse(content) as T;
    console.log("[OpenAI] generateJSON: Parsed successfully");
    return { data };
  } catch (error) {
    console.error("[OpenAI] generateJSON Error:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

