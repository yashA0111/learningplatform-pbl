"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { signupSchema, SignupInput } from "@/lib/validations";
import { Loader2 } from "lucide-react";
import { FormError, FormAlert } from "@/components/ui/form-error";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const password = watch("password", "");

  const onSubmit = async (data: SignupInput) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
      } else {
        setError(result.message || "Something went wrong");
      }
    } catch {
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Password strength hints
  const passwordChecks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Lowercase letter", pass: /[a-z]/.test(password) },
    { label: "Number", pass: /\d/.test(password) },
    { label: "Special character", pass: /[@$!%*?&#^()\-_=+]/.test(password) },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 selection:bg-indigo-500/30">
      <Card className="w-full max-w-md shadow-2xl border-slate-200 dark:border-slate-800 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80">
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="text-4xl font-black text-center tracking-tight text-slate-900 dark:text-white font-heading">
            Create account
          </CardTitle>
          <CardDescription className="text-center text-base text-slate-500 dark:text-slate-400">
            Join the community and start learning today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                {...register("name")}
                className={cn(
                  "h-12 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 transition-all focus:ring-4 focus:ring-indigo-500/10",
                  errors.name && "border-red-500 focus-visible:ring-red-500 animate-shake"
                )}
              />
              <FormError message={errors.name?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="yash@example.com"
                {...register("email")}
                className={cn(
                  "h-12 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 transition-all focus:ring-4 focus:ring-indigo-500/10",
                  errors.email && "border-red-500 focus-visible:ring-red-500 animate-shake"
                )}
              />
              <FormError message={errors.email?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className={cn(
                  "h-12 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 transition-all focus:ring-4 focus:ring-indigo-500/10",
                  errors.password && "border-red-500 focus-visible:ring-red-500 animate-shake"
                )}
              />
              <FormError message={errors.password?.message} />
              {password.length > 0 && (
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-3 px-1">
                  {passwordChecks.map((check, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full transition-colors duration-300",
                        check.pass ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300 dark:bg-slate-600"
                      )} />
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-tight transition-colors duration-300",
                        check.pass ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"
                      )}>
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <FormAlert message={error} />

            <Button className="w-full h-12 text-base font-bold transition-all hover:scale-[1.01] active:scale-[0.98] bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : "Get Started"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center pt-2 pb-8">
          <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 font-bold hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}


