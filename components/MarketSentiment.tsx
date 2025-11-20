'use client';

import { useEffect, useState } from 'react';

interface SentimentData {
  current: {
    score: number;
    rating: string;
    level: string;
    timestamp: number;
  };
  previous: {
    yesterday: number;
    week_ago: number;
    month_ago: number;
    year_ago: number;
  };
}

export default function MarketSentiment() {
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSentiment();
    // Refresh every hour
    const interval = setInterval(fetchSentiment, 3600000);
    return () => clearInterval(interval);
  }, []);

  const fetchSentiment = async () => {
    try {
      setError(null);
      const response = await fetch('/api/sentiment');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.details || errorData.error || `HTTP ${response.status}`;
        throw new Error(errorMsg);
      }
      const data = await response.json();
      
      // Check if data has error property
      if (data.error) {
        const errorMsg = data.details || data.error;
        console.error('API error:', errorMsg);
        setError(errorMsg);
        setSentiment(null);
        return;
      }
      
      // Validate data structure
      if (data && data.current && data.previous) {
        setSentiment(data);
        setError(null);
      } else {
        console.error('Invalid data structure:', data);
        setError('Invalid data structure received');
        setSentiment(null);
      }
    } catch (error) {
      console.error('Error fetching sentiment:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMsg);
      setSentiment(null);
    } finally {
      setLoading(false);
    }
  };

  const getColor = (score: number) => {
    if (score >= 75) return 'bg-red-500'; // Extreme Greed
    if (score >= 55) return 'bg-orange-500'; // Greed
    if (score >= 45) return 'bg-yellow-500'; // Neutral
    if (score >= 25) return 'bg-blue-500'; // Fear
    return 'bg-red-500'; // Extreme Fear (red, not green)
  };

  const getTextColor = (score: number) => {
    if (score >= 75) return 'text-red-600 dark:text-red-400'; // Extreme Greed
    if (score >= 55) return 'text-orange-600 dark:text-orange-400'; // Greed
    if (score >= 45) return 'text-yellow-600 dark:text-yellow-400'; // Neutral
    if (score >= 25) return 'text-blue-600 dark:text-blue-400'; // Fear
    return 'text-red-600 dark:text-red-400'; // Extreme Fear (red, not green)
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-1/2 mb-4"></div>
          <div className="h-20 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!sentiment || !sentiment.current || !sentiment.previous) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 shadow p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Market Sentiment</h3>
          <p className="text-slate-400 mb-2">Unable to load sentiment data</p>
          {error && (
            <p className="text-sm text-red-400 mb-2">Error: {error}</p>
          )}
          <button
            onClick={fetchSentiment}
            className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { current, previous } = sentiment;
  
  // Safely calculate change with fallback values
  const currentScore = current?.score ?? 0;
  const yesterdayScore = previous?.yesterday ?? 0;
  const change = currentScore - yesterdayScore;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-100">
          Market Sentiment
        </h2>
        <span className="text-xs text-slate-400">
          CNN Fear & Greed Index
        </span>
      </div>

      {/* Main Score Display */}
      <div className="text-center mb-6">
        <div className={`text-6xl font-bold ${getTextColor(currentScore)} mb-2`}>
          {currentScore.toFixed(2)}
        </div>
        <div className={`text-2xl font-semibold ${getTextColor(currentScore)}`}>
          {current?.level || 'Unknown'}
        </div>
        <div className="flex items-center justify-center mt-2">
          <span className={`text-sm ${change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(2)} from yesterday
          </span>
        </div>
      </div>

      {/* Visual Bar */}
      <div className="mb-6">
        <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${getColor(currentScore)} transition-all duration-500`}
            style={{ width: `${Math.min(100, Math.max(0, currentScore))}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span>Extreme Fear</span>
          <span>Neutral</span>
          <span>Extreme Greed</span>
        </div>
      </div>

      {/* Historical Comparison */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-slate-700/50 rounded p-3">
          <div className="text-xs text-slate-400 mb-1">1 Week Ago</div>
          <div className="text-lg font-semibold text-slate-100">
            {previous?.week_ago !== undefined && previous.week_ago > 0 
              ? previous.week_ago.toFixed(2) 
              : 'N/A'}
          </div>
          {previous?.week_ago !== undefined && previous.week_ago > 0 && (
            <div className={`text-xs ${
              currentScore > previous.week_ago ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
            }`}>
              {currentScore > previous.week_ago ? '↑' : '↓'} 
              {Math.abs(currentScore - previous.week_ago).toFixed(2)}
            </div>
          )}
        </div>
        
        <div className="bg-slate-700/50 rounded p-3">
          <div className="text-xs text-slate-400 mb-1">1 Month Ago</div>
          <div className="text-lg font-semibold text-slate-100">
            {previous?.month_ago !== undefined && previous.month_ago > 0 
              ? previous.month_ago.toFixed(2) 
              : 'N/A'}
          </div>
          {previous?.month_ago !== undefined && previous.month_ago > 0 && (
            <div className={`text-xs ${
              currentScore > previous.month_ago ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
            }`}>
              {currentScore > previous.month_ago ? '↑' : '↓'} 
              {Math.abs(currentScore - previous.month_ago).toFixed(2)}
            </div>
          )}
        </div>
        
        <div className="bg-slate-700/50 rounded p-3">
          <div className="text-xs text-slate-400 mb-1">1 Year Ago</div>
          <div className="text-lg font-semibold text-slate-100">
            {previous?.year_ago !== undefined && previous.year_ago > 0 
              ? previous.year_ago.toFixed(2) 
              : 'N/A'}
          </div>
          {previous?.year_ago !== undefined && previous.year_ago > 0 && (
            <div className={`text-xs ${
              currentScore > previous.year_ago ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
            }`}>
              {currentScore > previous.year_ago ? '↑' : '↓'} 
              {Math.abs(currentScore - previous.year_ago).toFixed(2)}
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800/30 rounded text-xs text-slate-300">
        <strong className="text-slate-100">What this means:</strong> When investors are greedy (high score), 
        it may signal an overheated market. When fearful (low score), it may indicate 
        buying opportunities.
      </div>
    </div>
  );
}

