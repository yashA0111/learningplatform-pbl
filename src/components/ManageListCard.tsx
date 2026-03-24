"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Loader2 } from "lucide-react";

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
    const value = inputValue.trim();
    if (!value || items.includes(value)) {
      setInputValue("");
      return;
    }
    const newItems = [...items, value];
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
    <Card className="shadow-md border-slate-200 dark:border-slate-800">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className={`text-lg sm:text-xl ${titleClassName}`}>{title}</CardTitle>
        <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button
            onClick={handleAdd}
            size="sm"
            disabled={isPending || !inputValue.trim()}
            className="shrink-0"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>

        {items.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {items.map((item, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${tagClassName}`}
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
          <p className="text-sm text-slate-500 italic">None added yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
