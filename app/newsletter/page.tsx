import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { Navbar } from '@/components/layout/navbar';

export default function NewsletterPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 p-6 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl flex justify-between items-center">
          <Link href="/">
            <h1 className="text-3xl font-bold text-white hover:text-slate-200 transition-colors cursor-pointer">
              📊 Market Crash Monitor
            </h1>
          </Link>
          
          <ThemeToggle />
        </div>
      </header>

      {/* Navigation Bar */}
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">Newsletter</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
            Subscribe to our newsletter for the latest market crash insights and updates.
          </p>
          
          <p className="text-slate-600 dark:text-slate-400">
            Newsletter signup form coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}

