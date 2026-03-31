import { QuizModal } from "./QuizModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

type Course = {
  id: string;
  title: string;
  url: string;
  tags: string[];
};

async function fetchRecommendations(interests: string[], completedCourses: string[]): Promise<Course[]> {
  try {
    const engineUrl = process.env.NEXT_PUBLIC_ENGINE_URL || "http://localhost:8080";
    const res = await fetch(`${engineUrl}/api/recommend/by-interests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ interests, completedCourses }),
      cache: "no-store",
    });
    
    if (res.ok) {
      console.log(`[Server] Successfully connected to Java Engine at ${engineUrl}`);
    } else {
      console.error(`[Server] Java Engine connection failed: ${res.status} ${res.statusText}`);
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch recommendations: ${res.statusText}`);
    }
    return res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function RecommendationsList({ interests, completedCourses = [] }: { interests: string[], completedCourses?: string[] }) {
  const recommendedCourses = await fetchRecommendations(interests, completedCourses);

  // Calculate generic mastery/skill gap
  // User interests vs Recommended course tags
  const interestSet = new Set(interests.map(i => i.toLowerCase()));
  const recommendedTagsSet = new Set<string>();
  
  recommendedCourses.forEach(course => {
    course.tags.forEach(tag => recommendedTagsSet.add(tag.toLowerCase()));
  });

  const skillGaps = Array.from(recommendedTagsSet).filter(tag => !interestSet.has(tag));

  return (
    <div className="space-y-6 sm:space-y-8 mt-6 sm:mt-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-3 sm:mb-4">Recommended for You</h2>
        {recommendedCourses.length > 0 ? (
          <ScrollArea className="w-full whitespace-nowrap rounded-md border border-slate-200 dark:border-slate-800">
            <div className="flex w-max space-x-3 sm:space-x-4 p-3 sm:p-4">
              {recommendedCourses.map((course) => {
                const hasValidUrl = course.url && course.url.trim().length > 0;
                const linkHref = hasValidUrl ? (course.url.startsWith('http') ? course.url : `https://${course.url}`) : undefined;
                
                const cardContent = (
                  <Card key={course.id} className="w-[240px] sm:w-[300px] shrink-0 shadow-sm transition-transform hover:shadow-md hover:scale-[1.02] active:scale-[0.98] dark:border-slate-800 h-[280px] flex flex-col relative overflow-hidden">
                    <CardHeader className="pb-3 cursor-pointer">
                      <CardTitle className="truncate">
                        {hasValidUrl ? (
                          <a href={linkHref} target="_blank" rel="noopener noreferrer" className="after:absolute after:inset-0 focus:outline-none text-slate-900 dark:text-white">
                            {course.title}
                          </a>
                        ) : (
                          <span className="text-slate-900 dark:text-white">{course.title}</span>
                        )}
                      </CardTitle>
                      <CardDescription className="truncate">Course ID: {course.id}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden pointer-events-none">
                      <div className="flex flex-wrap gap-2 pointer-events-auto relative z-10">
                        {course.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                            {tag}
                          </span>
                        ))}
                        {course.tags.length > 3 && (
                          <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-800 dark:text-slate-300">
                            +{course.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </CardContent>
                    <div className="p-4 pt-0 mt-auto pointer-events-auto">
                      <QuizModal courseName={course.title} courseTags={course.tags} />
                    </div>
                  </Card>
                );

                return cardContent;
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        ) : (
          <p className="text-slate-500 italic text-sm">Update your interests to receive course recommendations.</p>
        )}
      </div>

      <Card className="shadow-md border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl text-rose-700 dark:text-rose-400">Skill Gap Analysis</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Mastery areas you might want to explore based on recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          {skillGaps.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skillGaps.map((gap, idx) => (
                <span key={idx} className="inline-flex items-center rounded-md bg-rose-50 dark:bg-rose-900/20 px-2 py-1 text-sm font-medium text-rose-700 dark:text-rose-400 ring-1 ring-inset ring-rose-700/10 dark:ring-rose-400/20">
                  {gap}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Your current interests perfectly align with available courses, or no recommendations active.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function RecommendationsSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 mt-6 sm:mt-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-3 sm:mb-4">Recommended for You</h2>
        <div className="flex space-x-3 sm:space-x-4 overflow-hidden py-3 sm:py-4 border border-slate-200 dark:border-slate-800 rounded-md p-3 sm:p-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="w-[240px] sm:w-[300px] shrink-0 dark:border-slate-800">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <Card className="dark:border-slate-800">
        <CardHeader>
          <Skeleton className="h-6 w-1/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
             <Skeleton className="h-8 w-20 rounded-md" />
             <Skeleton className="h-8 w-24 rounded-md" />
             <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
