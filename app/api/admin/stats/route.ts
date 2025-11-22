import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Middleware for admin authentication
function requireAdmin(req: NextRequest): void {
  const adminKey = req.headers.get('x-admin-key');
  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    throw new Error('Unauthorized');
  }
}

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req);

    // Get subscriber statistics
    const subscriberStats = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'active') as active,
        COUNT(*) FILTER (WHERE status = 'unsubscribed') as unsubscribed,
        COUNT(*) FILTER (WHERE status = 'bounced') as bounced,
        COUNT(*) FILTER (WHERE verified = true) as verified,
        COUNT(*) FILTER (WHERE verified = false) as unverified,
        COUNT(*) FILTER (WHERE alert_subscription = true) as alert_subscribers,
        COUNT(*) FILTER (WHERE newsletter_weekly = true) as weekly_subscribers,
        COUNT(*) FILTER (WHERE newsletter_monthly = true) as monthly_subscribers
      FROM subscribers
    `);

    // Get subscription type breakdown
    const subscriptionBreakdown = await db.query(`
      SELECT 
        COUNT(*) FILTER (WHERE alert_subscription = true AND newsletter_weekly = false AND newsletter_monthly = false) as alerts_only,
        COUNT(*) FILTER (WHERE alert_subscription = false AND newsletter_weekly = true AND newsletter_monthly = false) as weekly_only,
        COUNT(*) FILTER (WHERE alert_subscription = false AND newsletter_weekly = false AND newsletter_monthly = true) as monthly_only,
        COUNT(*) FILTER (WHERE alert_subscription = true AND (newsletter_weekly = true OR newsletter_monthly = true)) as multiple
      FROM subscribers
      WHERE status = 'active' AND verified = true
    `);

    // Get recent signups (last 30 days)
    const recentSignups = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM subscribers
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // Get email log statistics
    const emailStats = await db.query(`
      SELECT 
        COUNT(*) as total_emails,
        COUNT(*) FILTER (WHERE status = 'sent') as sent,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        COUNT(*) FILTER (WHERE status = 'bounced') as bounced,
        COUNT(*) FILTER (WHERE opened_at IS NOT NULL) as opened,
        COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) as clicked
      FROM email_logs
      WHERE sent_at >= NOW() - INTERVAL '30 days'
    `);

    // Get email type breakdown
    const emailTypeStats = await db.query(`
      SELECT 
        email_type,
        COUNT(*) as count,
        COUNT(*) FILTER (WHERE status = 'sent') as sent,
        COUNT(*) FILTER (WHERE status = 'failed') as failed
      FROM email_logs
      WHERE sent_at >= NOW() - INTERVAL '30 days'
      GROUP BY email_type
      ORDER BY count DESC
    `);

    // Get newsletter statistics
    const newsletterStats = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'draft') as draft,
        COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled,
        COUNT(*) FILTER (WHERE status = 'sent') as sent
      FROM newsletters
    `);

    return NextResponse.json({
      subscribers: subscriberStats.rows[0],
      subscriptionBreakdown: subscriptionBreakdown.rows[0],
      recentSignups: recentSignups.rows,
      emails: emailStats.rows[0],
      emailTypes: emailTypeStats.rows,
      newsletters: newsletterStats.rows[0],
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

