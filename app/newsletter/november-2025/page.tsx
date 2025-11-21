import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { Navbar } from '@/components/layout/navbar';

export default function November2025NewsletterPage() {
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
        {/* Back Link */}
        <Link 
          href="/newsletter" 
          className="inline-flex items-center text-blue-500 hover:text-blue-400 mb-6 transition-colors"
        >
          ← Back to Newsletter
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
                📈 November 2025 Market Crash Indicators
              </h1>
              <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-4">
                Volatility Surges as Warning Signals Multiply
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Published: November 1, 2025
              </p>
            </div>
            <a
              href="/newsletters/november-2025/Market_Crash_Indicators_Newsletter_November_2025.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              📄 Download Full PDF
            </a>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-blue-200">Executive Summary</h2>
          <p className="text-slate-200 leading-relaxed">
            Seven critical indicators remain in red flag territory as November 2025 closes. Market volatility spiked to 26.42 on November 20th—a dramatic 96% increase from last year—while Berkshire Hathaway's cash fortress swelled to $382 billion. Valuation metrics (Shiller CAPE near 40, Buffett Indicator above 215%) signal extreme overvaluation. Despite new index highs mid month, breadth deteriorated, insider selling persisted, and Buffett's positioning suggests sophisticated investors are bracing for dislocation.
          </p>
        </div>

        {/* Key Highlights */}
        <div className="mb-8">
          <h2 className="text-3xl font-semibold mb-6 text-slate-900 dark:text-white">🔍 Key Highlights</h2>
          
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
              <h3 className="text-xl font-semibold mb-4 text-white">Valuation Metrics</h3>
              <ul className="space-y-2 text-slate-300">
                <li>• <strong>Shiller CAPE ratio:</strong> 39.34–40.01 (third highest in 145 years)</li>
                <li>• <strong>Buffett Indicator:</strong> 213–217% (nearly double overvaluation threshold)</li>
              </ul>
            </div>

            <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
              <h3 className="text-xl font-semibold mb-4 text-white">Volatility</h3>
              <ul className="space-y-2 text-slate-300">
                <li>• <strong>VIX surged to 26.42</strong> (up 96% YoY), signaling heightened investor anxiety</li>
              </ul>
            </div>

            <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
              <h3 className="text-xl font-semibold mb-4 text-white">Berkshire Hathaway</h3>
              <ul className="space-y-2 text-slate-300">
                <li>• Record <strong>$382B cash position</strong></li>
                <li>• <strong>12th consecutive quarter</strong> of net stock selling</li>
                <li>• <strong>Zero buybacks</strong> despite underperformance vs. S&P 500</li>
              </ul>
            </div>

            <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
              <h3 className="text-xl font-semibold mb-4 text-white">Yield Curve</h3>
              <ul className="space-y-2 text-slate-300">
                <li>• Positive at <strong>0.21%</strong> but 11 months post uninversion—historically recession danger zone</li>
              </ul>
            </div>

            <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
              <h3 className="text-xl font-semibold mb-4 text-white">Market Breadth</h3>
              <ul className="space-y-2 text-slate-300">
                <li>• <strong>"Magnificent Seven" tech stocks</strong> = 31% of S&P 500 weight</li>
                <li>• Broad based sell offs in November</li>
              </ul>
            </div>

            <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
              <h3 className="text-xl font-semibold mb-4 text-white">Insider Activity</h3>
              <ul className="space-y-2 text-slate-300">
                <li>• Elevated <strong>sell to buy ratios (3–4:1)</strong></li>
                <li>• Berkshire's absence of buybacks reinforces caution</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Indicator Dashboard */}
        <div className="mb-8">
          <h2 className="text-3xl font-semibold mb-6 text-slate-900 dark:text-white">📊 Indicator Dashboard</h2>
          
          <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Indicator</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  <tr className="hover:bg-slate-800/70">
                    <td className="px-6 py-4 text-slate-300">Shiller CAPE (39–40)</td>
                    <td className="px-6 py-4"><span className="text-red-400 font-semibold">🔴 Red</span></td>
                    <td className="px-6 py-4 text-slate-300">Extreme overvaluation</td>
                  </tr>
                  <tr className="hover:bg-slate-800/70">
                    <td className="px-6 py-4 text-slate-300">Buffett Indicator (213–217%)</td>
                    <td className="px-6 py-4"><span className="text-red-400 font-semibold">🔴 Red</span></td>
                    <td className="px-6 py-4 text-slate-300">Double historical threshold</td>
                  </tr>
                  <tr className="hover:bg-slate-800/70">
                    <td className="px-6 py-4 text-slate-300">VIX (26.42)</td>
                    <td className="px-6 py-4"><span className="text-red-400 font-semibold">🔴 Red</span></td>
                    <td className="px-6 py-4 text-slate-300">Elevated volatility</td>
                  </tr>
                  <tr className="hover:bg-slate-800/70">
                    <td className="px-6 py-4 text-slate-300">Berkshire Cash ($382B)</td>
                    <td className="px-6 py-4"><span className="text-red-400 font-semibold">🔴 Red</span></td>
                    <td className="px-6 py-4 text-slate-300">Defensive positioning</td>
                  </tr>
                  <tr className="hover:bg-slate-800/70">
                    <td className="px-6 py-4 text-slate-300">Yield Curve (+0.21%)</td>
                    <td className="px-6 py-4"><span className="text-red-400 font-semibold">🔴 Red</span></td>
                    <td className="px-6 py-4 text-slate-300">11 months post uninversion</td>
                  </tr>
                  <tr className="hover:bg-slate-800/70">
                    <td className="px-6 py-4 text-slate-300">Market Breadth</td>
                    <td className="px-6 py-4"><span className="text-red-400 font-semibold">🔴 Red</span></td>
                    <td className="px-6 py-4 text-slate-300">Narrow leadership cracking</td>
                  </tr>
                  <tr className="hover:bg-slate-800/70">
                    <td className="px-6 py-4 text-slate-300">Insider Selling</td>
                    <td className="px-6 py-4"><span className="text-red-400 font-semibold">🔴 Red</span></td>
                    <td className="px-6 py-4 text-slate-300">Ratios above warning levels</td>
                  </tr>
                  <tr className="hover:bg-slate-800/70">
                    <td className="px-6 py-4 text-slate-300">Margin Debt</td>
                    <td className="px-6 py-4"><span className="text-yellow-400 font-semibold">🟡 Yellow</span></td>
                    <td className="px-6 py-4 text-slate-300">Elevated but not extreme</td>
                  </tr>
                  <tr className="hover:bg-slate-800/70">
                    <td className="px-6 py-4 text-slate-300">Credit Spreads</td>
                    <td className="px-6 py-4"><span className="text-yellow-400 font-semibold">🟡 Yellow</span></td>
                    <td className="px-6 py-4 text-slate-300">Tight, contradicting curve</td>
                  </tr>
                  <tr className="hover:bg-slate-800/70">
                    <td className="px-6 py-4 text-slate-300">S&P 500 Performance</td>
                    <td className="px-6 py-4"><span className="text-green-400 font-semibold">🟢 Green</span></td>
                    <td className="px-6 py-4 text-slate-300">+16% YTD, but unstable</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Historical Parallels */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">📉 Historical Parallels</h2>
          <p className="text-slate-300 mb-4 leading-relaxed">
            November 2025 increasingly resembles late 2007:
          </p>
          <ul className="space-y-2 text-slate-300 mb-4 ml-4">
            <li>• Yield curve normalized mid 2007 → recession began 6 months later</li>
            <li>• VIX surged from complacency to fear</li>
            <li>• Insiders sold heavily while markets rose</li>
            <li>• Buffett built cash defensively</li>
          </ul>
          <p className="text-slate-300 leading-relaxed">
            The difference: current valuations far exceed 2007, suggesting greater downside risk.
          </p>
        </div>

        {/* Conclusion */}
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">📝 Conclusion</h2>
          <p className="text-slate-300 mb-4 leading-relaxed">
            November 2025 marks a transition from complacency to fear. With seven major crash indicators flashing red, Buffett's $382B cash fortress, and valuations at generational extremes, the next 6–18 months warrant heightened caution.
          </p>
          <blockquote className="border-l-4 border-blue-500 pl-4 italic text-slate-200 text-lg">
            "Be fearful when others are greedy." — Warren Buffett
          </blockquote>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2 text-yellow-200">Disclaimer</h3>
          <p className="text-yellow-100/90 leading-relaxed">
            This newsletter provides market analysis based on historical crash indicators for educational purposes. It is not investment advice. Past patterns do not guarantee future outcomes. Consult with qualified financial advisors before making investment decisions.
          </p>
        </div>
      </div>
    </div>
  );
}

