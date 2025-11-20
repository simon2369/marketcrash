'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { Navbar } from '@/components/layout/navbar';
import { useEconomicIndicators } from '@/hooks/use-economic-indicators';
import { HistoricalComparisonChart } from '@/components/charts/historical-comparison-chart';
import { MarketTimeline } from '@/components/market-timeline';

export default function CrashTimelinePage() {
  const { data: economicIndicators } = useEconomicIndicators();

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

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-4xl font-bold mb-6">Crash Timeline</h1>
        
        {/* Historical Crash Comparison */}
        <section className="mb-4 lg:mb-8 mt-4 lg:mt-8">
          <h2 className="text-xl lg:text-2xl font-bold mb-2 lg:mb-4">
            📉 Historical Crash Comparison
          </h2>
          <p className="text-slate-400 mb-4 lg:mb-6 text-sm lg:text-base">
            Current pattern vs 1929 and 2008 crashes (indexed to 100 at peak)
          </p>
          <div className="bg-slate-800 rounded-lg p-4 lg:p-6 border border-slate-700">
            <HistoricalComparisonChart />
          </div>
        </section>

        {/* 18-Month Timeline */}
        <section id="timeline" className="mb-4 lg:mb-8">
          <h2 className="text-xl lg:text-2xl font-bold mb-2 lg:mb-4">
            📅 18-Month Monitoring Timeline
          </h2>
          <p className="text-slate-400 mb-4 lg:mb-6 text-sm lg:text-base">
            November 2025 to May 2027 - Track crash indicators and milestones over time
          </p>
          <div className="bg-slate-800 rounded-lg p-4 lg:p-6 border border-slate-700">
            <MarketTimeline indicators={economicIndicators} />
          </div>
        </section>
      </main>
    </div>
  );
}

