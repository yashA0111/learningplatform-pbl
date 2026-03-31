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
import { AlertCircle, Loader2 } from "lucide-react";

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
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm transition-all hover:scale-[1.02]">
            Submit a Course
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px] border-slate-200 dark:border-slate-800 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">Submit a Course</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Share a great resource with the community. All fields are validated for quality.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-sm font-semibold">Course Title</Label>
              <Input
                id="title"
                placeholder="e.g. Complete React Guide"
                {...register("title")}
                className={errors.title ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.title && <p className="text-xs font-medium text-red-500">{errors.title.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="url" className="text-sm font-semibold">URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://..."
                {...register("url")}
                className={errors.url ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.url && <p className="text-xs font-medium text-red-500">{errors.url.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="platform" className="text-sm font-semibold">Platform</Label>
              <Input
                id="platform"
                placeholder="e.g. Udemy, YouTube, Coursera"
                {...register("platform")}
                className={errors.platform ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.platform && <p className="text-xs font-medium text-red-500">{errors.platform.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tags" className="text-sm font-semibold">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="React, JavaScript, Frontend"
                {...register("tags")}
                className={errors.tags ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.tags ? (
                <p className="text-xs font-medium text-red-500">{errors.tags.message}</p>
              ) : (
                <p className="text-[10px] text-slate-400">At least 1 tag, max 10. Tags must be 1-30 chars.</p>
              )}
            </div>
          </div>
          
          {serverError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium">
              <AlertCircle className="h-4 w-4" />
              {serverError}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="hover:bg-slate-100 dark:hover:bg-slate-800">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : "Submit Course"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


