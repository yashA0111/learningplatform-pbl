"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { loginSchema, LoginInput } from "@/lib/validations";
import { CheckCircle2, Loader2, LogIn } from "lucide-react";
import { FormError, FormAlert } from "@/components/ui/form-error";
import { cn } from "@/lib/utils";
import { GradientBackground } from "@/components/GradientBackground";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justVerified = searchParams.get("verified") === "true";

  const [error, setError] = useState("");
  const [notVerified, setNotVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const emailValue = watch("email");

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    setError("");
    setNotVerified(false);

    const res = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (res?.error) {
      if (res.error === "EMAIL_NOT_VERIFIED") {
        setNotVerified(true);
        setError("Your email is not verified yet.");
      } else {
        setError("Invalid email or password");
      }
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

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
            <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

            <CardHeader className="space-y-2 pb-6 pt-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25"
              >
                <LogIn className="h-7 w-7 text-white" />
              </motion.div>
              <CardTitle className="text-3xl sm:text-4xl font-black text-center tracking-tight text-slate-900 dark:text-white font-heading">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-center text-base text-slate-500 dark:text-slate-400">
                Enter your email and password to access your account
              </CardDescription>
              {justVerified && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 mt-2 bg-emerald-50/80 dark:bg-emerald-900/20 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-800 backdrop-blur-sm"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Email verified! Sign in now.</span>
                </motion.div>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <motion.div
                  className="space-y-1.5"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="yash@example.com"
                    {...register("email")}
                    className={cn(
                      "h-12 bg-white/50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/60 transition-all duration-300 focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-400 dark:focus:border-indigo-500 rounded-xl",
                      errors.email && "border-red-500 focus-visible:ring-red-500 animate-shake"
                    )}
                  />
                  <FormError message={errors.email?.message} />
                </motion.div>
                <motion.div
                  className="space-y-1.5"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
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
                </motion.div>
                
                {(error || notVerified) && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <FormAlert message={error} />
                    {notVerified && emailValue && (
                      <Link
                        href={`/verify-email?email=${encodeURIComponent(emailValue)}`}
                        className="text-sm text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center justify-center gap-1 group"
                      >
                        <span>Verify your email now</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </Link>
                    )}
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  <Button
                    className="w-full h-12 text-base font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 rounded-xl"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Authenticating...
                      </>
                    ) : "Sign In"}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center pt-2 pb-8">
              <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-indigo-600 font-bold hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
                  Create one
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </GradientBackground>
  );
}


export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
