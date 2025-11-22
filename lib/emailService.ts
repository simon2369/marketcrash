/**
 * Email Service
 * Handles sending emails for subscriptions, verifications, and newsletters
 * 
 * Note: You'll need to configure an email service provider (Mailgun, SendGrid, etc.)
 * and set the appropriate environment variables.
 */

import crypto from 'crypto';

// Email service configuration
const EMAIL_FROM = process.env.MAILGUN_FROM_EMAIL || process.env.EMAIL_FROM || 'noreply@marketcrashmonitor.com';

// Get base URL - prioritize explicit setting, then Vercel URL, then default to production domain
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Default to production domain
  return 'https://marketcrashmonitor.com';
};

const BASE_URL = getBaseUrl();

/**
 * Generate a secure random token
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Send verification email to subscriber
 * Returns the message ID from Mailgun
 */
export async function sendVerificationEmail(
  email: string,
  verificationToken: string
): Promise<string | undefined> {
  const verificationUrl = `${BASE_URL}/api/verify?token=${verificationToken}`;
  
  const subject = 'Verify your subscription to Market Crash Monitor';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Subscription</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">Verify Your Subscription</h1>
        <p>Thank you for subscribing to Market Crash Monitor!</p>
        <p>Please click the button below to verify your email address:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p>If you didn't subscribe to this newsletter, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #666;">
          Market Crash Monitor<br>
          <a href="${BASE_URL}">${BASE_URL}</a>
        </p>
      </body>
    </html>
  `;
  
  const text = `
    Verify Your Subscription
    
    Thank you for subscribing to Market Crash Monitor!
    
    Please click the link below to verify your email address:
    ${verificationUrl}
    
    If you didn't subscribe to this newsletter, you can safely ignore this email.
    
    Market Crash Monitor
    ${BASE_URL}
  `;

  return await sendEmail(email, subject, html, text);
}

/**
 * Send welcome email after verification
 */
export async function sendWelcomeEmail(
  email: string,
  unsubscribeToken: string
): Promise<void> {
  const unsubscribeUrl = `${BASE_URL}/api/unsubscribe?token=${unsubscribeToken}`;
  const subject = 'Welcome to Market Crash Monitor!';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">Welcome to Market Crash Monitor!</h1>
        <p>Your email has been verified successfully.</p>
        <p>You'll now receive our market crash indicators and analysis to help you stay informed about potential market risks.</p>
        <p>Thank you for joining us!</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #666; text-align: center;">
          <a href="${BASE_URL}" style="color: #2563eb; text-decoration: none;">Market Crash Monitor</a><br>
          <a href="${BASE_URL}">${BASE_URL}</a><br><br>
          <a href="${unsubscribeUrl}" style="color: #666; text-decoration: underline;">Unsubscribe</a>
        </p>
      </body>
    </html>
  `;
  
  const text = `
    Welcome to Market Crash Monitor!
    
    Your email has been verified successfully.
    
    You'll now receive our market crash indicators and analysis to help you stay informed about potential market risks.
    
    Thank you for joining us!
    
    ---
    Market Crash Monitor
    ${BASE_URL}
    
    Unsubscribe: ${unsubscribeUrl}
  `;

  await sendEmail(email, subject, html, text);
}

/**
 * Send newsletter email to subscriber
 */
export async function sendNewsletterEmail(
  subscriber: {
    id: string;
    email: string;
    unsubscribe_token: string;
  },
  newsletter: {
    id: string;
    title: string;
    content: string;
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const unsubscribeUrl = `${BASE_URL}/api/unsubscribe?token=${subscriber.unsubscribe_token}`;
  
  const subject = newsletter.title;
  
  // Wrap newsletter content in HTML template with unsubscribe link
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${newsletter.title}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
          <h1 style="color: #2563eb; margin-top: 0;">Market Crash Monitor</h1>
        </div>
        
        <div style="margin-bottom: 30px;">
          ${newsletter.content}
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #666; text-align: center;">
          <a href="${BASE_URL}">Market Crash Monitor</a><br>
          <a href="${unsubscribeUrl}" style="color: #666;">Unsubscribe</a>
        </p>
      </body>
    </html>
  `;
  
  // Create plain text version (strip HTML tags for basic text)
  const text = `
    ${newsletter.title}
    
    ${newsletter.content.replace(/<[^>]*>/g, '').replace(/\n\s*\n/g, '\n\n')}
    
    ---
    Market Crash Monitor
    ${BASE_URL}
    
    Unsubscribe: ${unsubscribeUrl}
  `;

  try {
    const messageId = await sendEmail(subscriber.email, subject, html, text);
    return { success: true, messageId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Core email sending function using Mailgun
 * Returns message ID if successful
 */
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<string | undefined> {
  // Support both MAILGUN_API_KEY (private key) and MAILGUN_SENDING_KEY (sending key)
  const mailgunApiKey = process.env.MAILGUN_SENDING_KEY || process.env.MAILGUN_API_KEY;
  const mailgunDomain = process.env.MAILGUN_DOMAIN;
  
  // Check if Mailgun is configured
  if (!mailgunApiKey || !mailgunDomain) {
    // Fallback to development mode if not configured
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email would be sent (Mailgun not configured):');
      console.log(`   To: ${to}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Preview: ${text.substring(0, 100)}...`);
      return 'dev-message-id';
    }
    throw new Error('Mailgun API key or domain not configured. Please set MAILGUN_API_KEY (or MAILGUN_SENDING_KEY) and MAILGUN_DOMAIN environment variables.');
  }
  
  // Use FormData for Mailgun API
  const formData = new URLSearchParams();
  formData.append('from', EMAIL_FROM);
  formData.append('to', to);
  formData.append('subject', subject);
  formData.append('html', html);
  formData.append('text', text);
  
  try {
    const response = await fetch(
      `https://api.mailgun.net/v3/${mailgunDomain}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${mailgunApiKey}`).toString('base64')}`,
        },
        body: formData,
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Mailgun API error: ${response.status}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
        
        // Check for common Mailgun sandbox errors
        if (errorMessage.includes('sandbox') || errorMessage.includes('authorized')) {
          errorMessage = `Mailgun Sandbox Error: This email address is not authorized. Please add ${to} to your Mailgun authorized recipients list. Original error: ${errorMessage}`;
        }
      } catch {
        errorMessage = `${errorMessage} - ${errorText}`;
      }
      
      console.error(`❌ Mailgun API Error (${response.status}):`, errorMessage);
      console.error('Full response:', errorText);
      
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    const messageId = result.id || result.message?.id;
    
    console.log(`✅ Email sent successfully to ${to} (Message ID: ${messageId})`);
    
    return messageId;
  } catch (error) {
    console.error('Mailgun API error:', error);
    throw error;
  }
}

/**
 * Send contact form email
 */
export async function sendContactEmail(
  name: string,
  email: string,
  subject: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const contactEmail = 'marketcrashmonitor@proton.me';
  const emailSubject = `Contact Form: ${subject}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contact Form Submission</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">New Contact Form Submission</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Subject:</strong> ${subject}</p>
        </div>
        <div style="background: #ffffff; padding: 20px; border-left: 4px solid #2563eb; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2563eb;">Message:</h3>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #666;">
          This message was sent from the Market Crash Monitor contact form.<br>
          Reply directly to this email to respond to ${name} at ${email}.
        </p>
      </body>
    </html>
  `;
  
  const text = `
New Contact Form Submission

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
This message was sent from the Market Crash Monitor contact form.
Reply directly to this email to respond to ${name} at ${email}.
  `;

  try {
    const messageId = await sendEmail(contactEmail, emailSubject, html, text);
    
    // Also send a confirmation email to the user
    try {
      const confirmationSubject = 'We received your message - Market Crash Monitor';
      const confirmationHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Message Received</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Thank you for contacting us!</h2>
            <p>Hi ${name},</p>
            <p>We've received your message and will get back to you as soon as possible.</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Subject:</strong> ${subject}</p>
            </div>
            <p>We typically respond within 24-48 hours.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #666;">
              Market Crash Monitor<br>
              <a href="${BASE_URL}">${BASE_URL}</a>
            </p>
          </body>
        </html>
      `;
      const confirmationText = `
Thank you for contacting us!

Hi ${name},

We've received your message and will get back to you as soon as possible.

Subject: ${subject}

We typically respond within 24-48 hours.

Market Crash Monitor
${BASE_URL}
      `;
      await sendEmail(email, confirmationSubject, confirmationHtml, confirmationText);
    } catch (confirmationError) {
      console.error('Failed to send confirmation email:', confirmationError);
      // Don't fail the main request if confirmation email fails
    }
    
    return { success: true, messageId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export const emailService = {
  generateToken,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendNewsletterEmail,
  sendContactEmail,
};

