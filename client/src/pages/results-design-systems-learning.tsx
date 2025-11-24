import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Trophy, BookOpen, Download, ChevronDown, ChevronUp, CheckCircle2, XCircle } from "lucide-react";
import type { LearningQuestion } from "@/types";
import { Link } from "react-router-dom";
import type { LearningQuizResult } from "@/lib/designSystemLearningScoring";

interface LearningResultsPageProps {
  result: LearningQuizResult;
  questions: LearningQuestion[];
  answers: Record<string, number>;
  onRestart: () => void;
}

const LearningResultsPage = memo(function LearningResultsPage({
  result,
  questions,
  answers,
  onRestart,
}: LearningResultsPageProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const getPerformanceColor = (level: string) => {
    switch (level) {
      case "Excellent":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Good":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Needs Improvement":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-muted text-foreground border-border";
    }
  };

  const handleDownloadPDF = () => {
    const link = document.createElement("a");
    link.href = "/design-systems-ebook.pdf";
    link.download = "Design-Systems-Complete-Guide.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Group questions by category
  const questionsByCategory = questions.reduce((acc, q) => {
    if (!acc[q.category]) acc[q.category] = [];
    acc[q.category].push(q);
    return acc;
  }, {} as Record<string, LearningQuestion[]>);

  // Get recommended sections based on wrong answers
  const recommendedSections = Array.from(
    new Set(
      result.wrongAnswers
        .map((wa) => wa.question.relatedSection)
        .filter((s): s is string => Boolean(s))
    )
  );

  return (
    <div className="min-h-screen bg-background relative pb-24">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="text-muted-foreground">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <Trophy className="h-24 w-24 text-foreground/20" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            {result.totalCorrect}/{result.totalQuestions}
          </h1>

          <div className="mb-4">
            <span
              className={`inline-block px-4 py-2 rounded-full border text-sm font-semibold ${getPerformanceColor(
                result.performanceLevel
              )}`}
            >
              {result.performanceLevel}
            </span>
          </div>

          <p className="text-2xl md:text-3xl text-muted-foreground mb-6">
            {result.percentage}% Correct
          </p>

          <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
            {result.performanceLevel === "Excellent"
              ? "Outstanding work! You have a strong understanding of design systems."
              : result.performanceLevel === "Good"
              ? "Great job! Review the explanations below to strengthen your knowledge."
              : "Keep learning! Review the explanations and recommended sections to improve."}
          </p>
        </motion.div>

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Questions</p>
                <p className="text-2xl font-bold">{result.totalQuestions}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Correct Answers</p>
                <p className="text-2xl font-bold text-green-400">
                  {result.totalCorrect}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Score</p>
                <p className="text-2xl font-bold">{result.percentage}%</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold mb-6">Category Performance</h2>
          <div className="space-y-4">
            {result.categoryBreakdown.map((category) => (
              <Card key={category.category} className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">{category.category}</h3>
                  <span className="text-sm font-semibold">
                    {category.correct}/{category.total} ({category.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mb-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* All Questions Review */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold mb-6">Question Review</h2>
          <div className="space-y-4">
            {Object.entries(questionsByCategory).map(([category, catQuestions]) => {
              const isCategoryExpanded = expandedCategories.has(category);
              return (
                <Card key={category} className="overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full p-6 flex justify-between items-center hover:bg-muted/50 transition-colors"
                  >
                    <h3 className="text-xl font-semibold">{category}</h3>
                    {isCategoryExpanded ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                  <AnimatePresence>
                    {isCategoryExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 pt-0 space-y-6">
                          {catQuestions.map((question) => {
                            const userAnswer = answers[question.id];
                            const isCorrect =
                              userAnswer === question.correctAnswerIndex;
                            const isExpanded = expandedQuestions.has(question.id);

                            return (
                              <Card
                                key={question.id}
                                className={`p-4 ${
                                  isCorrect
                                    ? "border-green-500/30 bg-green-500/5"
                                    : "border-red-500/30 bg-red-500/5"
                                }`}
                              >
                                <div className="flex items-start gap-3 mb-3">
                                  {isCorrect ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                                  ) : (
                                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-1" />
                                  )}
                                  <div className="flex-1">
                                    <p className="font-semibold mb-3">
                                      {question.text}
                                    </p>
                                    <div className="space-y-2 mb-3">
                                      {question.options.map((option, idx) => {
                                        const isUserAnswer = userAnswer === idx;
                                        const isCorrectAnswer =
                                          idx === question.correctAnswerIndex;
                                        return (
                                          <div
                                            key={idx}
                                            className={`p-2 rounded ${
                                              isCorrectAnswer
                                                ? "bg-green-500/20 border border-green-500/50"
                                                : isUserAnswer && !isCorrect
                                                ? "bg-red-500/20 border border-red-500/50"
                                                : "bg-muted/50"
                                            }`}
                                          >
                                            <span
                                              className={`font-medium ${
                                                isCorrectAnswer
                                                  ? "text-green-400"
                                                  : isUserAnswer && !isCorrect
                                                  ? "text-red-400"
                                                  : ""
                                              }`}
                                            >
                                              {isCorrectAnswer && "✓ "}
                                              {isUserAnswer && !isCorrect && "✗ "}
                                              {option.label}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                    <button
                                      onClick={() => toggleQuestion(question.id)}
                                      className="text-sm text-primary hover:underline flex items-center gap-1"
                                    >
                                      {isExpanded ? (
                                        <>
                                          Hide Explanation{" "}
                                          <ChevronUp className="h-4 w-4" />
                                        </>
                                      ) : (
                                        <>
                                          Show Explanation{" "}
                                          <ChevronDown className="h-4 w-4" />
                                        </>
                                      )}
                                    </button>
                                    <AnimatePresence>
                                      {isExpanded && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: "auto", opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{ duration: 0.3 }}
                                          className="overflow-hidden"
                                        >
                                          <div className="mt-3 p-3 bg-muted/50 rounded">
                                            <p className="text-sm text-foreground/90 mb-2">
                                              <strong>Explanation:</strong>
                                            </p>
                                            <p className="text-sm text-foreground/80 mb-2">
                                              {question.explanation}
                                            </p>
                                            {question.relatedSection && (
                                              <p className="text-xs text-muted-foreground">
                                                Related: {question.relatedSection}
                                              </p>
                                            )}
                                            {question.relatedTopics &&
                                              question.relatedTopics.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                  {question.relatedTopics.map(
                                                    (topic) => (
                                                      <span
                                                        key={topic}
                                                        className="text-xs px-2 py-1 bg-primary/10 text-primary rounded"
                                                      >
                                                        {topic}
                                                      </span>
                                                    )
                                                  )}
                                                </div>
                                              )}
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* Learning Recommendations */}
        {result.wrongAnswers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <Card className="p-8 bg-muted/50">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-foreground/60" />
              <h3 className="text-2xl font-bold mb-4 text-center">
                Recommended Reading
              </h3>
              <p className="text-muted-foreground mb-6 text-center max-w-2xl mx-auto">
                Review these sections from the Design Systems guide to strengthen
                your understanding:
              </p>
              {recommendedSections.length > 0 ? (
                <ul className="space-y-2 max-w-xl mx-auto">
                  {recommendedSections.map((section) => (
                    <li
                      key={section}
                      className="flex items-center gap-2 text-foreground/90"
                    >
                      <span className="text-primary">•</span>
                      {section}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-muted-foreground">
                  No specific sections recommended.
                </p>
              )}
              <div className="mt-6 text-center">
                <Button asChild size="lg">
                  <Link to="/blog">Read the Design Systems Guide</Link>
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Restart Button */}
        <div className="mt-12 text-center">
          <Button onClick={onRestart} variant="outline" size="lg">
            Take Quiz Again
          </Button>
        </div>
      </div>

      {/* Floating Action Button (FAB) for PDF Download */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={handleDownloadPDF}
          size="lg"
          className="rounded-full h-14 px-6 shadow-lg flex items-center gap-2 group"
          aria-label="Download Design Systems eBook"
        >
          <Download className="h-5 w-5 group-hover:animate-bounce" />
          <span className="hidden sm:inline">Download eBook</span>
        </Button>
      </motion.div>
    </div>
  );
});

export default LearningResultsPage;

