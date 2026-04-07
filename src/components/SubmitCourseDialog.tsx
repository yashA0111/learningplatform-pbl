"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
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
import { Loader2, Plus, Upload } from "lucide-react";
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

  const formFields = [
    { id: "title", label: "Course Title", type: "text", placeholder: "e.g. Complete React Guide 2024" },
    { id: "url", label: "URL", type: "url", placeholder: "https://udemy.com/course/..." },
    { id: "platform", label: "Platform", type: "text", placeholder: "e.g. Udemy, YouTube, Coursera" },
  ];

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
          <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Submit a Course
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[450px] border-slate-200/60 dark:border-slate-700/40 shadow-2xl backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 rounded-2xl overflow-hidden">
        {/* Gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
        
        <DialogHeader className="space-y-3 pt-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25"
          >
            <Upload className="h-6 w-6 text-white" />
          </motion.div>
          <DialogTitle className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading tracking-tight text-center">Submit Course</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed text-center">
            Share a high-quality resource with the community.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
          <div className="grid gap-5 py-4">
            {formFields.map((field, idx) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + idx * 0.08, duration: 0.25 }}
                className="grid gap-1.5"
              >
                <Label htmlFor={field.id} className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">{field.label}</Label>
                <Input
                  id={field.id}
                  type={field.type}
                  placeholder={field.placeholder}
                  {...register(field.id as "title" | "url" | "platform")}
                  className={cn(
                    "h-11 bg-white/50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/60 transition-all duration-300 focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-400 dark:focus:border-indigo-500 rounded-xl",
                    errors[field.id as keyof typeof errors] && "border-red-500 focus-visible:ring-red-500 animate-shake"
                  )}
                />
                <FormError message={(errors[field.id as keyof typeof errors] as { message?: string } | undefined)?.message} />
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.34, duration: 0.25 }}
              className="grid gap-1.5"
            >
              <Label htmlFor="tags" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="React, JavaScript, Frontend"
                {...register("tags")}
                className={cn(
                  "h-11 bg-white/50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/60 transition-all duration-300 focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-400 dark:focus:border-indigo-500 rounded-xl",
                  errors.tags && "border-red-500 focus-visible:ring-red-500 animate-shake"
                )}
              />
              {errors.tags ? (
                <FormError message={errors.tags.message} />
              ) : (
                <p className="text-[10px] text-slate-400 font-medium ml-1">Example: React, Tailwind, Next.js (Min 1, Max 10)</p>
              )}
            </motion.div>
          </div>
          
          <FormAlert message={serverError} className="mb-4" />

          <DialogFooter className="gap-3 sm:gap-2 pt-2 pb-1">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors rounded-xl">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] px-6 rounded-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Publish Course
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
