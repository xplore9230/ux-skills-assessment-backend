import type { LearningQuestion } from "@/types";

// Cache for all questions and selected questions
let cachedAllQuestions: LearningQuestion[] | null = null;
let cachedSelectedQuestions: LearningQuestion[] | null = null;

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Load all pre-generated learning questions from JSON file
 */
async function loadPregeneratedQuestions(): Promise<LearningQuestion[]> {
  if (cachedAllQuestions) {
    return cachedAllQuestions;
  }

  try {
    // Load learning questions from public folder (served as static asset)
    const response = await fetch('/design_system_learning_questions.json');
    
    if (!response.ok) {
      throw new Error(`Failed to load questions: ${response.statusText}`);
    }

    const questions = await response.json() as LearningQuestion[];
    
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Invalid questions data");
    }

    cachedAllQuestions = questions;
    return questions;
  } catch (error) {
    console.error("Error loading pre-generated learning questions:", error);
    throw error;
  }
}

/**
 * Get random design system learning questions from pre-generated pool
 * Selects 5 questions per category (30 total)
 */
function getRandomDesignSystemQuestions(allQuestions: LearningQuestion[]): LearningQuestion[] {
  const categories = [
    "Foundations",
    "Tokens",
    "Core Systems",
    "Components",
    "Patterns",
    "Governance"
  ];

  const selectedQuestions: Question[] = [];

  // Select 5 questions from each category
  categories.forEach(category => {
    const categoryQuestions = allQuestions.filter(
      q => q.category === category
    );
    
    if (categoryQuestions.length === 0) {
      console.warn(`No questions found for category: ${category}`);
      return;
    }
    
    const shuffled = shuffleArray(categoryQuestions);
    selectedQuestions.push(...shuffled.slice(0, 5));
  });

  // Shuffle the final array to randomize order
  return shuffleArray(selectedQuestions);
}

/**
 * Fetch design system learning questions from pre-generated JSON
 */
export async function fetchDesignSystemQuestions(): Promise<LearningQuestion[]> {
  // Return cached selected questions if available
  if (cachedSelectedQuestions) {
    return cachedSelectedQuestions;
  }

  try {
    // Load all questions from JSON
    const allQuestions = await loadPregeneratedQuestions();
    
    // Select 30 random questions (5 per category)
    cachedSelectedQuestions = getRandomDesignSystemQuestions(allQuestions);
    return cachedSelectedQuestions;
  } catch (error) {
    console.error("Error loading pre-generated questions:", error);
    // Fallback to API generation if JSON loading fails
    return fetchDesignSystemQuestionsFromAPI();
  }
}

/**
 * Fallback: Fetch questions from API if JSON loading fails
 */
async function fetchDesignSystemQuestionsFromAPI(): Promise<LearningQuestion[]> {
  const PYTHON_API_URL = import.meta.env.VITE_PYTHON_API_URL || "http://localhost:8000";
  
  try {
    const response = await fetch(`${PYTHON_API_URL}/api/generate-design-system-questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch questions: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.questions && Array.isArray(data.questions)) {
      return data.questions as Question[];
    }
    
    throw new Error("Invalid response format");
  } catch (error) {
    console.error("Error fetching questions from API:", error);
    // Return fallback questions
    return getFallbackQuestions();
  }
}

/**
 * Fallback questions if API fails
 */
function getFallbackQuestions(): LearningQuestion[] {
  const categories = [
    "Foundations",
    "Tokens",
    "Core Systems",
    "Components",
    "Patterns",
    "Governance"
  ];

  const questions: LearningQuestion[] = [];
  
  categories.forEach((category, catIndex) => {
    for (let i = 0; i < 5; i++) {
      questions.push({
        id: `DS-${category}-${i + 1}`,
        text: `What is a key concept in ${category.toLowerCase()}?`,
        category: category,
        options: [
          { value: 0, label: "Option A" },
          { value: 1, label: "Option B" },
          { value: 2, label: "Option C" },
          { value: 3, label: "Option D" },
          { value: 4, label: "Option E" }
        ],
        correctAnswerIndex: 0,
        explanation: "This is a fallback question. Please reload to get proper learning questions.",
        relatedTopics: [category.toLowerCase()],
        relatedSection: ""
      });
    }
  });

  return questions;
}

/**
 * Clear cached questions (useful for resetting)
 */
export function clearDesignSystemQuestionsCache() {
  cachedAllQuestions = null;
  cachedSelectedQuestions = null;
}

/**
 * Get design system learning questions with caching
 */
export async function getDesignSystemQuestions(): Promise<LearningQuestion[]> {
  return fetchDesignSystemQuestions();
}

