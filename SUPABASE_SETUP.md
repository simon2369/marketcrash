# Supabase Setup Guide

This guide will help you set up Supabase for the Market Crash Dashboard newsletter and subscription system.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- A Supabase project created

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - Keep this secret!

## Step 2: Configure Environment Variables

Add these to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Important:** 
- The `NEXT_PUBLIC_*` variables are exposed to the browser (safe for anon key)
- The `SUPABASE_SERVICE_ROLE_KEY` should NEVER be exposed to the client - it's only used in API routes

## Step 3: Run Database Migrations

### Option A: Using Supabase Dashboard (Easiest)

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `migrations/001_create_subscriber_tables.sql`
5. Paste into the SQL editor
6. Click **Run** (or press Ctrl+Enter)
7. Repeat for `migrations/002_rls_policies.sql`

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Step 4: Verify Tables Are Created

1. Go to **Table Editor** in your Supabase dashboard
2. You should see three tables:
   - `subscribers`
   - `email_logs`
   - `newsletters`

## Step 5: Test the Connection

You can test the Supabase connection by creating a simple API route:

```typescript
// app/api/test-db/route.ts
import { createServerClient } from '@/lib/supabase/client';

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase.from('subscribers').select('count');
    
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    
    return Response.json({ success: true, count: data?.length || 0 });
  } catch (error) {
    return Response.json({ error: 'Database connection failed' }, { status: 500 });
  }
}
```

Visit `/api/test-db` to verify the connection works.

## Project Structure

```
lib/supabase/
├── client.ts      # Supabase client initialization
├── types.ts       # TypeScript types for database tables
└── db.ts          # Helper functions for database operations

migrations/
├── 001_create_subscriber_tables.sql  # Creates tables
└── 002_rls_policies.sql              # Sets up security policies
```

## Usage Examples

### In API Routes (Server-side)

```typescript
import { getSubscriberByEmail, createSubscriber } from '@/lib/supabase/db';

export async function POST(request: Request) {
  const { email } = await request.json();
  
  // Check if subscriber exists
  const existing = await getSubscriberByEmail(email);
  if (existing) {
    return Response.json({ error: 'Email already subscribed' }, { status: 400 });
  }
  
  // Create new subscriber
  const subscriber = await createSubscriber({
    email,
    unsubscribe_token: generateToken(),
    // ... other fields
  });
  
  return Response.json({ subscriber });
}
```

### In Client Components (Client-side)

```typescript
'use client';

import { supabase } from '@/lib/supabase/client';

// Read-only operations (using anon key)
const { data } = await supabase
  .from('newsletters')
  .select('*')
  .eq('status', 'sent');
```

## Security Notes

- **Row Level Security (RLS)** is enabled on all tables
- The `service_role` key bypasses RLS - only use it in API routes, never in client components
- The `anon` key respects RLS policies
- Public can insert subscribers but cannot read them (except through API routes)

## Next Steps

1. ✅ Database tables created
2. ⏭️ Set up email service (Mailgun, SendGrid, etc.)
3. ⏭️ Create subscription API endpoints
4. ⏭️ Create unsubscribe functionality
5. ⏭️ Set up newsletter sending system

## Troubleshooting

### "Missing Supabase environment variables" error

Make sure your `.env.local` file has the correct variable names:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### "relation does not exist" error

Run the migrations! The tables need to be created first.

### RLS policy errors

Make sure you've run `002_rls_policies.sql` after creating the tables.

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

