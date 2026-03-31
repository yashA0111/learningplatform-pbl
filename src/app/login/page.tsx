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
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

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
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200 dark:border-slate-800">
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="text-3xl font-extrabold text-center tracking-tight text-slate-900 dark:text-white">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center text-base text-slate-500 dark:text-slate-400">
            Enter your email and password to access your account
          </CardDescription>
          {justVerified && (
            <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 mt-2">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-semibold">Email verified! You can now sign in.</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register("email")}
                className={`h-11 ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              />
              {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className={`h-11 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              />
              {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>}
            </div>
            
            {error && (
              <div className="space-y-3">
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
                {notVerified && emailValue && (
                  <Link
                    href={`/verify-email?email=${encodeURIComponent(emailValue)}`}
                    className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 pl-1"
                  >
                    <span>→ Verify your email now</span>
                  </Link>
                )}
              </div>
            )}

            <Button className="w-full h-11 text-base font-semibold transition-all hover:scale-[1.02] bg-indigo-600 hover:bg-indigo-700 text-white" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center pt-2 pb-6">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-indigo-600 font-semibold hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
              Sign up
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

