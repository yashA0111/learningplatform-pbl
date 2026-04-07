"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GradientBackgroundProps {
  children: ReactNode;
  className?: string;
  variant?: "auth" | "landing" | "subtle";
}

export function GradientBackground({ children, className = "", variant = "auth" }: GradientBackgroundProps) {
  return (
    <div className={`relative min-h-screen overflow-hidden ${className}`}>
      {/* Base gradient layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950" />

      {/* Animated blobs */}
      {variant !== "subtle" && (
        <>
          <motion.div
            className="absolute rounded-full blur-3xl opacity-30 dark:opacity-20"
            style={{
              background: "linear-gradient(135deg, oklch(0.7 0.18 264), oklch(0.7 0.18 295))",
              width: variant === "landing" ? "500px" : "350px",
              height: variant === "landing" ? "500px" : "350px",
              top: "10%",
              left: "15%",
            }}
            animate={{
              x: [0, 30, -20, 0],
              y: [0, -40, 20, 0],
              scale: [1, 1.08, 0.95, 1],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute rounded-full blur-3xl opacity-25 dark:opacity-15"
            style={{
              background: "linear-gradient(135deg, oklch(0.7 0.2 330), oklch(0.7 0.18 295))",
              width: variant === "landing" ? "450px" : "300px",
              height: variant === "landing" ? "450px" : "300px",
              bottom: "15%",
              right: "10%",
            }}
            animate={{
              x: [0, -25, 15, 0],
              y: [0, 30, -25, 0],
              scale: [1, 0.95, 1.1, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {variant === "landing" && (
            <motion.div
              className="absolute rounded-full blur-3xl opacity-20 dark:opacity-10"
              style={{
                background: "linear-gradient(135deg, oklch(0.75 0.15 200), oklch(0.7 0.2 264))",
                width: "380px",
                height: "380px",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
              animate={{
                x: [0, 20, -30, 0],
                y: [0, -20, 30, 0],
                scale: [1, 1.12, 0.92, 1],
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
        </>
      )}

      {/* Grid overlay for texture */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
