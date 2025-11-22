'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Subscriber {
  id: string;
  email: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  alert_subscription: boolean;
  newsletter_weekly: boolean;
  newsletter_monthly: boolean;
  verified: boolean;
  created_at: string;
  updated_at: string;
  last_email_sent: string | null;
}

interface Newsletter {
  id: string;
  title: string;
  content: string;
  type: 'weekly' | 'monthly' | null;
  status: 'draft' | 'scheduled' | 'sent';
  scheduled_for: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Stats {
  subscribers?: {
    total: number;
    active: number;
    unsubscribed: number;
    verified: number;
    alert_subscribers: number;
    weekly_subscribers: number;
    monthly_subscribers: number;
  };
  emails?: {
    total_emails: number;
    sent: number;
    failed: number;
  };
  newsletters?: {
    total: number;
    draft: number;
    sent: number;
  };
}

type Tab = 'subscribers' | 'newsletters' | 'stats';

export default function AdminPanel() {
  const [adminKey, setAdminKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('subscribers');
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [stats, setStats] = useState<Stats>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Newsletter form
  const [newsletterForm, setNewsletterForm] = useState({
    title: '',
    content: '',
    type: 'weekly' as 'weekly' | 'monthly',
  });

  // Check if already authenticated on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('adminKey');
    if (savedKey) {
      setAdminKey(savedKey);
      setAuthenticated(true);
      loadData(savedKey);
    }
  }, []);

  const authenticate = () => {
    if (adminKey.trim()) {
      localStorage.setItem('adminKey', adminKey);
      setAuthenticated(true);
      loadData(adminKey);
    } else {
      setError('Please enter an admin key');
    }
  };

  const loadData = async (key?: string) => {
    const authKey = key || adminKey || localStorage.getItem('adminKey');
    if (!authKey) return;

    setLoading(true);
    setError('');

    try {
      // Load subscribers
      const subsRes = await fetch('/api/admin/subscribers?limit=100', {
        headers: { 'x-admin-key': authKey },
      });
      if (subsRes.ok) {
        const data = await subsRes.json();
        setSubscribers(data.subscribers || []);
      } else if (subsRes.status === 401) {
        setAuthenticated(false);
        localStorage.removeItem('adminKey');
        setError('Invalid admin key');
      }

      // Load stats
      const statsRes = await fetch('/api/admin/stats', {
        headers: { 'x-admin-key': authKey },
      });
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }

      // Load newsletters
      const newsRes = await fetch('/api/admin/newsletters?limit=50', {
        headers: { 'x-admin-key': authKey },
      });
      if (newsRes.ok) {
        const data = await newsRes.json();
        setNewsletters(data.newsletters || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createNewsletter = async () => {
    if (!newsletterForm.title.trim() || !newsletterForm.content.trim()) {
      setError('Title and content are required');
      return;
    }

    const key = localStorage.getItem('adminKey');
    if (!key) {
      setError('Not authenticated');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/newsletters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': key,
        },
        body: JSON.stringify({
          ...newsletterForm,
          status: 'draft',
        }),
      });

      if (response.ok) {
        setNewsletterForm({ title: '', content: '', type: 'weekly' });
        await loadData();
        setError('');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create newsletter');
      }
    } catch (error) {
      setError('Failed to create newsletter');
    } finally {
      setLoading(false);
    }
  };

  const sendNewsletter = async (newsletterId: string, type: string) => {
    if (
      !confirm(
        `Send this ${type} newsletter to all ${type} subscribers? This action cannot be undone.`
      )
    ) {
      return;
    }

    const key = localStorage.getItem('adminKey');
    if (!key) {
      setError('Not authenticated');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/send-newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': key,
        },
        body: JSON.stringify({ newsletterId, type }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(
          `Newsletter sent!\nSent: ${data.sent}\nFailed: ${data.failed}\nTotal: ${data.total}`
        );
        await loadData();
        setError('');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to send newsletter');
      }
    } catch (error) {
      setError('Failed to send newsletter');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminKey');
    setAuthenticated(false);
    setAdminKey('');
    setSubscribers([]);
    setNewsletters([]);
    setStats({});
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">🔐 Admin Panel</CardTitle>
            <CardDescription>
              Enter your admin key to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="admin-key" className="text-sm font-semibold">
                Admin Key
              </label>
              <input
                id="admin-key"
                type="password"
                placeholder="Enter admin key"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && authenticate()}
                className="w-full px-4 py-2 border-2 border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button onClick={authenticate} className="w-full" disabled={loading}>
              {loading ? 'Authenticating...' : 'Login'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 p-6 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">
            📊 Market Crash Monitor - Admin
          </h1>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-6 flex gap-2">
          <button
            className={cn(
              'px-6 py-4 font-semibold border-b-2 transition-colors',
              activeTab === 'subscribers'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setActiveTab('subscribers')}
          >
            Subscribers ({stats.subscribers?.total || 0})
          </button>
          <button
            className={cn(
              'px-6 py-4 font-semibold border-b-2 transition-colors',
              activeTab === 'newsletters'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setActiveTab('newsletters')}
          >
            Newsletters ({newsletters.length})
          </button>
          <button
            className={cn(
              'px-6 py-4 font-semibold border-b-2 transition-colors',
              activeTab === 'stats'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
            onClick={() => setActiveTab('stats')}
          >
            Statistics
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {loading && (
          <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
            Loading...
          </div>
        )}

        {/* Subscribers Tab */}
        {activeTab === 'subscribers' && (
          <Card>
            <CardHeader>
              <CardTitle>Subscriber Management</CardTitle>
              <CardDescription>
                Manage and view all newsletter subscribers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left p-3 font-semibold">Email</th>
                      <th className="text-left p-3 font-semibold">Status</th>
                      <th className="text-center p-3 font-semibold">Alerts</th>
                      <th className="text-center p-3 font-semibold">Weekly</th>
                      <th className="text-center p-3 font-semibold">Monthly</th>
                      <th className="text-center p-3 font-semibold">Verified</th>
                      <th className="text-left p-3 font-semibold">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                          No subscribers found
                        </td>
                      </tr>
                    ) : (
                      subscribers.map((sub) => (
                        <tr
                          key={sub.id}
                          className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        >
                          <td className="p-3">{sub.email}</td>
                          <td className="p-3">
                            <Badge
                              variant={
                                sub.status === 'active'
                                  ? 'default'
                                  : sub.status === 'unsubscribed'
                                  ? 'destructive'
                                  : 'outline'
                              }
                            >
                              {sub.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-center">
                            {sub.alert_subscription ? '✅' : '❌'}
                          </td>
                          <td className="p-3 text-center">
                            {sub.newsletter_weekly ? '✅' : '❌'}
                          </td>
                          <td className="p-3 text-center">
                            {sub.newsletter_monthly ? '✅' : '❌'}
                          </td>
                          <td className="p-3 text-center">
                            {sub.verified ? '✅' : '⏳'}
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {new Date(sub.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Newsletters Tab */}
        {activeTab === 'newsletters' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Newsletter</CardTitle>
                <CardDescription>
                  Create a new newsletter to send to subscribers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="type" className="text-sm font-semibold">
                    Type
                  </label>
                  <select
                    id="type"
                    value={newsletterForm.type}
                    onChange={(e) =>
                      setNewsletterForm({
                        ...newsletterForm,
                        type: e.target.value as 'weekly' | 'monthly',
                      })
                    }
                    className="w-full px-4 py-2 border-2 border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-semibold">
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={newsletterForm.title}
                    onChange={(e) =>
                      setNewsletterForm({ ...newsletterForm, title: e.target.value })
                    }
                    placeholder="Newsletter title"
                    className="w-full px-4 py-2 border-2 border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="content" className="text-sm font-semibold">
                    Content (HTML)
                  </label>
                  <textarea
                    id="content"
                    value={newsletterForm.content}
                    onChange={(e) =>
                      setNewsletterForm({ ...newsletterForm, content: e.target.value })
                    }
                    rows={10}
                    placeholder="Newsletter HTML content"
                    className="w-full px-4 py-2 border-2 border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm"
                  />
                </div>
                <Button onClick={createNewsletter} disabled={loading}>
                  Create Newsletter
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Past Newsletters</CardTitle>
                <CardDescription>
                  View and manage existing newsletters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {newsletters.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No newsletters found
                    </p>
                  ) : (
                    newsletters.map((newsletter) => (
                      <div
                        key={newsletter.id}
                        className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{newsletter.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Type: {newsletter.type || 'N/A'} | Status:{' '}
                              <Badge
                                variant={
                                  newsletter.status === 'sent'
                                    ? 'default'
                                    : newsletter.status === 'draft'
                                    ? 'outline'
                                    : 'secondary'
                                }
                              >
                                {newsletter.status}
                              </Badge>
                            </p>
                            {newsletter.sent_at && (
                              <p className="text-sm text-muted-foreground">
                                Sent: {new Date(newsletter.sent_at).toLocaleString()}
                              </p>
                            )}
                          </div>
                          {newsletter.status === 'draft' && newsletter.type && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                sendNewsletter(newsletter.id, newsletter.type!)
                              }
                              disabled={loading}
                            >
                              Send Now
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Subscribers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary">
                  {stats.subscribers?.total || 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-green-600">
                  {stats.subscribers?.active || 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Verified</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-blue-600">
                  {stats.subscribers?.verified || 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alert Subscribers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-orange-600">
                  {stats.subscribers?.alert_subscribers || 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Weekly Newsletter</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-purple-600">
                  {stats.subscribers?.weekly_subscribers || 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Monthly Newsletter</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-pink-600">
                  {stats.subscribers?.monthly_subscribers || 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Emails Sent (30d)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-indigo-600">
                  {stats.emails?.sent || 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Failed Emails (30d)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-red-600">
                  {stats.emails?.failed || 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Newsletters</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-teal-600">
                  {stats.newsletters?.total || 0}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {stats.newsletters?.draft || 0} draft, {stats.newsletters?.sent || 0} sent
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

