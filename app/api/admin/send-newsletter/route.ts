import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/emailService';
import { db } from '@/lib/db';

// Middleware for admin authentication
function requireAdmin(req: NextRequest): void {
  const adminKey = req.headers.get('x-admin-key');
  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    throw new Error('Unauthorized');
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAdmin(req);

    const body = await req.json();
    const { newsletterId, type } = body;

    if (!newsletterId) {
      return NextResponse.json(
        { error: 'Newsletter ID is required' },
        { status: 400 }
      );
    }

    if (!type || (type !== 'weekly' && type !== 'monthly')) {
      return NextResponse.json(
        { error: 'Type must be "weekly" or "monthly"' },
        { status: 400 }
      );
    }

    // Get newsletter content
    const newsletterResult = await db.query(
      'SELECT * FROM newsletters WHERE id = $1',
      [newsletterId]
    );

    if (newsletterResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Newsletter not found' },
        { status: 404 }
      );
    }

    const newsletter = newsletterResult.rows[0];

    // Check if newsletter is already sent
    if (newsletter.status === 'sent') {
      return NextResponse.json(
        { error: 'Newsletter has already been sent' },
        { status: 400 }
      );
    }

    // Get subscribers based on type
    const subscribersQuery =
      type === 'weekly'
        ? `SELECT * FROM subscribers 
           WHERE newsletter_weekly = true 
           AND verified = true 
           AND status = $1`
        : `SELECT * FROM subscribers 
           WHERE newsletter_monthly = true 
           AND verified = true 
           AND status = $1`;

    const subscribers = await db.query(subscribersQuery, ['active']);

    if (subscribers.rows.length === 0) {
      return NextResponse.json(
        { error: 'No active subscribers found for this newsletter type' },
        { status: 400 }
      );
    }

    // Send emails (in batches to avoid rate limits)
    const batchSize = parseInt(process.env.EMAIL_BATCH_SIZE || '100', 10);
    const batchDelay = parseInt(process.env.EMAIL_BATCH_DELAY || '1000', 10); // milliseconds
    let sentCount = 0;
    let failedCount = 0;
    const errors: Array<{ email: string; error: string }> = [];

    for (let i = 0; i < subscribers.rows.length; i += batchSize) {
      const batch = subscribers.rows.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (subscriber) => {
          try {
            const result = await emailService.sendNewsletterEmail(
              subscriber,
              newsletter
            );

            // Log email attempt
            await db.query(
              `INSERT INTO email_logs (subscriber_id, email_type, subject, status, mailgun_id)
               VALUES ($1, $2, $3, $4, $5)`,
              [
                subscriber.id,
                `newsletter_${type}`,
                newsletter.title,
                result.success ? 'sent' : 'failed',
                result.messageId || null,
              ]
            );

            // Update last_email_sent timestamp
            if (result.success) {
              await db.query(
                `UPDATE subscribers 
                 SET last_email_sent = NOW() 
                 WHERE id = $1`,
                [subscriber.id]
              );
              sentCount++;
            } else {
              failedCount++;
              errors.push({
                email: subscriber.email,
                error: result.error || 'Unknown error',
              });
            }
          } catch (error) {
            console.error(`Failed to send to ${subscriber.email}:`, error);

            // Log failed email
            try {
              await db.query(
                `INSERT INTO email_logs (subscriber_id, email_type, subject, status, error_message)
                 VALUES ($1, $2, $3, $4, $5)`,
                [
                  subscriber.id,
                  `newsletter_${type}`,
                  newsletter.title,
                  'failed',
                  error instanceof Error ? error.message : 'Unknown error',
                ]
              );
            } catch (logError) {
              console.error('Failed to log email error:', logError);
            }

            failedCount++;
            errors.push({
              email: subscriber.email,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        })
      );

      // Delay between batches to respect rate limits
      if (i + batchSize < subscribers.rows.length) {
        await new Promise((resolve) => setTimeout(resolve, batchDelay));
      }
    }

    // Update newsletter status
    await db.query(
      `UPDATE newsletters 
       SET status = 'sent', sent_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [newsletterId]
    );

    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
      total: subscribers.rows.length,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined, // Return first 10 errors
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Send newsletter error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send newsletter',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

