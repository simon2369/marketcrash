import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emailService } from '@/lib/emailService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      email, 
      alertSubscription = false, 
      weeklyNewsletter = false, 
      monthlyNewsletter = false 
    } = body;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Validate at least one subscription type is selected
    if (!alertSubscription && !weeklyNewsletter && !monthlyNewsletter) {
      return NextResponse.json(
        { error: 'Please select at least one subscription type' },
        { status: 400 }
      );
    }

    // Check if subscriber already exists
    const existing = await db.query(
      'SELECT * FROM subscribers WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      const subscriber = existing.rows[0];
      
      // Update existing subscription
      await db.query(
        `UPDATE subscribers 
         SET alert_subscription = $1, 
             newsletter_weekly = $2, 
             newsletter_monthly = $3,
             status = 'active',
             updated_at = NOW()
         WHERE email = $4`,
        [alertSubscription, weeklyNewsletter, monthlyNewsletter, email]
      );

      // If not verified, send verification email again
      if (!subscriber.verified) {
        if (subscriber.verification_token) {
          await emailService.sendVerificationEmail(email, subscriber.verification_token);
        } else {
          // Generate new verification token if missing
          const verificationToken = emailService.generateToken();
          await db.query(
            'UPDATE subscribers SET verification_token = $1 WHERE email = $2',
            [verificationToken, email]
          );
          await emailService.sendVerificationEmail(email, verificationToken);
        }
      }

      return NextResponse.json({
        message: 'Subscription updated successfully',
        alreadyVerified: subscriber.verified,
        verified: subscriber.verified,
      });
    }

    // Create new subscriber
    const verificationToken = emailService.generateToken();
    const unsubscribeToken = emailService.generateToken();

    const result = await db.query(
      `INSERT INTO subscribers 
       (email, alert_subscription, newsletter_weekly, newsletter_monthly, 
        verification_token, unsubscribe_token, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'active')
       RETURNING id`,
      [
        email,
        alertSubscription,
        weeklyNewsletter,
        monthlyNewsletter,
        verificationToken,
        unsubscribeToken,
      ]
    );

    const subscriberId = result.rows[0].id;

    // Send verification email
    let emailSent = false;
    let emailError: string | null = null;
    try {
      const messageId = await emailService.sendVerificationEmail(email, verificationToken);
      
      // Log email sent
      await db.query(
        `INSERT INTO email_logs (subscriber_id, email_type, subject, status, mailgun_id)
         VALUES ($1, 'verification', $2, 'sent', $3)`,
        [subscriberId, 'Verify your subscription to Market Crash Monitor', messageId || null]
      );
      emailSent = true;
      console.log(`✅ Verification email sent to ${email} (Message ID: ${messageId})`);
    } catch (error) {
      emailError = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Failed to send verification email:', error);
      
      // Log email failure
      try {
        await db.query(
          `INSERT INTO email_logs (subscriber_id, email_type, subject, status, error_message)
           VALUES ($1, 'verification', $2, 'failed', $3)`,
          [
            subscriberId,
            'Verify your subscription to Market Crash Monitor',
            emailError,
          ]
        );
      } catch (logError) {
        console.error('Failed to log email error:', logError);
      }
      
      // Don't fail the subscription if email fails - user can request resend
    }

    return NextResponse.json({
      message: emailSent 
        ? 'Subscription successful! Please check your email to verify.'
        : 'Subscription successful! However, the verification email could not be sent. Please contact support.',
      success: true,
      verified: false,
      emailSent,
      emailError: emailError || undefined,
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Provide more specific error messages
    let errorMessage = 'Failed to subscribe';
    if (error instanceof Error) {
      if (error.message.includes('connection') || error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Database connection failed. Please try again later.';
      } else if (error.message.includes('duplicate') || error.message.includes('unique')) {
        errorMessage = 'This email is already subscribed.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      {
        error: errorMessage,
        message: error instanceof Error ? error.message : 'Unknown error',
        details: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.stack : undefined)
          : undefined,
      },
      { status: 500 }
    );
  }
}

