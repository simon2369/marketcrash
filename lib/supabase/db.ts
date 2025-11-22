/**
 * Database helper functions for Supabase
 * These functions provide type-safe access to the database tables
 */

import { createServerClient } from './client';
import type { Subscriber, EmailLog, Newsletter } from './types';

const db = createServerClient();

// Subscribers
export async function getSubscriberByEmail(email: string): Promise<Subscriber | null> {
  const { data, error } = await db
    .from('subscribers')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw error;
  }

  return data;
}

export async function getSubscriberByUnsubscribeToken(
  token: string
): Promise<Subscriber | null> {
  const { data, error } = await db
    .from('subscribers')
    .select('*')
    .eq('unsubscribe_token', token)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data;
}

export async function createSubscriber(
  subscriber: Omit<Subscriber, 'id' | 'created_at' | 'updated_at'>
): Promise<Subscriber> {
  const { data, error } = await db
    .from('subscribers')
    .insert(subscriber)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateSubscriber(
  id: string,
  updates: Partial<Omit<Subscriber, 'id' | 'created_at'>>
): Promise<Subscriber> {
  const { data, error } = await db
    .from('subscribers')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getActiveSubscribers(
  newsletterType?: 'weekly' | 'monthly',
  alertOnly?: boolean
): Promise<Subscriber[]> {
  let query = db
    .from('subscribers')
    .select('*')
    .eq('status', 'active')
    .eq('verified', true);

  if (alertOnly) {
    query = query.eq('alert_subscription', true);
  } else if (newsletterType === 'weekly') {
    query = query.eq('newsletter_weekly', true);
  } else if (newsletterType === 'monthly') {
    query = query.eq('newsletter_monthly', true);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
}

// Email Logs
export async function createEmailLog(
  log: Omit<EmailLog, 'id' | 'sent_at'>
): Promise<EmailLog> {
  const { data, error } = await db
    .from('email_logs')
    .insert(log)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateEmailLog(
  id: string,
  updates: Partial<Omit<EmailLog, 'id'>>
): Promise<EmailLog> {
  const { data, error } = await db
    .from('email_logs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getEmailLogsBySubscriber(
  subscriberId: string,
  limit = 50
): Promise<EmailLog[]> {
  const { data, error } = await db
    .from('email_logs')
    .select('*')
    .eq('subscriber_id', subscriberId)
    .order('sent_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data || [];
}

// Newsletters
export async function createNewsletter(
  newsletter: Omit<Newsletter, 'id' | 'created_at' | 'updated_at'>
): Promise<Newsletter> {
  const { data, error } = await db
    .from('newsletters')
    .insert(newsletter)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getNewsletter(id: string): Promise<Newsletter | null> {
  const { data, error } = await db
    .from('newsletters')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data;
}

export async function getNewsletters(
  status?: Newsletter['status'],
  type?: Newsletter['type']
): Promise<Newsletter[]> {
  let query = db.from('newsletters').select('*');

  if (status) {
    query = query.eq('status', status);
  }

  if (type) {
    query = query.eq('type', type);
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
}

export async function updateNewsletter(
  id: string,
  updates: Partial<Omit<Newsletter, 'id' | 'created_at'>>
): Promise<Newsletter> {
  const { data, error } = await db
    .from('newsletters')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

