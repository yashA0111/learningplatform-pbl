"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Loader2, AlertCircle } from "lucide-react";
import { tagSchema } from "@/lib/validations";

interface ManageListCardProps {
  title: string;
  description: string;
  items: string[];
  field: "interests" | "completedCourses";
  placeholder: string;
  titleClassName?: string;
  tagClassName?: string;
}

export function ManageListCard({
  title,
  description,
  items: initialItems,
  field,
  placeholder,
  titleClassName = "",
  tagClassName = "bg-indigo-50/80 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 ring-1 ring-inset ring-indigo-500/10",
}: ManageListCardProps) {
  const [items, setItems] = useState<string[]>(initialItems);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function updateServer(newItems: string[]) {
    const res = await fetch("/api/user/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: newItems }),
    });
    if (!res.ok) {
      console.error("Failed to update");
    }
  }

  function handleAdd() {
    setError(null);
    const value = inputValue.trim();
    
    if (!value) return;

    if (items.includes(value)) {
      setError("Already added");
      return;
    }

    // Validate with Zod
    const result = tagSchema.safeParse(value);
    if (!result.success) {
      setError(result.error.issues[0]?.message || "Invalid tag");
      return;
    }

    const newItems = [...items, result.data];
    setItems(newItems);
    setInputValue("");
    startTransition(async () => {
      await updateServer(newItems);
      router.refresh();
    });
  }

  function handleRemove(item: string) {
    const newItems = items.filter((i) => i !== item);
    setItems(newItems);
    startTransition(async () => {
      await updateServer(newItems);
      router.refresh();
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-all duration-300 border-slate-200/60 dark:border-slate-700/40 bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden h-full">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className={`text-lg sm:text-xl font-bold ${titleClassName}`}>{title}</CardTitle>
        <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={handleKeyDown}
              className={`flex-1 bg-white/50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/60 rounded-xl transition-all duration-300 focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-400 dark:focus:border-indigo-500 ${error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
            <Button
              onClick={handleAdd}
              size="sm"
              disabled={isPending || !inputValue.trim()}
              className="shrink-0 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-sm hover:shadow-md hover:shadow-indigo-500/15 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -5, height: 0 }}
                className="text-xs font-medium text-red-500 flex items-center gap-1"
              >
                <AlertCircle className="h-3 w-3" />
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {items.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.span
                  key={item}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors ${tagClassName}`}
                >
                  {item}
                  <button
                    onClick={() => handleRemove(item)}
                    className="ml-1 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 hover:scale-110 active:scale-90"
                    disabled={isPending}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-6 text-center border border-dashed border-slate-200/60 dark:border-slate-700/40 rounded-xl">
            <p className="text-sm text-slate-400 italic">None added yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
