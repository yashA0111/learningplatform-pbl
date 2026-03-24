import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Welcome to <span className="text-indigo-600 dark:text-indigo-400">LearningPlatform</span>
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          The modern way to track your interests and complete courses. Join our community of learners today.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link href="/signup">
            <Button size="lg" className="h-12 px-8 text-lg w-full sm:w-auto hover:scale-105 transition-transform">
              Get Started
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="h-12 px-8 text-lg w-full sm:w-auto hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
