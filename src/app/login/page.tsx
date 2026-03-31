"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { loginSchema, LoginInput } from "@/lib/validations";
import { CheckCircle2, Loader2 } from "lucide-react";
import { FormError, FormAlert } from "@/components/ui/form-error";
import { cn } from "@/lib/utils";

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
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 selection:bg-indigo-500/30">
      <Card className="w-full max-w-md shadow-2xl border-slate-200 dark:border-slate-800 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80">
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="text-4xl font-black text-center tracking-tight text-slate-900 dark:text-white font-heading">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center text-base text-slate-500 dark:text-slate-400">
            Enter your email and password to access your account
          </CardDescription>
          {justVerified && (
            <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 mt-2 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg border border-emerald-100 dark:border-emerald-800 animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Email verified! Sign in now.</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
            </div>
            
            {(error || notVerified) && (
              <div className="space-y-3">
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
              </div>
            )}

            <Button className="w-full h-12 text-base font-bold transition-all hover:scale-[1.01] active:scale-[0.98] bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : "Sign In"}
            </Button>
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
    </div>
  );
}


export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

