import type { LearningQuestion } from "@/types";

export interface LearningQuizResult {
  totalCorrect: number;
  totalQuestions: number;
  percentage: number;
  performanceLevel: "Excellent" | "Good" | "Needs Improvement";
  categoryBreakdown: {
    category: string;
    correct: number;
    total: number;
    percentage: number;
  }[];
  wrongAnswers: {
    question: LearningQuestion;
    userAnswer: number;
    correctAnswer: number;
  }[];
}

export function calculateLearningQuizScore(
  answers: Record<string, number>,
  questions: LearningQuestion[]
): LearningQuizResult {
  const categoryStats: Record<string, { correct: number; total: number }> = {};
  const wrongAnswers: {
    question: LearningQuestion;
    userAnswer: number;
    correctAnswer: number;
  }[] = [];

  let totalCorrect = 0;
  let totalQuestions = 0;

  questions.forEach((question) => {
    const userAnswer = answers[question.id];
    if (userAnswer === undefined) return;

    totalQuestions++;
    const isCorrect = userAnswer === question.correctAnswerIndex;

    // Initialize category stats
    if (!categoryStats[question.category]) {
      categoryStats[question.category] = { correct: 0, total: 0 };
    }
    categoryStats[question.category].total++;

    if (isCorrect) {
      totalCorrect++;
      categoryStats[question.category].correct++;
    } else {
      wrongAnswers.push({
        question,
        userAnswer,
        correctAnswer: question.correctAnswerIndex,
      });
    }
  });

  const percentage = totalQuestions > 0 
    ? Math.round((totalCorrect / totalQuestions) * 100) 
    : 0;

  const performanceLevel: "Excellent" | "Good" | "Needs Improvement" =
    percentage >= 80
      ? "Excellent"
      : percentage >= 60
      ? "Good"
      : "Needs Improvement";

  const categoryBreakdown = Object.entries(categoryStats).map(
    ([category, stats]) => ({
      category,
      correct: stats.correct,
      total: stats.total,
      percentage:
        stats.total > 0
          ? Math.round((stats.correct / stats.total) * 100)
          : 0,
    })
  );

  return {
    totalCorrect,
    totalQuestions,
    percentage,
    performanceLevel,
    categoryBreakdown,
    wrongAnswers,
  };
}

