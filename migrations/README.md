# Database Migrations

This directory contains SQL migration files for the Market Crash Dashboard database using Supabase.

## Running Migrations in Supabase

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `001_create_subscriber_tables.sql`
5. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Link your project (if not already linked)
supabase link --project-ref your-project-ref

# Run the migration
supabase db push
```

Or directly:

```bash
supabase db execute -f migrations/001_create_subscriber_tables.sql
```

### Option 3: Using psql with Supabase Connection String

1. Get your database connection string from Supabase Dashboard:
   - Go to **Settings** → **Database**
   - Copy the **Connection string** (URI format)
   
2. Run the migration:

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" -f migrations/001_create_subscriber_tables.sql
```

## Environment Variables

Make sure you have these variables set in your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Optional, for server-side operations
```

You can find these values in your Supabase Dashboard under **Settings** → **API**.

## Migration Files

- `001_create_subscriber_tables.sql` - Creates subscribers, email_logs, and newsletters tables
- `002_rls_policies.sql` - Sets up Row Level Security policies (run after creating tables)

## Migration Order

1. Run `001_create_subscriber_tables.sql` first
2. Then run `002_rls_policies.sql` to set up security policies

## Tables Created

1. **subscribers** - Stores subscriber information and preferences
2. **email_logs** - Tracks sent emails and their status
3. **newsletters** - Stores newsletter content and scheduling information

## Supabase Features

- ✅ UUID support (built-in)
- ✅ JSONB support (built-in)
- ✅ Timestamps with timezone
- ✅ Row Level Security (RLS) policies available

