"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { courseFormSchema, CourseFormInput, CourseFormOutput } from "@/lib/validations";
import { Loader2 } from "lucide-react";
import { FormError, FormAlert } from "@/components/ui/form-error";
import { cn } from "@/lib/utils";

export function SubmitCourseDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CourseFormInput>({
    resolver: zodResolver(courseFormSchema) as unknown as Resolver<CourseFormInput>,
    defaultValues: {
      title: "",
      url: "",
      platform: "",
      tags: "",
    },
  });

  const onSubmit = async (data: CourseFormInput) => {
    // The resolver has already transformed the data, the type cast is safe
    const validatedData = data as unknown as CourseFormOutput;
    
    setLoading(true);
    setServerError("");

    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedData),
      });

      if (res.ok) {
        setOpen(false);
        reset();
        router.refresh();
      } else {
        const result = await res.json();
        setServerError(result.message || "Failed to submit course");
      }
    } catch (error) {
      console.error(error);
      setServerError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) {
        reset();
        setServerError("");
      }
    }}>
      <DialogTrigger
        render={
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
            Submit a Course
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[450px] border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-md bg-white/90 dark:bg-slate-900/90">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-3xl font-black text-slate-900 dark:text-white font-heading tracking-tight">Submit Course</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
            Share a high-quality resource with the community. Our engine will analyze it for student relevance.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
          <div className="grid gap-5 py-4">
            <div className="grid gap-1.5">
              <Label htmlFor="title" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Course Title</Label>
              <Input
                id="title"
                placeholder="e.g. Complete React Guide 2024"
                {...register("title")}
                className={cn(
                  "h-11 bg-slate-50/50 dark:bg-slate-900/50 transition-all",
                  errors.title && "border-red-500 focus-visible:ring-red-500 animate-shake"
                )}
              />
              <FormError message={errors.title?.message} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="url" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://udemy.com/course/..."
                {...register("url")}
                className={cn(
                  "h-11 bg-slate-50/50 dark:bg-slate-900/50 transition-all",
                  errors.url && "border-red-500 focus-visible:ring-red-500 animate-shake"
                )}
              />
              <FormError message={errors.url?.message} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="platform" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Platform</Label>
              <Input
                id="platform"
                placeholder="e.g. Udemy, YouTube, Coursera"
                {...register("platform")}
                className={cn(
                  "h-11 bg-slate-50/50 dark:bg-slate-900/50 transition-all",
                  errors.platform && "border-red-500 focus-visible:ring-red-500 animate-shake"
                )}
              />
              <FormError message={errors.platform?.message} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="tags" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="React, JavaScript, Frontend"
                {...register("tags")}
                className={cn(
                  "h-11 bg-slate-50/50 dark:bg-slate-900/50 transition-all",
                  errors.tags && "border-red-500 focus-visible:ring-red-500 animate-shake"
                )}
              />
              {errors.tags ? (
                <FormError message={errors.tags.message} />
              ) : (
                <p className="text-[10px] text-slate-400 font-medium ml-1">Example: React, Tailwind, Next.js (Min 1, Max 10)</p>
              )}
            </div>
          </div>
          
          <FormAlert message={serverError} className="mb-4" />

          <DialogFooter className="gap-3 sm:gap-2 pt-2 pb-1">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] px-6">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : "Publish Course"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}



