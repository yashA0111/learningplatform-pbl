import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Link from "next/link";
import { Suspense } from "react";
import { RecommendationsList, RecommendationsSkeleton } from "@/components/Recommendations";
import { ManageListCard } from "@/components/ManageListCard";
import { DeleteAccountButton } from "@/components/DeleteAccountButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  await connectToDatabase();
  const dbUser = await User.findOne({ email: session.user?.email });

  const interests: string[] = dbUser?.interests || [];
  const completedCourses: string[] = (dbUser?.completedCourses || []).map((c: unknown) => String(c));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">Welcome back, <span className="font-semibold text-slate-700 dark:text-slate-300">{session.user?.name}</span></p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link href="/api/auth/signout">
              <Button variant="outline" className="font-medium hover:bg-slate-100 dark:hover:bg-slate-700">
                Sign Out
              </Button>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ManageListCard
            title="Your Interests"
            description="Topics you want to learn about"
            items={interests}
            field="interests"
            placeholder="e.g. React, Python, AI..."
            titleClassName="text-indigo-700 dark:text-indigo-400"
            tagClassName="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400"
          />

          <ManageListCard
            title="Completed Courses"
            description="Courses you have finished"
            items={completedCourses}
            field="completedCourses"
            placeholder="e.g. Machine Learning Basics..."
            titleClassName="text-emerald-700 dark:text-emerald-400"
            tagClassName="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
          />
        </div>

        <Suspense fallback={<RecommendationsSkeleton />}>
          <RecommendationsList interests={interests} />
        </Suspense>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
          <DeleteAccountButton />
        </div>
      </div>
    </div>
  );
}
