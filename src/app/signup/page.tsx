"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { signupSchema, SignupInput } from "@/lib/validations";
import { Loader2, UserPlus } from "lucide-react";
import { FormError, FormAlert } from "@/components/ui/form-error";
import { cn } from "@/lib/utils";
import { GradientBackground } from "@/components/GradientBackground";

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

  const formFields = [
    { id: "name", label: "Full Name", type: "text", placeholder: "John Doe", error: errors.name },
    { id: "email", label: "Email", type: "email", placeholder: "yash@example.com", error: errors.email },
  ];

  return (
    <GradientBackground variant="auth">
      <div className="flex items-center justify-center min-h-screen py-12 px-4 selection:bg-indigo-500/30">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl glass-card rounded-2xl overflow-hidden">
            {/* Gradient accent top bar */}
            <div className="h-1.5 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />

            <CardHeader className="space-y-2 pb-6 pt-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25"
              >
                <UserPlus className="h-7 w-7 text-white" />
              </motion.div>
              <CardTitle className="text-3xl sm:text-4xl font-black text-center tracking-tight text-slate-900 dark:text-white font-heading">
                Create account
              </CardTitle>
              <CardDescription className="text-center text-base text-slate-500 dark:text-slate-400">
                Join the community and start learning today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {formFields.map((field, idx) => (
                  <motion.div
                    key={field.id}
                    className="space-y-1.5"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1, duration: 0.3 }}
                  >
                    <Label htmlFor={field.id} className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">{field.label}</Label>
                    <Input
                      id={field.id}
                      type={field.type}
                      placeholder={field.placeholder}
                      {...register(field.id as "name" | "email")}
                      className={cn(
                        "h-12 bg-white/50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/60 transition-all duration-300 focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-400 dark:focus:border-indigo-500 rounded-xl",
                        field.error && "border-red-500 focus-visible:ring-red-500 animate-shake"
                      )}
                    />
                    <FormError message={field.error?.message} />
                  </motion.div>
                ))}

                <motion.div
                  className="space-y-1.5"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register("password")}
                    className={cn(
                      "h-12 bg-white/50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/60 transition-all duration-300 focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-400 dark:focus:border-indigo-500 rounded-xl",
                      errors.password && "border-red-500 focus-visible:ring-red-500 animate-shake"
                    )}
                  />
                  <FormError message={errors.password?.message} />
                  {password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-2 gap-x-2 gap-y-1 mt-3 px-1"
                    >
                      {passwordChecks.map((check, i) => (
                        <motion.div
                          key={i}
                          className="flex items-center gap-2"
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05, duration: 0.2 }}
                        >
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full transition-all duration-500",
                            check.pass ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] scale-110" : "bg-slate-300 dark:bg-slate-600"
                          )} />
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-tight transition-colors duration-300",
                            check.pass ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"
                          )}>
                            {check.label}
                          </span>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
                
                <FormAlert message={error} />

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                >
                  <Button
                    className="w-full h-12 text-base font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30 rounded-xl"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : "Get Started"}
                  </Button>
                </motion.div>
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
        </motion.div>
      </div>
    </GradientBackground>
  );
}
