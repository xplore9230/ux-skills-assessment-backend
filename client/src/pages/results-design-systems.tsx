import { memo, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Trophy, BookOpen, Target, Download } from "lucide-react";
import type { CategoryScore, ImprovementWeek } from "@/types";
import { Link } from "react-router-dom";

interface DesignSystemsResultsPageProps {
  stage: string;
  totalScore: number;
  maxScore: number;
  summary: string;
  categories: CategoryScore[];
  improvementPlan: ImprovementWeek[];
  onRestart: () => void;
}

const DesignSystemsResultsPage = memo(function DesignSystemsResultsPage({
  stage,
  totalScore,
  maxScore,
  summary,
  categories,
  improvementPlan,
  onRestart,
}: DesignSystemsResultsPageProps) {
  const percentage = Math.round((totalScore / maxScore) * 100);

  // Category status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "strong":
        return "text-green-400";
      case "decent":
        return "text-yellow-400";
      case "needs-work":
        return "text-orange-400";
      default:
        return "text-muted-foreground";
    }
  };

  // Stage badge colors
  const getStageColor = (stageName: string) => {
    switch (stageName.toLowerCase()) {
      case "expert":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "advanced":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "practitioner":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "beginner":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-muted text-foreground border-border";
    }
  };

  const handleDownloadPDF = () => {
    const link = document.createElement('a');
    link.href = '/design-systems-ebook.pdf';
    link.download = 'Design-Systems-Complete-Guide.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background relative pb-24">
      <div className="container mx-auto px-6 py-12">
        {/* Header with Back Button */}
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
          
          <div className="mb-4">
            <span className={`inline-block px-4 py-2 rounded-full border text-sm font-semibold ${getStageColor(stage)}`}>
              {stage} Level
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            {totalScore}/{maxScore}
          </h1>
          
          <p className="text-2xl md:text-3xl text-muted-foreground mb-6">
            Design Systems Knowledge
          </p>

          <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
            {summary}
          </p>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold mb-6">Category Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card key={category.name} className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                  <span className={`text-sm font-semibold ${getStatusColor(category.status)}`}>
                    {category.score}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mb-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${category.score}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground capitalize">
                  {category.status.replace("-", " ")}
                </p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Improvement Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <Target className="h-6 w-6" />
            <h2 className="text-3xl font-bold">Your 4-Week Improvement Plan</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {improvementPlan.map((week) => (
              <Card key={week.week} className="p-6">
                <h3 className="text-xl font-semibold mb-4">Week {week.week}</h3>
                <ul className="space-y-2">
                  {week.tasks.map((task, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-1">•</span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Learn More Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <Card className="p-8 bg-muted/50">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-foreground/60" />
            <h3 className="text-2xl font-bold mb-4">Deepen Your Knowledge</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Read our comprehensive Design Systems guide to learn more about foundations, tokens, components, patterns, and governance.
            </p>
            <Button asChild size="lg">
              <Link to="/blog">
                Read the Design Systems Guide
              </Link>
            </Button>
          </Card>
        </motion.div>

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
        transition={{ duration: 0.3, delay: 0.8 }}
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

export default DesignSystemsResultsPage;

