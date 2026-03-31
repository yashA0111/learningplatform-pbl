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
    .lean() as unknown as (ICourse & { _id: any, submittedBy: { name: string } })[];

  // Sort by similarity, then by newest
  const sortedCourses = [...allCourses].map(course => {
    const score = calculateJaccardSimilarity(course.tags, userInterests);
    return { ...course, _id: course._id.toString(), score };
  }).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // @ts-ignore
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const recommendedCourses = sortedCourses.filter(c => c.score > 0);
  const otherCourses = sortedCourses.filter(c => c.score === 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Explore</h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
              Discover community-submitted courses based on your interests.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            <Link href="/dashboard">
              <Button variant="outline" className="font-medium hover:bg-slate-100 dark:hover:bg-slate-700">
                Back to Dashboard
              </Button>
            </Link>
            <SubmitCourseDialog />
          </div>
        </header>

        {/* Recommended Section */}
        {recommendedCourses.length > 0 && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
              Recommended for You
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedCourses.map(course => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          </div>
        )}

        {/* All Courses Section */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
            {recommendedCourses.length > 0 ? "Other Community Courses" : "All Community Courses"}
          </h2>
          {otherCourses.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {otherCourses.map(course => (
                 <CourseCard key={course._id} course={course} />
               ))}
             </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400">No courses available yet. Be the first to submit one!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function CourseCard({ course }: { course: any }) {
  return (
    <a href={course.url} target="_blank" rel="noopener noreferrer" className="block h-full">
      <Card className="h-full flex flex-col hover:shadow-md transition-shadow dark:border-slate-800 bg-white dark:bg-slate-800/50">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-lg leading-tight line-clamp-2">{course.title}</CardTitle>
            <span className="shrink-0 inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/30">{course.platform}</span>
          </div>
          <CardDescription className="text-xs pt-1">
            Shared by {course.submittedBy?.name || "Anonymous"}
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-auto pt-0">
          <div className="flex flex-wrap gap-1.5">
            {course.tags.slice(0, 4).map((tag: string, idx: number) => (
              <span key={idx} className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                {tag}
              </span>
            ))}
            {course.tags.length > 4 && (
              <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-500">
                +{course.tags.length - 4}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
