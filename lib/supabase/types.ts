// Database types for Supabase tables

export interface Subscriber {
  id: string; // UUID
  email: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  alert_subscription: boolean;
  newsletter_weekly: boolean;
  newsletter_monthly: boolean;
  verified: boolean;
  verification_token: string | null;
  unsubscribe_token: string;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  last_email_sent: string | null; // ISO timestamp
  metadata: Record<string, any>; // JSONB
}

export interface EmailLog {
  id: string; // UUID
  subscriber_id: string; // UUID
  email_type: 'alert' | 'weekly_newsletter' | 'monthly_newsletter' | null;
  subject: string | null;
  status: 'sent' | 'failed' | 'bounced' | null;
  mailgun_id: string | null;
  sent_at: string; // ISO timestamp
  opened_at: string | null; // ISO timestamp
  clicked_at: string | null; // ISO timestamp
  error_message: string | null;
}

export interface Newsletter {
  id: string; // UUID
  title: string;
  content: string;
  type: 'weekly' | 'monthly' | null;
  status: 'draft' | 'scheduled' | 'sent';
  scheduled_for: string | null; // ISO timestamp
  sent_at: string | null; // ISO timestamp
  created_by: string | null;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

// Database schema type (for Supabase type generation)
export interface Database {
  public: {
    Tables: {
      subscribers: {
        Row: Subscriber;
        Insert: Omit<Subscriber, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Subscriber, 'id' | 'created_at'>> & {
          updated_at?: string;
        };
      };
      email_logs: {
        Row: EmailLog;
        Insert: Omit<EmailLog, 'id' | 'sent_at'> & {
          id?: string;
          sent_at?: string;
        };
        Update: Partial<Omit<EmailLog, 'id'>>;
      };
      newsletters: {
        Row: Newsletter;
        Insert: Omit<Newsletter, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Newsletter, 'id' | 'created_at'>> & {
          updated_at?: string;
        };
      };
    };
  };
}

