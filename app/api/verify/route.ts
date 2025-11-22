import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emailService } from '@/lib/emailService';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find subscriber by verification token
    const result = await db.query(
      'SELECT * FROM subscribers WHERE verification_token = $1',
      [token]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    const subscriber = result.rows[0];

    // Check if already verified
    if (subscriber.verified) {
      // Redirect to success page or return success message
      return NextResponse.redirect(
        new URL('/newsletter?verified=true&already=true', req.url)
      );
    }

    // Verify the subscriber
    await db.query(
      `UPDATE subscribers 
       SET verified = true, 
           verification_token = NULL,
           updated_at = NOW()
       WHERE id = $1`,
      [subscriber.id]
    );

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(subscriber.email, subscriber.unsubscribe_token);
      
      // Log welcome email sent
      await db.query(
        `INSERT INTO email_logs (subscriber_id, email_type, subject, status)
         VALUES ($1, 'welcome', $2, 'sent')`,
        [subscriber.id, 'Welcome to Market Crash Monitor!']
      );
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail verification if welcome email fails
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL('/newsletter?verified=true', req.url)
    );
  } catch (error) {
    console.error('Verification error:', error);
    
    return NextResponse.json(
      {
        error: 'Verification failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

