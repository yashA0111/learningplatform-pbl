"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Zap, Trophy, Target, ChevronRight, Book } from "lucide-react";

type Question = {
  question: string;
  options: string[];
  correctAnswer: string;
  conceptTested: string;
};

type RemedialCourse = {
  id: string;
  title: string;
  platform: string;
  url: string;
  tags: string[];
};

export function QuizModal({ courseName, courseTags }: { courseName: string, courseTags?: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  
  const [score, setScore] = useState(0);
  const [weakPoints, setWeakPoints] = useState<string[]>([]);
  
  const [remedialLoading, setRemedialLoading] = useState(false);
  const [remedialCourses, setRemedialCourses] = useState<RemedialCourse[]>([]);

  const startQuiz = async () => {
    setLoading(true);
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setWeakPoints([]);
    setIsFinished(false);
    setSelectedAnswer("");
    setRemedialCourses([]);
    
    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseName, courseTags }),
      });
      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    const currentQ = questions[currentIndex];
    const isCorrect = selectedAnswer === currentQ.correctAnswer;
    
    if (isCorrect) {
      setScore(s => s + 1);
    } else {
      setWeakPoints(prev => {
        if (!prev.includes(currentQ.conceptTested)) {
          return [...prev, currentQ.conceptTested];
        }
        return prev;
      });
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer("");
    } else {
      finishQuiz(isCorrect ? [...weakPoints] : [...weakPoints, !weakPoints.includes(currentQ.conceptTested) ? currentQ.conceptTested : ""].filter(Boolean));
    }
  };

  const finishQuiz = async (finalWeakPoints: string[]) => {
    setIsFinished(true);

    // Calculate final score (current score + whether last question was correct)
    const lastQ = questions[currentIndex];
    const lastCorrect = selectedAnswer === lastQ.correctAnswer;
    const finalScore = score + (lastCorrect ? 1 : 0);

    // Persist quiz result
    try {
      await fetch("/api/quiz/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseName,
          score: finalScore,
          totalQuestions: questions.length,
          weakPoints: finalWeakPoints,
        }),
      });
    } catch (err) {
      console.error("Failed to save quiz result:", err);
    }

    if (finalWeakPoints.length > 0) {
      setRemedialLoading(true);
      try {
        const res = await fetch("/api/recommend/remedial", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weakPoints: finalWeakPoints, courseName }),
        });
        const data = await res.json();
        if (data.recommendations) {
          setRemedialCourses(data.recommendations);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setRemedialLoading(false);
      }
    }
  };

  const progressPercentage = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (open && questions.length === 0 && !loading) {
        startQuiz();
      }
    }}>
      <DialogTrigger 
        render={
          <Button 
            variant="secondary" 
            size="sm" 
            className="mt-3 w-full font-semibold rounded-xl relative z-10 bg-gradient-to-r from-indigo-50/80 to-violet-50/80 text-indigo-700 hover:from-indigo-100/90 hover:to-violet-100/90 dark:from-indigo-900/40 dark:to-violet-900/40 dark:hover:from-indigo-900/60 dark:hover:to-violet-900/60 dark:text-indigo-300 active:scale-[0.97] transition-all duration-200 shadow-sm hover:shadow ring-1 ring-inset ring-indigo-500/10"
            onClick={(e) => e.stopPropagation()}
          />
        }
      >
        <Zap className="h-3.5 w-3.5 mr-1.5" />
        Test Your Knowledge
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg w-[95vw] fixed z-50 max-h-[90vh] overflow-y-auto rounded-2xl border-slate-200/60 dark:border-slate-700/40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/20">
              <Zap className="h-4 w-4 text-white" />
            </span>
            {courseName}
          </DialogTitle>
          <DialogDescription>
            {isFinished 
              ? "Your results and personalized path forward." 
              : "Answer these auto-generated questions to test your core understanding."}
          </DialogDescription>
        </DialogHeader>

        {/* Loading state */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-10"
            >
              <div className="relative">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                <div className="absolute inset-0 h-10 w-10 rounded-full animate-glow-pulse" />
              </div>
              <p className="text-sm text-slate-500 mt-4 font-medium">Generating questions with AI...</p>
            </motion.div>
          )}

          {/* Question state */}
          {!loading && !isFinished && questions.length > 0 && (
            <motion.div
              key={`question-${currentIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="space-y-5"
            >
              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-slate-500">
                  <span>Question {currentIndex + 1} of {questions.length}</span>
                  <span className="text-indigo-600 bg-indigo-50/80 dark:bg-indigo-900/30 px-2 py-0.5 rounded-lg ring-1 ring-inset ring-indigo-500/15 text-[10px] font-bold uppercase tracking-wider">
                    {questions[currentIndex].conceptTested}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white pt-1">{questions[currentIndex].question}</h3>
              </div>
              
              <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} className="space-y-2.5">
                {questions[currentIndex].options.map((option, idx) => {
                  const isSelected = selectedAnswer === option;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.06, duration: 0.25 }}
                    >
                      <div 
                        className={`flex items-center space-x-3 p-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer active:scale-[0.99] ${
                          isSelected 
                            ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-900/25 shadow-sm shadow-indigo-500/10" 
                            : "border-slate-200/80 hover:border-indigo-200 hover:bg-slate-50/80 dark:border-slate-700/50 dark:hover:border-indigo-800/40 dark:hover:bg-slate-800/40"
                        }`}
                        onClick={() => setSelectedAnswer(option)}
                      >
                        <RadioGroupItem 
                          value={option} 
                          id={`option-${idx}`} 
                          className={isSelected ? "border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400" : ""} 
                        />
                        <Label 
                          htmlFor={`option-${idx}`} 
                          className={`text-sm cursor-pointer capitalize-first flex-1 leading-relaxed ${
                            isSelected ? "font-semibold text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          {option}
                        </Label>
                      </div>
                    </motion.div>
                  );
                })}
              </RadioGroup>
              
              <div className="flex justify-end pt-3">
                <Button
                  disabled={!selectedAnswer}
                  onClick={handleNext}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 rounded-xl hover:scale-[1.02] active:scale-[0.98] px-6"
                >
                  {currentIndex === questions.length - 1 ? "Finish Quiz" : "Next"}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Results state */}
          {isFinished && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="text-center pb-5 border-b border-slate-100 dark:border-slate-800">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.15 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 mb-4 shadow-lg shadow-indigo-500/25"
                >
                  {score === questions.length ? (
                    <Trophy className="h-9 w-9 text-white" />
                  ) : (
                    <span className="text-2xl font-bold text-white">{score}/{questions.length}</span>
                  )}
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl font-bold gradient-text"
                >
                  {score === questions.length ? "Perfect Score! 🎉" : "Quiz Completed"}
                </motion.h3>
              </div>

              {weakPoints.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h4 className="font-semibold text-sm mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-rose-400 to-red-500 shadow-sm">
                      <Target className="h-3 w-3 text-white" />
                    </span>
                    Gaps Identified
                  </h4>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {weakPoints.map((wp, idx) => (
                      <motion.span
                        key={wp}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.45 + idx * 0.06 }}
                        className="text-xs px-3 py-1.5 rounded-xl bg-rose-50/80 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 font-medium ring-1 ring-inset ring-rose-500/15"
                      >
                        {wp}
                      </motion.span>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm">
                        <Book className="h-3 w-3 text-white" />
                      </span>
                      Recommended to close your Skill Gap
                    </h4>
                    
                    {remedialLoading ? (
                      <div className="flex items-center justify-center py-6 space-x-2">
                        <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                        <span className="text-sm text-slate-500 font-medium">Finding targeted resources...</span>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {remedialCourses.map((rc, idx) => (
                          <motion.a
                            key={rc.id}
                            href={rc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + idx * 0.08 }}
                            className="block outline-none ring-offset-background transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl group"
                          >
                            <Card className="border-emerald-200/60 dark:border-emerald-900/30 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-900 shadow-sm group-hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden group-hover:scale-[1.01]">
                              <CardHeader className="p-4 pb-2">
                                <div className="flex justify-between items-start gap-2">
                                  <CardTitle className="text-base font-semibold text-emerald-950 dark:text-emerald-100 line-clamp-2">{rc.title}</CardTitle>
                                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100/50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-lg">{rc.platform}</span>
                                </div>
                              </CardHeader>
                              <CardContent className="p-4 pt-0">
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {rc.tags.map(tag => (
                                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700">{tag}</span>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.a>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
              
              {weakPoints.length === 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-center text-sm text-slate-500 py-4"
                >
                  You have an excellent grasp of all core concepts in this course!
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
