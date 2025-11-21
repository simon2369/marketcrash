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

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Market Crash Monitor Newsletter</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Welcome to our comprehensive market crash monitoring newsletter series. Our mission is to provide data-driven insights into critical economic indicators that historically precede major market downturns, helping you make informed investment decisions through systematic risk assessment.
          </p>
        </div>

        {/* Newsletter Schedule */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-white">Newsletter Schedule</h2>
          
          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-2xl">📊</span>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Monthly Deep-Dive Report</h3>
                  <p className="text-sm text-slate-400 mb-2">Published on the 1st of each month</p>
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Our flagship comprehensive analysis covers all 10 critical crash indicators with detailed historical context, current readings, trend analysis, and forward-looking risk assessment. Each monthly report examines valuation metrics (Shiller CAPE, Buffett Indicator), credit markets (yield curves, spreads), positioning data (Berkshire Hathaway, insider trading), volatility indicators (VIX), and market internals (breadth, concentration) to provide a complete picture of systemic risk.
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-2xl">📈</span>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Weekly Market Summary</h3>
                  <p className="text-sm text-slate-400 mb-2">Published every Sunday</p>
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Quick-hit updates tracking the most important weekly changes in our key indicators, notable market events, and any emerging warning signals that require immediate attention. These concise briefings keep you informed between monthly reports without overwhelming detail.
              </p>
            </div>
          </div>
        </div>

        {/* Monthly Newsletters */}
        <div className="mb-8">
          <h2 className="text-3xl font-semibold mb-6 text-slate-900 dark:text-white">Monthly Newsletters</h2>
          
          <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6 mb-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  November 2025 Market Crash Indicators: Volatility Surges As Warning Signals Multiply
                </h3>
                <p className="text-sm text-slate-400">Published: November 1, 2025</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <Link
                  href="/newsletter/november-2025"
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  📖 Read Summary
                </Link>
                <a
                  href="/newsletters/november-2025/Market_Crash_Indicators_Newsletter_November_2025.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                >
                  📄 Download PDF
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Summaries */}
        <div className="mb-8">
          <h2 className="text-3xl font-semibold mb-6 text-slate-900 dark:text-white">Weekly Summaries</h2>
          
          <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
            <p className="text-slate-300 mb-4">
              Weekly market summaries will be published here every Sunday, providing quick updates on key indicator changes and emerging warning signals.
            </p>
            <div className="bg-slate-900/50 rounded border border-slate-700 p-8 text-center">
              <p className="text-slate-400">📊 Weekly summaries coming soon</p>
            </div>
          </div>
        </div>

        {/* Data Commitment */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">Our Data Commitment</h2>
          <p className="text-slate-300 mb-4 leading-relaxed">
            All analysis is built on 50+ authoritative financial institutions, government agencies, academic research sources, and market data providers including:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <ul className="space-y-2 text-slate-300">
              <li>• Federal Reserve Economic Data (FRED)</li>
              <li>• U.S. Treasury Department</li>
              <li>• SEC filings and regulatory data</li>
              <li>• Leading financial institutions (Goldman Sachs, JPMorgan, Morgan Stanley)</li>
            </ul>
            <ul className="space-y-2 text-slate-300">
              <li>• Academic institutions (Yale University, NBER, Harvard)</li>
              <li>• Market data providers (Bloomberg, CBOE, Nasdaq, S&P)</li>
            </ul>
          </div>
          
          <p className="text-slate-300 leading-relaxed">
            Every data point is sourced from institutional-quality providers to ensure accuracy and reliability for market crash monitoring purposes. We never rely on speculation, social media sentiment, or unverified sources—only authoritative, verifiable data that serious institutional investors use for their own risk management.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2 text-yellow-200">Disclaimer</h3>
          <p className="text-yellow-100/90 leading-relaxed">
            These newsletters provide educational market analysis and are not investment advice. Market timing is extremely difficult, and historical patterns do not guarantee future outcomes. Always consult qualified financial advisors before making investment decisions.
          </p>
        </div>
      </div>
    </div>
  );
}

