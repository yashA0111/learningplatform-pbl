import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Course, { ICourse } from "@/models/Course";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SubmitCourseDialog } from "@/components/SubmitCourseDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizModal } from "@/components/QuizModal";
import { ExploreShell, ExploreCourseCard, ExploreSection } from "@/components/ExploreShell";
import { AnimatedHeader } from "@/components/DashboardShell";
import { ArrowLeft, Sparkles, Book } from "lucide-react";

// Jaccard similarity function
function calculateJaccardSimilarity(tags1: string[], tags2: string[]): number {
  if (!tags1.length && !tags2.length) return 0;
  
  const set1 = new Set(tags1.map(t => t.toLowerCase()));
  const set2 = new Set(tags2.map(t => t.toLowerCase()));
  
  let intersectionSize = 0;
  set1.forEach(item => {
    if (set2.has(item)) intersectionSize++;
  });
  
  const unionSize = set1.size + set2.size - intersectionSize;
  return intersectionSize / unionSize;
}

export default async function ExplorePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  await connectToDatabase();
  const dbUser = await User.findOne({ email: session.user?.email });
  const userInterests: string[] = dbUser?.interests || [];

  // Fetch all community courses (lean() returns plain JS objects)
  const allCourses = await Course.find({})
    .populate("submittedBy", "name")
    .lean() as unknown as (ICourse & { _id: { toString: () => string }, submittedBy: { name: string }, createdAt: string | Date })[];

  // Sort by similarity, then by newest
  const sortedCourses = [...allCourses].map(course => {
    const score = calculateJaccardSimilarity(course.tags, userInterests);
    return { ...course, _id: course._id.toString(), score };
  }).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const recommendedCourses = sortedCourses.filter(c => c.score > 0);
  const otherCourses = sortedCourses.filter(c => c.score === 0);

  return (
    <ExploreShell>
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header */}
        <AnimatedHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 sm:p-6 bg-white/70 dark:bg-slate-800/50 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/40 backdrop-blur-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />
          <div className="pt-1">
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md shadow-violet-500/20">
                <Sparkles className="h-4.5 w-4.5 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Explore</h1>
            </div>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1 ml-12">
              Discover community-submitted courses based on your interests.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            <Link href="/dashboard">
              <Button variant="outline" className="font-medium hover:bg-slate-100/80 dark:hover:bg-slate-700/50 border-slate-200/80 dark:border-slate-700/50 rounded-xl transition-all duration-200">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <SubmitCourseDialog />
          </div>
        </AnimatedHeader>

        {/* Recommended Section */}
        {recommendedCourses.length > 0 && (
          <ExploreSection delay={0.15}>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </span>
              Recommended for You
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {recommendedCourses.map((course, idx) => (
                <ExploreCourseCard key={course._id} index={idx}>
                  <CourseCard course={course} />
                </ExploreCourseCard>
              ))}
            </div>
          </ExploreSection>
        )}

        {/* All Courses Section */}
        <ExploreSection delay={recommendedCourses.length > 0 ? 0.3 : 0.15}>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 shadow-sm">
              <Book className="h-3.5 w-3.5 text-white" />
            </span>
            {recommendedCourses.length > 0 ? "Other Community Courses" : "All Community Courses"}
          </h2>
          {otherCourses.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
               {otherCourses.map((course, idx) => (
                 <ExploreCourseCard key={course._id} index={idx}>
                   <CourseCard course={course} />
                 </ExploreCourseCard>
               ))}
             </div>
          ) : (
            <div className="p-10 text-center bg-white/60 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300/60 dark:border-slate-700/40 backdrop-blur-sm">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 mb-3">
                <Book className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">No courses available yet. Be the first to submit one!</p>
            </div>
          )}
        </ExploreSection>

      </div>
    </ExploreShell>
  );
}

function CourseCard({ course }: { course: { _id: string, title: string, url: string, platform: string, tags: string[], score?: number, submittedBy?: { name: string } } }) {
  const hasValidUrl = course.url && course.url.trim().length > 0;
  const linkHref = hasValidUrl ? (course.url.startsWith('http') ? course.url : `https://${course.url}`) : undefined;

  // Score-based accent
  const scoreAccent = course.score && course.score > 0.5
    ? "from-emerald-400 to-teal-500"
    : course.score && course.score > 0.2
    ? "from-amber-400 to-orange-500"
    : "from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700";

  return (
    <Card className="h-full flex flex-col transition-all duration-300 dark:border-slate-700/40 bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm relative overflow-hidden rounded-2xl shadow-sm hover:shadow-lg border-slate-200/60 group">
      {/* Score accent bar */}
      <div className={`h-1 bg-gradient-to-r ${scoreAccent}`} />
      
      <CardHeader className="pb-3 cursor-pointer pt-4">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg leading-tight line-clamp-2">
            {hasValidUrl ? (
              <a href={linkHref} target="_blank" rel="noopener noreferrer" className="after:absolute after:inset-0 focus:outline-none text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                {course.title}
              </a>
            ) : (
              <span className="text-slate-900 dark:text-white">{course.title}</span>
            )}
          </CardTitle>
          <span className="shrink-0 inline-flex items-center rounded-lg bg-indigo-50/80 px-2 py-1 text-xs font-bold text-indigo-700 ring-1 ring-inset ring-indigo-500/15 dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/20 relative z-10 uppercase tracking-wider">
            {course.platform}
          </span>
        </div>
        <CardDescription className="text-xs pt-1">
          Shared by {course.submittedBy?.name || "Anonymous"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pointer-events-none">
        <div className="flex flex-wrap gap-1.5 pointer-events-auto relative z-10">
          {course.tags.slice(0, 4).map((tag: string, idx: number) => (
            <span key={idx} className="inline-flex items-center rounded-lg bg-slate-100/80 dark:bg-slate-700/50 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300 ring-1 ring-inset ring-slate-200/50 dark:ring-slate-600/30">
              {tag}
            </span>
          ))}
          {course.tags.length > 4 && (
            <span className="inline-flex items-center rounded-lg bg-slate-100/80 dark:bg-slate-700/50 px-2 py-0.5 text-xs font-medium text-slate-500 ring-1 ring-inset ring-slate-200/50 dark:ring-slate-600/30">
              +{course.tags.length - 4}
            </span>
          )}
        </div>
      </CardContent>
      <div className="p-4 pt-0 mt-auto pointer-events-auto">
        <QuizModal courseName={course.title} courseTags={course.tags} />
      </div>
    </Card>
  );
}
