import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    // Allow unsubscribe via token or email (for convenience)
    if (!token && !email) {
      return NextResponse.json(
        { error: 'Unsubscribe token or email is required' },
        { status: 400 }
      );
    }

    let query: string;
    let params: string[];

    if (token) {
      query = 'SELECT * FROM subscribers WHERE unsubscribe_token = $1';
      params = [token];
    } else {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email!)) {
        return NextResponse.json(
          { error: 'Invalid email address' },
          { status: 400 }
        );
      }
      query = 'SELECT * FROM subscribers WHERE email = $1';
      params = [email!];
    }

    // Find subscriber
    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      // Return a user-friendly error page instead of JSON (scroll to subscription form)
      const errorUrl = new URL('/newsletter', req.url);
      errorUrl.searchParams.set('unsubscribe_error', 'not_found');
      errorUrl.hash = 'subscription-form';
      return NextResponse.redirect(errorUrl);
    }

    const subscriber = result.rows[0];

    // Check if already unsubscribed
    if (subscriber.status === 'unsubscribed') {
      return NextResponse.redirect(
        new URL('/newsletter?unsubscribed=true&already=true#subscription-form', req.url)
      );
    }

    // Unsubscribe the subscriber
    await db.query(
      `UPDATE subscribers 
       SET status = 'unsubscribed',
           alert_subscription = false,
           newsletter_weekly = false,
           newsletter_monthly = false,
           updated_at = NOW()
       WHERE id = $1`,
      [subscriber.id]
    );

    // Log unsubscribe action
    try {
      await db.query(
        `INSERT INTO email_logs (subscriber_id, email_type, subject, status)
         VALUES ($1, 'unsubscribe', $2, 'sent')`,
        [subscriber.id, 'Unsubscribed from Market Crash Monitor']
      );
    } catch (logError) {
      console.error('Failed to log unsubscribe action:', logError);
      // Don't fail the unsubscribe if logging fails
    }

    // Redirect to confirmation page (scroll to subscription form)
    return NextResponse.redirect(
      new URL('/newsletter?unsubscribed=true#subscription-form', req.url)
    );
  } catch (error) {
    console.error('Unsubscribe error:', error);
    
    // Redirect to error page instead of JSON for GET requests (scroll to subscription form)
    const errorUrl = new URL('/newsletter', req.url);
    errorUrl.searchParams.set('unsubscribe_error', 'server_error');
    errorUrl.hash = 'subscription-form';
    return NextResponse.redirect(errorUrl);
  }
}

// POST method for programmatic unsubscribe
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, email } = body;

    if (!token && !email) {
      return NextResponse.json(
        { error: 'Unsubscribe token or email is required' },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email address' },
          { status: 400 }
        );
      }
    }

    let query: string;
    let params: string[];

    if (token) {
      query = 'SELECT * FROM subscribers WHERE unsubscribe_token = $1';
      params = [token];
    } else {
      query = 'SELECT * FROM subscribers WHERE email = $1';
      params = [email];
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      );
    }

    const subscriber = result.rows[0];

    // Check if already unsubscribed
    if (subscriber.status === 'unsubscribed') {
      return NextResponse.json({
        message: 'Already unsubscribed',
        success: true,
        alreadyUnsubscribed: true,
      });
    }

    // Unsubscribe the subscriber
    await db.query(
      `UPDATE subscribers 
       SET status = 'unsubscribed',
           alert_subscription = false,
           newsletter_weekly = false,
           newsletter_monthly = false,
           updated_at = NOW()
       WHERE id = $1`,
      [subscriber.id]
    );

    // Log unsubscribe action
    try {
      await db.query(
        `INSERT INTO email_logs (subscriber_id, email_type, subject, status)
         VALUES ($1, 'unsubscribe', $2, 'sent')`,
        [subscriber.id, 'Unsubscribed from Market Crash Monitor']
      );
    } catch (logError) {
      console.error('Failed to log unsubscribe action:', logError);
      // Don't fail the unsubscribe if logging fails
    }

    return NextResponse.json({
      message: 'Successfully unsubscribed',
      success: true,
      email: subscriber.email,
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    
    return NextResponse.json(
      {
        error: 'Unsubscribe failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

