'use client';

import { useMarketData } from '@/hooks/use-market-data';
import { useEconomicIndicators } from '@/hooks/use-economic-indicators';
import { KPICard } from '@/components/dashboard/kpi-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IndicatorGrid } from '@/components/dashboard/indicator-grid';
import { AlertTopBar } from '@/components/alert-top-bar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Navbar } from '@/components/layout/navbar';
import { NewsFeed } from '@/components/news/news-feed';
import { EnhancedCrashRiskCard } from '@/src/components/enhanced-crash-risk-card';
import MarketSentiment from '@/components/MarketSentiment';
import HighImpactNews from '@/components/HighImpactNews';
import Link from 'next/link';

export default function MarketCrashDashboard() {
  // Fetch real market data
  const { data: marketData, isLoading: isMarketDataLoading, error: marketDataError } = useMarketData();
  const { data: economicIndicators } = useEconomicIndicators();

  const isLoading = isMarketDataLoading;
  const error = marketDataError;

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

      {/* Alert Top Bar - Positioned right below navigation */}
      <div className="sticky top-[150px] z-30 w-full">
        <AlertTopBar indicators={economicIndicators} />
      </div>

      {/* Main Content */}
      <main className="container mx-auto p-4 lg:p-6">
        {/* Error State */}
        {error && (
          <div className="mb-4 lg:mb-6 rounded-lg border border-red-500/50 bg-red-500/10 p-4">
            <p className="text-red-400">
              Error loading market data: {error.message}
            </p>
          </div>
        )}

        {/* Main Content Grid - Sidebar on large screens */}
        <div className="grid grid-cols-1 gap-4 lg:gap-8 lg:grid-cols-3">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-8">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-4 lg:mb-6">
          {isLoading ? (
            // Loading skeletons
            <>
              <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 lg:p-6 md:col-span-3">
                <Skeleton className="mb-2 h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 lg:p-6">
                <Skeleton className="mb-2 h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 lg:p-6">
                <Skeleton className="mb-2 h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
            </>
          ) : (
            <>
              {/* Market Status - S&P 500, Dow Jones, Nasdaq */}
              <Card className="bg-slate-800/50 backdrop-blur-sm md:col-span-3">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Market Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Indices Section */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-6 border-b border-slate-700">
                    {/* S&P 500 */}
                    <div>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-2xl font-bold text-foreground">
                          ${marketData.sp500.value > 0 ? marketData.sp500.value.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }) : 'Loading...'}
                        </span>
                        {marketData.sp500.changePercent !== undefined && marketData.sp500.value > 0 && (
                          <Badge
                            variant="outline"
                            className={
                              marketData.sp500.changePercent >= 0
                                ? 'text-green-600 dark:text-green-400 border-green-500/50'
                                : 'text-red-600 dark:text-red-400 border-red-500/50'
                            }
                          >
                            {marketData.sp500.changePercent >= 0 ? '+' : ''}
                            {marketData.sp500.changePercent.toFixed(2)}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">S&P 500</p>
                    </div>

                    {/* Dow Jones 30 */}
                    <div>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-2xl font-bold text-foreground">
                          ${marketData.dowjones.value > 0 ? marketData.dowjones.value.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }) : 'Loading...'}
                        </span>
                        {marketData.dowjones.changePercent !== undefined && marketData.dowjones.value > 0 && (
                          <Badge
                            variant="outline"
                            className={
                              marketData.dowjones.changePercent >= 0
                                ? 'text-green-600 dark:text-green-400 border-green-500/50'
                                : 'text-red-600 dark:text-red-400 border-red-500/50'
                            }
                          >
                            {marketData.dowjones.changePercent >= 0 ? '+' : ''}
                            {marketData.dowjones.changePercent.toFixed(2)}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Dow Jones 30</p>
                    </div>

                    {/* Nasdaq 100 */}
                    <div>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-2xl font-bold text-foreground">
                          ${marketData.nasdaq.value > 0 ? marketData.nasdaq.value.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }) : 'Loading...'}
                        </span>
                        {marketData.nasdaq.changePercent !== undefined && marketData.nasdaq.value > 0 && (
                          <Badge
                            variant="outline"
                            className={
                              marketData.nasdaq.changePercent >= 0
                                ? 'text-green-600 dark:text-green-400 border-green-500/50'
                                : 'text-red-600 dark:text-red-400 border-red-500/50'
                            }
                          >
                            {marketData.nasdaq.changePercent >= 0 ? '+' : ''}
                            {marketData.nasdaq.changePercent.toFixed(2)}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Nasdaq 100</p>
                    </div>
                  </div>

                  {/* Stocks Section */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-4">Major Stocks</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {/* Alphabet (GOOGL) */}
                      <div>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-xl font-bold text-foreground">
                            {marketData.stocks.alphabet.value > 0 ? (
                              `$${marketData.stocks.alphabet.value.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                            ) : (
                              <span className="text-muted-foreground text-sm">Loading...</span>
                            )}
                          </span>
                          {marketData.stocks.alphabet.changePercent !== undefined && marketData.stocks.alphabet.value > 0 && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                marketData.stocks.alphabet.changePercent >= 0
                                  ? 'text-green-600 dark:text-green-400 border-green-500/50'
                                  : 'text-red-600 dark:text-red-400 border-red-500/50'
                              }`}
                            >
                              {marketData.stocks.alphabet.changePercent >= 0 ? '+' : ''}
                              {marketData.stocks.alphabet.changePercent.toFixed(2)}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Alphabet</p>
                      </div>

                      {/* Amazon (AMZN) */}
                      <div>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-xl font-bold text-foreground">
                            {marketData.stocks.amazon.value > 0 ? (
                              `$${marketData.stocks.amazon.value.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                            ) : (
                              <span className="text-muted-foreground text-sm">Loading...</span>
                            )}
                          </span>
                          {marketData.stocks.amazon.changePercent !== undefined && marketData.stocks.amazon.value > 0 && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                marketData.stocks.amazon.changePercent >= 0
                                  ? 'text-green-600 dark:text-green-400 border-green-500/50'
                                  : 'text-red-600 dark:text-red-400 border-red-500/50'
                              }`}
                            >
                              {marketData.stocks.amazon.changePercent >= 0 ? '+' : ''}
                              {marketData.stocks.amazon.changePercent.toFixed(2)}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Amazon</p>
                      </div>

                      {/* Apple (AAPL) */}
                      <div>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-xl font-bold text-foreground">
                            {marketData.stocks.apple.value > 0 ? (
                              `$${marketData.stocks.apple.value.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                            ) : (
                              <span className="text-muted-foreground text-sm">Loading...</span>
                            )}
                          </span>
                          {marketData.stocks.apple.changePercent !== undefined && marketData.stocks.apple.value > 0 && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                marketData.stocks.apple.changePercent >= 0
                                  ? 'text-green-600 dark:text-green-400 border-green-500/50'
                                  : 'text-red-600 dark:text-red-400 border-red-500/50'
                              }`}
                            >
                              {marketData.stocks.apple.changePercent >= 0 ? '+' : ''}
                              {marketData.stocks.apple.changePercent.toFixed(2)}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Apple</p>
                      </div>

                      {/* Tesla (TSLA) */}
                      <div>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-xl font-bold text-foreground">
                            {marketData.stocks.tesla.value > 0 ? (
                              `$${marketData.stocks.tesla.value.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                            ) : (
                              <span className="text-muted-foreground text-sm">Loading...</span>
                            )}
                          </span>
                          {marketData.stocks.tesla.changePercent !== undefined && marketData.stocks.tesla.value > 0 && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                marketData.stocks.tesla.changePercent >= 0
                                  ? 'text-green-600 dark:text-green-400 border-green-500/50'
                                  : 'text-red-600 dark:text-red-400 border-red-500/50'
                              }`}
                            >
                              {marketData.stocks.tesla.changePercent >= 0 ? '+' : ''}
                              {marketData.stocks.tesla.changePercent.toFixed(2)}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Tesla</p>
                      </div>

                      {/* Meta Platforms (META) */}
                      <div>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-xl font-bold text-foreground">
                            {marketData.stocks.meta.value > 0 ? (
                              `$${marketData.stocks.meta.value.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                            ) : (
                              <span className="text-muted-foreground text-sm">Loading...</span>
                            )}
                          </span>
                          {marketData.stocks.meta.changePercent !== undefined && marketData.stocks.meta.value > 0 && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                marketData.stocks.meta.changePercent >= 0
                                  ? 'text-green-600 dark:text-green-400 border-green-500/50'
                                  : 'text-red-600 dark:text-red-400 border-red-500/50'
                              }`}
                            >
                              {marketData.stocks.meta.changePercent >= 0 ? '+' : ''}
                              {marketData.stocks.meta.changePercent.toFixed(2)}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Meta</p>
                      </div>

                      {/* Microsoft (MSFT) */}
                      <div>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-xl font-bold text-foreground">
                            {marketData.stocks.microsoft.value > 0 ? (
                              `$${marketData.stocks.microsoft.value.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                            ) : (
                              <span className="text-muted-foreground text-sm">Loading...</span>
                            )}
                          </span>
                          {marketData.stocks.microsoft.changePercent !== undefined && marketData.stocks.microsoft.value > 0 && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                marketData.stocks.microsoft.changePercent >= 0
                                  ? 'text-green-600 dark:text-green-400 border-green-500/50'
                                  : 'text-red-600 dark:text-red-400 border-red-500/50'
                              }`}
                            >
                              {marketData.stocks.microsoft.changePercent >= 0 ? '+' : ''}
                              {marketData.stocks.microsoft.changePercent.toFixed(2)}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Microsoft</p>
                      </div>

                      {/* NVIDIA (NVDA) */}
                      <div>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-xl font-bold text-foreground">
                            {marketData.stocks.nvidia.value > 0 ? (
                              `$${marketData.stocks.nvidia.value.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                            ) : (
                              <span className="text-muted-foreground text-sm">Loading...</span>
                            )}
                          </span>
                          {marketData.stocks.nvidia.changePercent !== undefined && marketData.stocks.nvidia.value > 0 && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                marketData.stocks.nvidia.changePercent >= 0
                                  ? 'text-green-600 dark:text-green-400 border-green-500/50'
                                  : 'text-red-600 dark:text-red-400 border-red-500/50'
                              }`}
                            >
                              {marketData.stocks.nvidia.changePercent >= 0 ? '+' : ''}
                              {marketData.stocks.nvidia.changePercent.toFixed(2)}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">NVIDIA</p>
                      </div>
                    </div>
                  </div>

                  {/* Major Cryptocurrencies Section */}
                  <div className="mt-6 pt-6 border-t border-slate-700">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-4">Major Cryptocurrencies</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {/* Bitcoin */}
                      <div>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-xl font-bold text-foreground">
                            {marketData.crypto.bitcoin.value > 0 ? (
                              `$${marketData.crypto.bitcoin.value.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                            ) : (
                              <span className="text-muted-foreground text-sm">Loading...</span>
                            )}
                          </span>
                          {marketData.crypto.bitcoin.changePercent !== undefined && marketData.crypto.bitcoin.value > 0 && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                marketData.crypto.bitcoin.changePercent >= 0
                                  ? 'text-green-600 dark:text-green-400 border-green-500/50'
                                  : 'text-red-600 dark:text-red-400 border-red-500/50'
                              }`}
                            >
                              {marketData.crypto.bitcoin.changePercent >= 0 ? '+' : ''}
                              {marketData.crypto.bitcoin.changePercent.toFixed(2)}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Bitcoin (BTC)</p>
                      </div>

                      {/* Ethereum */}
                      <div>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-xl font-bold text-foreground">
                            {marketData.crypto.ethereum.value > 0 ? (
                              `$${marketData.crypto.ethereum.value.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                            ) : (
                              <span className="text-muted-foreground text-sm">Loading...</span>
                            )}
                          </span>
                          {marketData.crypto.ethereum.changePercent !== undefined && marketData.crypto.ethereum.value > 0 && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                marketData.crypto.ethereum.changePercent >= 0
                                  ? 'text-green-600 dark:text-green-400 border-green-500/50'
                                  : 'text-red-600 dark:text-red-400 border-red-500/50'
                              }`}
                            >
                              {marketData.crypto.ethereum.changePercent >= 0 ? '+' : ''}
                              {marketData.crypto.ethereum.changePercent.toFixed(2)}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Ethereum (ETH)</p>
                      </div>

                      {/* XRP */}
                      <div>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-xl font-bold text-foreground">
                            {marketData.crypto.xrp.value > 0 ? (
                              `$${marketData.crypto.xrp.value.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                            ) : (
                              <span className="text-muted-foreground text-sm">Loading...</span>
                            )}
                          </span>
                          {marketData.crypto.xrp.changePercent !== undefined && marketData.crypto.xrp.value > 0 && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                marketData.crypto.xrp.changePercent >= 0
                                  ? 'text-green-600 dark:text-green-400 border-green-500/50'
                                  : 'text-red-600 dark:text-red-400 border-red-500/50'
                              }`}
                            >
                              {marketData.crypto.xrp.changePercent >= 0 ? '+' : ''}
                              {marketData.crypto.xrp.changePercent.toFixed(2)}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">XRP</p>
                      </div>
                    </div>
                  </div>

                  {/* Commodities Section */}
                  <div className="mt-6 pt-6 border-t border-slate-700">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-4">Commodities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {/* Gold */}
                      <div>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-xl font-bold text-foreground">
                            {marketData.commodities.gold.value > 0 ? (
                              `$${marketData.commodities.gold.value.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                            ) : (
                              <span className="text-muted-foreground text-sm">Loading...</span>
                            )}
                          </span>
                          {marketData.commodities.gold.changePercent !== undefined && marketData.commodities.gold.value > 0 && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                marketData.commodities.gold.changePercent >= 0
                                  ? 'text-green-600 dark:text-green-400 border-green-500/50'
                                  : 'text-red-600 dark:text-red-400 border-red-500/50'
                              }`}
                            >
                              {marketData.commodities.gold.changePercent >= 0 ? '+' : ''}
                              {marketData.commodities.gold.changePercent.toFixed(2)}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Gold (XAU/USD)</p>
                      </div>

                      {/* Silver */}
                      <div>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-xl font-bold text-foreground">
                            {marketData.commodities.silver.value > 0 ? (
                              `$${marketData.commodities.silver.value.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                            ) : (
                              <span className="text-muted-foreground text-sm">Loading...</span>
                            )}
                          </span>
                          {marketData.commodities.silver.changePercent !== undefined && marketData.commodities.silver.value > 0 && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                marketData.commodities.silver.changePercent >= 0
                                  ? 'text-green-600 dark:text-green-400 border-green-500/50'
                                  : 'text-red-600 dark:text-red-400 border-red-500/50'
                              }`}
                            >
                              {marketData.commodities.silver.changePercent >= 0 ? '+' : ''}
                              {marketData.commodities.silver.changePercent.toFixed(2)}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Silver (XAG/USD)</p>
                      </div>

                      {/* Oil */}
                      <div>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-xl font-bold text-foreground">
                            {marketData.commodities.oil.value > 0 ? (
                              `$${marketData.commodities.oil.value.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                            ) : (
                              <span className="text-muted-foreground text-sm">Loading...</span>
                            )}
                          </span>
                          {marketData.commodities.oil.changePercent !== undefined && marketData.commodities.oil.value > 0 && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                marketData.commodities.oil.changePercent >= 0
                                  ? 'text-green-600 dark:text-green-400 border-green-500/50'
                                  : 'text-red-600 dark:text-red-400 border-red-500/50'
                              }`}
                            >
                              {marketData.commodities.oil.changePercent >= 0 ? '+' : ''}
                              {marketData.commodities.oil.changePercent.toFixed(2)}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Oil (WTI)</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Crash Risk Score */}
              <EnhancedCrashRiskCard />

              {/* VIX Level */}
              <KPICard
                title="VIX Level"
                value={marketData.vix.value}
                changePercent={marketData.vix.changePercent}
                threshold={{
                  warning: 20,
                  critical: 30,
                }}
                formatValue={(value) => value.toFixed(1)}
                unit="Volatility Index"
                invertThresholds={true}
                className="bg-slate-800/50 backdrop-blur-sm"
              />
            </>
          )}
        </div>


        {/* Tier 1 Crash Indicators */}
        <div className="mt-4 lg:mt-8">
          <IndicatorGrid />
        </div>

        {/* High Impact USD News */}
        <div className="mt-4 lg:mt-8">
          <HighImpactNews />
        </div>

        {/* Market Sentiment */}
        <div className="mt-4 lg:mt-8">
          <MarketSentiment />
        </div>
          </div>

          {/* News Feed Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg p-4 lg:p-6 border border-slate-700 lg:sticky lg:top-24">
              <h3 className="text-lg lg:text-xl font-bold mb-4 flex items-center gap-2">
                📰 Market News
              </h3>
              <NewsFeed />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
