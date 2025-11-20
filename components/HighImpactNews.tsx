'use client';

import { useEffect, useState } from 'react';
import { Calendar, TrendingUp, AlertCircle } from 'lucide-react';

interface NewsEvent {
  date?: string;
  time?: string;
  datetime?: string;
  timestamp?: string;
  currency?: string;
  impact?: string;
  importance?: string;
  volatility?: string;
  title?: string;
  event?: string;
  name?: string;
  forecast?: string;
  previous?: string;
  country?: string;
  countryCode?: string;
  [key: string]: any; // Allow additional properties
}

interface NewsData {
  events: NewsEvent[];
  lastUpdated: string;
}

export default function HighImpactNews() {
  const [news, setNews] = useState<NewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
    // Refresh every hour
    const interval = setInterval(fetchNews, 3600000);
    return () => clearInterval(interval);
  }, []);

  const fetchNews = async () => {
    try {
      setError(null);
      const response = await fetch('/api/usd-news');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.details || errorData.error || `HTTP ${response.status}`;
        throw new Error(errorMsg);
      }
      const data = await response.json();
      
      if (data.error) {
        const errorMsg = data.details || data.error;
        setError(errorMsg);
        setNews(null);
        return;
      }
      
      setNews(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching USD news:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMsg);
      setNews(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (event: NewsEvent) => {
    const dateStr = event.date || event.datetime || event.timestamp;
    const timeStr = event.time;
    
    if (!dateStr && !timeStr) return 'TBD';
    
    try {
      let date: Date;
      if (dateStr) {
        date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          // Try parsing as timestamp
          const timestamp = parseInt(dateStr);
          if (!isNaN(timestamp)) {
            date = new Date(timestamp * 1000); // Assume seconds if small number
            if (isNaN(date.getTime())) {
              date = new Date(timestamp); // Try as milliseconds
            }
          } else {
            return dateStr; // Return as-is if can't parse
          }
        }
      } else {
        date = new Date();
      }
      
      // Format date
      const dateFormatted = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      });
      
      // Format time if available
      if (timeStr) {
        return `${dateFormatted} ${timeStr}`;
      }
      
      // Try to extract time from datetime
      if (dateStr && dateStr.includes('T')) {
        const timePart = date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
        return `${dateFormatted} ${timePart}`;
      }
      
      return dateFormatted;
    } catch {
      return dateStr || timeStr || 'TBD';
    }
  };

  const getImpactColor = (event: NewsEvent) => {
    const impact = (event.impact || event.importance || event.volatility || '').toString().toLowerCase();
    if (impact === 'high' || impact === 'h' || impact === '3') return 'bg-red-500';
    if (impact === 'medium' || impact === 'm' || impact === '2') return 'bg-orange-500';
    return 'bg-yellow-500';
  };
  
  const getImpactLabel = (event: NewsEvent) => {
    const impact = event.impact || event.importance || event.volatility || 'High';
    return impact.toString();
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-slate-700 rounded"></div>
            <div className="h-16 bg-slate-700 rounded"></div>
            <div className="h-16 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            High Impact USD News
          </h2>
        </div>
        <div className="text-center py-8">
          <p className="text-slate-400 mb-2">Unable to load news data</p>
          <p className="text-sm text-red-400 mb-4">Error: {error}</p>
          <button
            onClick={fetchNews}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!news || !news.events || news.events.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            High Impact USD News
          </h2>
        </div>
        <div className="text-center py-8">
          <p className="text-slate-400">No high impact USD events scheduled this week</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-red-400" />
          High Impact USD News
        </h2>
        <span className="text-xs text-slate-400">
          Updates hourly
        </span>
      </div>

      {/* News Events List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {news.events.map((event, index) => (
          <div
            key={index}
            className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2 h-2 rounded-full ${getImpactColor(event)}`}></span>
                  <span className="text-xs font-semibold text-red-400 uppercase">
                    {getImpactLabel(event)} Impact
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatDateTime(event)}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-100 mb-1">
                  {event.title || event.event || event.name || 'Economic Event'}
                </h3>
                {(event.forecast || event.previous) && (
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                    {event.forecast && (
                      <span>
                        <span className="text-slate-500">Forecast: </span>
                        <span className="text-slate-300">{event.forecast}</span>
                      </span>
                    )}
                    {event.previous && (
                      <span>
                        <span className="text-slate-500">Previous: </span>
                        <span className="text-slate-300">{event.previous}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <p className="text-xs text-slate-500 text-center">
          Last updated: {news.lastUpdated ? new Date(news.lastUpdated).toLocaleTimeString() : 'Unknown'}
        </p>
      </div>
    </div>
  );
}

