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
import { BackendConnectionLog } from "@/components/BackendConnectionLog";
import { DashboardShell, AnimatedHeader, AnimatedGridItem, AnimatedDivider } from "@/components/DashboardShell";
import { Compass, LogOut, LayoutDashboard } from "lucide-react";

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
    <DashboardShell>
      <BackendConnectionLog />
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        <AnimatedHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 sm:p-6 bg-white/70 dark:bg-slate-800/50 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/40 backdrop-blur-sm overflow-hidden relative">
          {/* Gradient accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
          <div className="pt-1">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/20">
                <LayoutDashboard className="h-4.5 w-4.5 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
            </div>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1 ml-12">
              Welcome back, <span className="font-semibold text-slate-700 dark:text-slate-300">{session.user?.name}</span>
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            <Link href="/explore">
              <Button className="font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 rounded-xl hover:scale-[1.02] active:scale-[0.98]">
                <Compass className="h-4 w-4 mr-2" />
                Explore Courses
              </Button>
            </Link>
            <Link href="/api/auth/signout">
              <Button variant="outline" className="font-medium hover:bg-slate-100/80 dark:hover:bg-slate-700/50 border-slate-200/80 dark:border-slate-700/50 rounded-xl transition-all duration-200">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </Link>
          </div>
        </AnimatedHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          <AnimatedGridItem index={0}>
            <ManageListCard
              title="Your Interests"
              description="Topics you want to learn about"
              items={interests}
              field="interests"
              placeholder="e.g. React, Python, AI..."
              titleClassName="text-indigo-700 dark:text-indigo-400"
              tagClassName="bg-indigo-50/80 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 ring-1 ring-inset ring-indigo-500/10"
            />
          </AnimatedGridItem>

          <AnimatedGridItem index={1}>
            <ManageListCard
              title="Completed Courses"
              description="Courses you have finished"
              items={completedCourses}
              field="completedCourses"
              placeholder="e.g. Machine Learning Basics..."
              titleClassName="text-emerald-700 dark:text-emerald-400"
              tagClassName="bg-emerald-50/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/10"
            />
          </AnimatedGridItem>
        </div>

        <Suspense fallback={<RecommendationsSkeleton />}>
          <RecommendationsList interests={interests} completedCourses={completedCourses} />
        </Suspense>

        <AnimatedDivider className="pt-8 border-t border-slate-200/60 dark:border-slate-800/60">
          <DeleteAccountButton />
        </AnimatedDivider>
      </div>
    </DashboardShell>
  );
}
