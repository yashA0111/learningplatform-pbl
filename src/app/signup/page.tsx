"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { signupSchema } from "@/lib/validations";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});

    const result = signupSchema.safeParse({ name, email, password });
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((err: any) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(result.data),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/verify-email?email=${encodeURIComponent(result.data.email)}`);
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch (err) {
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
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200 dark:border-slate-800">
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="text-3xl font-extrabold text-center tracking-tight text-slate-900 dark:text-white">
            Create an account
          </CardTitle>
          <CardDescription className="text-center text-base text-slate-500 dark:text-slate-400">
            Join us to start learning today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`h-11 ${fieldErrors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              />
              {fieldErrors.name && <p className="text-xs text-red-500">{fieldErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`h-11 ${fieldErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              />
              {fieldErrors.email && <p className="text-xs text-red-500">{fieldErrors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`h-11 ${fieldErrors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              />
              {fieldErrors.password && <p className="text-xs text-red-500">{fieldErrors.password}</p>}
              {password.length > 0 && (
                <div className="grid grid-cols-2 gap-1 mt-2">
                  {passwordChecks.map((check, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${check.pass ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`} />
                      <span className={`text-xs ${check.pass ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}`}>
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {error && <p className="text-sm font-medium text-red-500">{error}</p>}
            <Button className="w-full h-11 text-base font-semibold transition-all hover:scale-[1.02]" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center pt-2 pb-6">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 font-semibold hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
