-- Row Level Security (RLS) Policies for Supabase
-- Run this migration after creating the tables

-- Enable RLS on all tables
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;

-- Subscribers table policies
-- Allow service role to do everything (for API routes)
CREATE POLICY "Service role can manage subscribers"
  ON subscribers
  FOR ALL
  USING (auth.role() = 'service_role');

-- Allow public to insert new subscribers (for subscription forms)
CREATE POLICY "Public can insert subscribers"
  ON subscribers
  FOR INSERT
  WITH CHECK (true);

-- Allow subscribers to read their own data (using unsubscribe_token)
-- Note: This requires a custom function or API route to verify the token
-- For now, we'll restrict read access to service role only
CREATE POLICY "Service role can read subscribers"
  ON subscribers
  FOR SELECT
  USING (auth.role() = 'service_role');

-- Email logs table policies
-- Only service role can access email logs
CREATE POLICY "Service role can manage email logs"
  ON email_logs
  FOR ALL
  USING (auth.role() = 'service_role');

-- Newsletters table policies
-- Allow public to read published newsletters
CREATE POLICY "Public can read sent newsletters"
  ON newsletters
  FOR SELECT
  USING (status = 'sent');

-- Only service role can create/update newsletters
CREATE POLICY "Service role can manage newsletters"
  ON newsletters
  FOR ALL
  USING (auth.role() = 'service_role');

-- Note: For production, you may want to create more granular policies
-- based on your authentication setup. These policies assume you're using
-- the service role key for server-side operations and anon key for client-side.

