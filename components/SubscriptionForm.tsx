'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Preferences {
  alerts: boolean;
  weeklyNewsletter: boolean;
  monthlyNewsletter: boolean;
}

interface Status {
  type: 'success' | 'error' | '';
  message: string;
}

export default function SubscriptionForm() {
  const [email, setEmail] = useState('');
  const [unsubscribeEmail, setUnsubscribeEmail] = useState('');
  const [showUnsubscribe, setShowUnsubscribe] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>({
    alerts: true,
    weeklyNewsletter: false,
    monthlyNewsletter: false,
  });
  const [status, setStatus] = useState<Status>({ type: '', message: '' });
  const [unsubscribeStatus, setUnsubscribeStatus] = useState<Status>({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [unsubscribeLoading, setUnsubscribeLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          alertSubscription: preferences.alerts,
          weeklyNewsletter: preferences.weeklyNewsletter,
          monthlyNewsletter: preferences.monthlyNewsletter,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: 'success',
          message: data.message || 'Subscription successful! Please check your email to verify.',
        });
        setEmail('');
        // Reset preferences after successful subscription
        setPreferences({
          alerts: false,
          weeklyNewsletter: false,
          monthlyNewsletter: false,
        });
      } else {
        setStatus({
          type: 'error',
          message: data.error || 'Subscription failed. Please try again.',
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Network error. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnsubscribeLoading(true);
    setUnsubscribeStatus({ type: '', message: '' });

    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: unsubscribeEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setUnsubscribeStatus({
          type: 'success',
          message: data.message || 'Successfully unsubscribed.',
        });
        setUnsubscribeEmail('');
        setTimeout(() => {
          setShowUnsubscribe(false);
          setUnsubscribeStatus({ type: '', message: '' });
        }, 3000);
      } else {
        setUnsubscribeStatus({
          type: 'error',
          message: data.error || 'Unsubscribe failed. Please try again.',
        });
      }
    } catch (error) {
      setUnsubscribeStatus({
        type: 'error',
        message: 'Network error. Please try again.',
      });
    } finally {
      setUnsubscribeLoading(false);
    }
  };

  const hasAnyPreference = Object.values(preferences).some((v) => v);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">📬 Stay Informed</CardTitle>
          <CardDescription>
            Get market alerts and insights delivered to your inbox
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showUnsubscribe ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-foreground"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={loading}
                  className="w-full px-4 py-2 border-2 border-input rounded-lg text-base bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">
                  What would you like to receive?
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label
                    className={cn(
                      'flex flex-col gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all',
                      'border-border hover:border-primary hover:bg-accent/50',
                      loading && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={preferences.alerts}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            alerts: e.target.checked,
                          })
                        }
                        disabled={loading}
                        className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer disabled:cursor-not-allowed"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="font-semibold text-foreground">
                          🚨 Real-time Alerts
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Instant notifications when crash indicators are triggered
                        </div>
                      </div>
                    </div>
                  </label>

                  <label
                    className={cn(
                      'flex flex-col gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all',
                      'border-border hover:border-primary hover:bg-accent/50',
                      loading && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={preferences.weeklyNewsletter}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            weeklyNewsletter: e.target.checked,
                          })
                        }
                        disabled={loading}
                        className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer disabled:cursor-not-allowed"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="font-semibold text-foreground">
                          📈 Weekly Newsletter
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Market analysis and key indicators summary
                        </div>
                      </div>
                    </div>
                  </label>

                  <label
                    className={cn(
                      'flex flex-col gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all',
                      'border-border hover:border-primary hover:bg-accent/50',
                      loading && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={preferences.monthlyNewsletter}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            monthlyNewsletter: e.target.checked,
                          })
                        }
                        disabled={loading}
                        className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer disabled:cursor-not-allowed"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="font-semibold text-foreground">
                          📊 Monthly Deep Dive
                        </div>
                        <div className="text-xs text-muted-foreground">
                          In-depth market analysis and trends
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {status.message && (
                <div
                  className={cn(
                    'p-3 rounded-lg text-sm',
                    status.type === 'success' &&
                      'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800',
                    status.type === 'error' &&
                      'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
                  )}
                >
                  {status.message}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !hasAnyPreference}
              >
                {loading ? 'Subscribing...' : 'Subscribe'}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                We respect your privacy.{' '}
                <button
                  type="button"
                  onClick={() => setShowUnsubscribe(true)}
                  className="text-primary hover:underline font-medium"
                >
                  Unsubscribe
                </button>
                {' '}anytime using the link in our emails.
              </p>
            </form>
          ) : (
            <form onSubmit={handleUnsubscribe} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="unsubscribe-email"
                  className="text-sm font-semibold text-foreground"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="unsubscribe-email"
                  value={unsubscribeEmail}
                  onChange={(e) => setUnsubscribeEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={unsubscribeLoading}
                  className="w-full px-4 py-2 border-2 border-input rounded-lg text-base bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                />
              </div>

              {unsubscribeStatus.message && (
                <div
                  className={cn(
                    'p-3 rounded-lg text-sm',
                    unsubscribeStatus.type === 'success' &&
                      'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800',
                    unsubscribeStatus.type === 'error' &&
                      'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
                  )}
                >
                  {unsubscribeStatus.message}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="submit"
                  variant="destructive"
                  className="flex-1"
                  disabled={unsubscribeLoading || !unsubscribeEmail}
                >
                  {unsubscribeLoading ? 'Unsubscribing...' : 'Unsubscribe'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowUnsubscribe(false);
                    setUnsubscribeEmail('');
                    setUnsubscribeStatus({ type: '', message: '' });
                  }}
                  disabled={unsubscribeLoading}
                >
                  Cancel
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                You can also use the unsubscribe link in any email we send you.
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

