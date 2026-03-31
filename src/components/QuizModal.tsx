"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

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
            className="mt-3 w-full font-semibold rounded-xl relative z-10 bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:hover:bg-indigo-900/60 dark:text-indigo-300 active:scale-[0.97] transition-all shadow-sm hover:shadow"
            onClick={(e) => e.stopPropagation()}
          />
        }
      >
        Test Your Knowledge
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg w-[95vw] fixed z-50 max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>Diagnostic Quiz: {courseName}</DialogTitle>
          <DialogDescription>
            {isFinished 
              ? "Your results and personalized path forward." 
              : "Answer these auto-generated questions to test your core understanding."}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-4" />
            <p className="text-sm text-slate-500">Generating questions with AI...</p>
          </div>
        )}

        {!loading && !isFinished && questions.length > 0 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-slate-500">
                <span>Question {currentIndex + 1} of {questions.length}</span>
                <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full ring-1 ring-inset ring-indigo-500/20">
                  {questions[currentIndex].conceptTested}
                </span>
              </div>
              <h3 className="text-lg font-medium">{questions[currentIndex].question}</h3>
            </div>
            
            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} className="space-y-3">
              {questions[currentIndex].options.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                return (
                  <div 
                    key={idx} 
                    className={`flex items-center space-x-3 p-3 rounded-xl border-2 transition-all cursor-pointer active:scale-[0.99] ${
                      isSelected 
                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/30 dark:border-indigo-500 shadow-sm" 
                        : "border-slate-200 hover:border-indigo-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-indigo-800/50 dark:hover:bg-slate-800/50"
                    }`}
                    onClick={() => setSelectedAnswer(option)}
                  >
                    <RadioGroupItem 
                      value={option} 
                      id={`option-${idx}`} 
                      className={isSelected ? "border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400" : ""} 
                    />
                    <Label 
                      htmlFor={`option-${idx}`} 
                      className={`text-sm cursor-pointer capitalize-first flex-1 leading-relaxed ${
                        isSelected ? "font-medium text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {option}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
            
            <div className="flex justify-end pt-4">
              <Button disabled={!selectedAnswer} onClick={handleNext}>
                {currentIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}
              </Button>
            </div>
          </div>
        )}

        {isFinished && (
          <div className="space-y-6">
            <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4 ring-8 ring-slate-50 dark:ring-slate-800/50">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">{score}/{questions.length}</span>
              </div>
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                {score === questions.length ? "Perfect Score!" : "Quiz Completed"}
              </h3>
            </div>

            {weakPoints.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 block"></span>
                  Gaps Identified
                </h4>
                <div className="flex flex-wrap gap-2 mb-6">
                  {weakPoints.map(wp => (
                    <span key={wp} className="text-xs px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 font-medium ring-1 ring-inset ring-rose-600/10">
                      {wp}
                    </span>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 block"></span>
                    Recommended to close your Skill Gap
                  </h4>
                  
                  {remedialLoading ? (
                    <div className="flex items-center justify-center py-6 space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                      <span className="text-sm text-slate-500">Finding targeted resources...</span>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {remedialCourses.map(rc => (
                        <a key={rc.id} href={rc.url} target="_blank" rel="noopener noreferrer" className="block outline-none ring-offset-background transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl group">
                          <Card className="border-emerald-100 dark:border-emerald-900/30 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-900 shadow-sm group-hover:shadow-md transition-shadow">
                            <CardHeader className="p-4 pb-2">
                              <div className="flex justify-between items-start gap-2">
                                <CardTitle className="text-base font-semibold text-emerald-950 dark:text-emerald-100 line-clamp-2">{rc.title}</CardTitle>
                                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100/50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">{rc.platform}</span>
                              </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {rc.tags.map(tag => (
                                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700">{tag}</span>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {weakPoints.length === 0 && (
              <p className="text-center text-sm text-slate-500 py-4">
                You have an excellent grasp of all core concepts in this course!
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
