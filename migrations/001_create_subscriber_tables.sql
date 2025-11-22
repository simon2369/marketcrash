-- Subscribers table
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- active, unsubscribed, bounced
  alert_subscription BOOLEAN DEFAULT false,
  newsletter_weekly BOOLEAN DEFAULT false,
  newsletter_monthly BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255),
  unsubscribe_token VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_email_sent TIMESTAMP,
  metadata JSONB DEFAULT '{}'
);

-- Email logs table (for tracking sent emails)
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID REFERENCES subscribers(id) ON DELETE CASCADE,
  email_type VARCHAR(50), -- alert, weekly_newsletter, monthly_newsletter
  subject VARCHAR(255),
  status VARCHAR(20), -- sent, failed, bounced
  mailgun_id VARCHAR(255),
  sent_at TIMESTAMP DEFAULT NOW(),
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  error_message TEXT
);

-- Newsletters table (for storing newsletter content)
CREATE TABLE newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(20), -- weekly, monthly
  status VARCHAR(20) DEFAULT 'draft', -- draft, scheduled, sent
  scheduled_for TIMESTAMP,
  sent_at TIMESTAMP,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_subscribers_status ON subscribers(status);
CREATE INDEX idx_email_logs_subscriber ON email_logs(subscriber_id);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at);

