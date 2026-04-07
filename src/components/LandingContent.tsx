"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GradientBackground } from "@/components/GradientBackground";
import { Sparkles, ArrowRight, Book, Brain, Users } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Recommendations",
    description: "Smart course matching using Jaccard similarity analysis",
    gradient: "from-indigo-500 to-violet-500",
  },
  {
    icon: Book,
    title: "Diagnostic Quizzes",
    description: "Test your knowledge and identify skill gaps instantly",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Users,
    title: "Community Courses",
    description: "Discover and share resources with fellow learners",
    gradient: "from-purple-500 to-pink-500",
  },
];

export function LandingContent() {
  return (
    <GradientBackground variant="landing">
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="max-w-4xl text-center space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100/80 dark:bg-indigo-900/40 px-4 py-1.5 text-sm font-semibold text-indigo-700 dark:text-indigo-300 ring-1 ring-inset ring-indigo-200 dark:ring-indigo-700/40 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Powered by AI & Smart Algorithms
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            Learn Smarter with{" "}
            <span className="gradient-text">LearnPath</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            Track your interests, get personalized course recommendations, and close your skill gaps — all in one place.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Link href="/signup">
              <Button
                size="lg"
                className="h-13 px-8 text-lg w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-105 active:scale-[0.98] rounded-xl group"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="h-13 px-8 text-lg w-full sm:w-auto font-bold border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all duration-300 rounded-xl"
              >
                Sign In
              </Button>
            </Link>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-12 sm:pt-16 max-w-3xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.12, delayChildren: 0.7 } },
            }}
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                className="group relative p-5 sm:p-6 rounded-2xl bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/40 text-left card-hover-glow"
                variants={{
                  hidden: { opacity: 0, y: 24, scale: 0.96 },
                  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
                }}
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4 shadow-md`}>
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1.5 text-sm sm:text-base">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </GradientBackground>
  );
}
