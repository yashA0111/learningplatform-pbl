"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
  tagClassName = "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400",
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
      // Optional: show a toast error here
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
    <Card className="shadow-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50">
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
              className={`flex-1 ${error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            />
            <Button
              onClick={handleAdd}
              size="sm"
              disabled={isPending || !inputValue.trim()}
              className="shrink-0 bg-slate-900 dark:bg-slate-100 dark:text-slate-900"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
          {error && (
            <p className="text-xs font-medium text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {error}
            </p>
          )}
        </div>

        {items.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {items.map((item, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium transition-colors ${tagClassName}`}
              >
                {item}
                <button
                  onClick={() => handleRemove(item)}
                  className="ml-1 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  disabled={isPending}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
            <p className="text-sm text-slate-400 italic">None added yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

