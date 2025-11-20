'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useMarketNews } from '@/hooks/use-market-news';
import { MarketNewsArticle } from '@/lib/api/marketData';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * Get sentiment badge variant and icon
 */
function getSentimentBadge(sentiment: 'positive' | 'negative' | 'neutral') {
  switch (sentiment) {
    case 'positive':
      return {
        variant: 'default' as const,
        className: 'bg-green-500/20 text-green-400 border-green-500/30',
        icon: TrendingUp,
        label: 'Positive',
      };
    case 'negative':
      return {
        variant: 'destructive' as const,
        className: 'bg-red-500/20 text-red-400 border-red-500/30',
        icon: TrendingDown,
        label: 'Negative',
      };
    default:
      return {
        variant: 'secondary' as const,
        className: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
        icon: Minus,
        label: 'Neutral',
      };
  }
}

/**
 * Format timestamp to relative time
 */
function formatTimestamp(timestamp: number): string {
  try {
    const date = new Date(timestamp * 1000);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'Unknown time';
  }
}

/**
 * News article card component
 */
function NewsArticleCard({ article }: { article: MarketNewsArticle }) {
  const sentimentBadge = getSentimentBadge(article.sentiment);
  const SentimentIcon = sentimentBadge.icon;

  return (
    <Card className="border-slate-700 bg-slate-800/50 hover:bg-slate-800/70 transition-colors">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Thumbnail */}
          {article.image && (
            <div className="flex-shrink-0">
              <img
                src={article.image}
                alt={article.headline}
                className="w-24 h-24 object-cover rounded-lg border border-slate-700"
                onError={(e) => {
                  // Hide image on error
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header with sentiment badge */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 group"
              >
                <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                  {article.headline}
                </h3>
              </a>
              <Badge
                variant={sentimentBadge.variant}
                className={`${sentimentBadge.className} flex items-center gap-1 text-xs`}
              >
                <SentimentIcon className="w-3 h-3" />
                <span className="hidden sm:inline">{sentimentBadge.label}</span>
              </Badge>
            </div>

            {/* Summary */}
            {article.summary && (
              <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                {article.summary}
              </p>
            )}

            {/* Footer with source and timestamp */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="font-medium">{article.source}</span>
                <span>•</span>
                <span>{formatTimestamp(article.datetime)}</span>
              </div>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <span className="hidden sm:inline">Read</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for news articles
 */
function NewsSkeleton() {
  return (
    <Card className="border-slate-700 bg-slate-800/50">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * News Feed Component
 * Displays market news articles with sentiment analysis
 */
export function NewsFeed() {
  const { data, isLoading, error } = useMarketNews();
  const [visibleCount, setVisibleCount] = useState(5);

  const articles = data || [];
  const visibleArticles = articles.slice(0, visibleCount);
  const hasMore = articles.length > visibleCount;

  return (
    <div className="w-full">
      {/* Error State */}
      {error && (
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="p-4">
            <p className="text-sm text-red-400">
              Error loading news: {error.message}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <NewsSkeleton key={i} />
          ))}
        </div>
      )}

      {/* News Articles */}
      {!isLoading && !error && (
        <>
          {articles.length === 0 ? (
            <Card className="border-slate-700 bg-slate-800/50">
              <CardContent className="p-6 text-center">
                <p className="text-slate-400">No news articles available at this time.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {visibleArticles.map((article) => (
                <NewsArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                onClick={() => setVisibleCount((prev) => Math.min(prev + 5, articles.length))}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Load More ({articles.length - visibleCount} remaining)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

