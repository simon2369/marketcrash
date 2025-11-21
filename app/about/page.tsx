import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { Navbar } from '@/components/layout/navbar';

export default function AboutPage() {
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
        <h1 className="text-4xl font-bold mb-6">Market Crash Monitor</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
            This dashboard tracks critical economic indicators that historically preceded major market crashes, including the 1929 Great Depression and 2008 Financial Crisis. By monitoring key metrics like the Shiller CAPE ratio, yield curve inversions, margin debt levels, credit spreads, and the Buffett Indicator, we provide real-time insights into potential market risks over an 18-month outlook window.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-slate-900 dark:text-white">Our Mission</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            To deliver data-driven market intelligence that helps investors make informed decisions about risk management and position sizing. We believe that while no indicator is perfect, tracking the alignment of multiple warning signals can provide valuable early detection of dangerous market conditions.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-slate-900 dark:text-white">What We Track</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Five tier-1 indicators with proven predictive power appear 6-24 months before major declines. The current market environment shows concerning alignment across several of these metrics—similar patterns to those seen before historical crashes. Our dashboard updates in real-time, combining institutional-quality data from sources like FRED, Alpha Vantage, and SEC filings to keep you informed.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-slate-900 dark:text-white">Important Disclaimer</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            This tool is designed for educational and informational purposes. Markets can remain overvalued longer than expected, and past patterns don't guarantee future outcomes. Use these insights as part of a broader investment strategy, not as absolute timing predictions.
          </p>
        </div>
      </div>
    </div>
  );
}

