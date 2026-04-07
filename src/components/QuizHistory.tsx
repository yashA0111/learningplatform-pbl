"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Target,
  Clock,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Zap,
  Loader2,
  BarChart3,
  AlertCircle,
} from "lucide-react";

type QuizResultItem = {
  _id: string;
  courseName: string;
  score: number;
  totalQuestions: number;
  weakPoints: string[];
  dateTaken: string;
};

function getScoreColor(score: number, total: number) {
  const pct = (score / total) * 100;
  if (pct >= 80) return { bg: "from-emerald-500 to-teal-500", text: "text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-50/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-emerald-500/15" };
  if (pct >= 60) return { bg: "from-amber-500 to-orange-500", text: "text-amber-600 dark:text-amber-400", badge: "bg-amber-50/80 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 ring-amber-500/15" };
  return { bg: "from-rose-500 to-red-500", text: "text-rose-600 dark:text-rose-400", badge: "bg-rose-50/80 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 ring-rose-500/15" };
}

function getScoreLabel(score: number, total: number) {
  const pct = (score / total) * 100;
  if (pct === 100) return "Perfect";
  if (pct >= 80) return "Excellent";
  if (pct >= 60) return "Good";
  if (pct >= 40) return "Fair";
  return "Needs Work";
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHrs = diffMs / (1000 * 60 * 60);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffHrs < 1) return "Just now";
  if (diffHrs < 24) return `${Math.floor(diffHrs)}h ago`;
  if (diffDays < 7) return `${Math.floor(diffDays)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined });
}

export function QuizHistory() {
  const [results, setResults] = useState<QuizResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("/api/quiz/history");
        const data = await res.json();
        if (data.results) {
          setResults(data.results);
        }
      } catch {
        setError("Could not load quiz history.");
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Stats
  const totalQuizzes = results.length;
  const avgScore =
    totalQuizzes > 0
      ? Math.round(
          (results.reduce((sum, r) => sum + (r.score / r.totalQuestions) * 100, 0) / totalQuizzes)
        )
      : 0;
  const perfectScores = results.filter((r) => r.score === r.totalQuestions).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Card className="border-slate-200/60 dark:border-slate-700/40 bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm shadow-sm rounded-2xl overflow-hidden">
        {/* Header */}
        <CardHeader className="pb-3 relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md shadow-violet-500/20">
                <BarChart3 className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-violet-700 dark:text-violet-400">
                  Quiz History
                </CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Track your diagnostic quiz performance
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="h-8 w-8 p-0 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20"
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4 text-slate-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-500" />
              )}
            </Button>
          </div>
        </CardHeader>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <CardContent className="pt-0 space-y-5">
                {/* Loading */}
                {loading && (
                  <div className="flex items-center justify-center py-10 space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin text-violet-600" />
                    <span className="text-sm text-slate-500 font-medium">Loading history...</span>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 py-6 justify-center text-rose-500">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                )}

                {/* Empty */}
                {!loading && !error && results.length === 0 && (
                  <div className="text-center py-10 space-y-3">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 dark:bg-violet-900/20 mx-auto">
                      <Zap className="h-7 w-7 text-violet-400" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                      No quizzes taken yet
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Take a diagnostic quiz on any course to see your results here.
                    </p>
                  </div>
                )}

                {/* Stats row */}
                {!loading && results.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="flex flex-col items-center p-3 rounded-xl bg-gradient-to-br from-violet-50/80 to-purple-50/60 dark:from-violet-950/30 dark:to-purple-950/20 ring-1 ring-inset ring-violet-500/10"
                    >
                      <span className="text-2xl font-extrabold text-violet-700 dark:text-violet-300">
                        {totalQuizzes}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-500/80 mt-0.5">
                        Quizzes
                      </span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15 }}
                      className="flex flex-col items-center p-3 rounded-xl bg-gradient-to-br from-indigo-50/80 to-blue-50/60 dark:from-indigo-950/30 dark:to-blue-950/20 ring-1 ring-inset ring-indigo-500/10"
                    >
                      <span className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-300">
                        {avgScore}%
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-500/80 mt-0.5">
                        Avg Score
                      </span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="flex flex-col items-center p-3 rounded-xl bg-gradient-to-br from-amber-50/80 to-yellow-50/60 dark:from-amber-950/30 dark:to-yellow-950/20 ring-1 ring-inset ring-amber-500/10"
                    >
                      <span className="text-2xl font-extrabold text-amber-700 dark:text-amber-300">
                        {perfectScores}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-500/80 mt-0.5">
                        Perfect
                      </span>
                    </motion.div>
                  </div>
                )}

                {/* Results list */}
                {!loading && results.length > 0 && (
                  <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                    {results.map((result, idx) => {
                      const colors = getScoreColor(result.score, result.totalQuestions);
                      const label = getScoreLabel(result.score, result.totalQuestions);
                      const isItemExpanded = expandedItems.has(result._id);
                      const pct = Math.round((result.score / result.totalQuestions) * 100);

                      return (
                        <motion.div
                          key={result._id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 * idx, duration: 0.3 }}
                        >
                          <div
                            className="group rounded-xl border border-slate-200/70 dark:border-slate-700/40 bg-white/80 dark:bg-slate-800/60 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
                            onClick={() => toggleItem(result._id)}
                          >
                            {/* Main row */}
                            <div className="flex items-center gap-3 p-3.5">
                              {/* Score circle */}
                              <div className="relative flex-shrink-0">
                                <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center shadow-sm`}>
                                  {result.score === result.totalQuestions ? (
                                    <Trophy className="h-5 w-5 text-white" />
                                  ) : (
                                    <span className="text-sm font-bold text-white">{pct}%</span>
                                  )}
                                </div>
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                  {result.courseName}
                                </h4>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg ring-1 ring-inset ${colors.badge}`}>
                                    {label}
                                  </span>
                                  <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    {result.score}/{result.totalQuestions}
                                  </span>
                                  <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatDate(result.dateTaken)}
                                  </span>
                                </div>
                              </div>

                              {/* Expand indicator */}
                              <div className="flex-shrink-0">
                                {result.weakPoints.length > 0 && (
                                  <ChevronDown
                                    className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                                      isItemExpanded ? "rotate-180" : ""
                                    }`}
                                  />
                                )}
                              </div>
                            </div>

                            {/* Expanded weak points */}
                            <AnimatePresence>
                              {isItemExpanded && result.weakPoints.length > 0 && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="border-t border-slate-100 dark:border-slate-700/30"
                                >
                                  <div className="px-3.5 py-3 bg-slate-50/50 dark:bg-slate-800/30">
                                    <div className="flex items-center gap-1.5 mb-2">
                                      <Target className="h-3 w-3 text-rose-500" />
                                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                                        Knowledge Gaps
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {result.weakPoints.map((wp) => (
                                        <span
                                          key={wp}
                                          className="text-[10px] px-2.5 py-1 rounded-lg bg-rose-50/80 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 font-medium ring-1 ring-inset ring-rose-500/15"
                                        >
                                          {wp}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
