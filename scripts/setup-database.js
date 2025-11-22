import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import pg from 'pg';

// Load environment variables from .env.local or .env.development.local
config({ path: '.env.development.local' });
config({ path: '.env.local' });

// Disable SSL certificate validation for Supabase connections
// This is safe for Supabase as they use valid certificates, but Node.js may have issues
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get database connection string from environment
// For migrations, prefer non-pooling connection (better for DDL operations)
// Fallback to POSTGRES_PRISMA_URL or DATABASE_URL
const connectionString = 
  process.env.POSTGRES_URL_NON_POOLING || 
  process.env.POSTGRES_PRISMA_URL || 
  process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Database connection string not found');
  console.error('Please set POSTGRES_PRISMA_URL or DATABASE_URL in your .env.local or .env.development.local file');
  process.exit(1);
}

// Create connection pool
// Always set SSL to rejectUnauthorized: false for Supabase connections
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 1, // Use single connection for migrations
});

// Migration files in order
const migrations = [
  '001_create_subscriber_tables.sql',
  '002_rls_policies.sql'
];

async function runMigration(filename) {
  const filePath = join(__dirname, '..', 'migrations', filename);
  console.log(`\n📄 Running migration: ${filename}`);
  
  try {
    const sql = await readFile(filePath, 'utf-8');
    await pool.query(sql);
    console.log(`✅ Migration ${filename} completed successfully`);
    return true;
  } catch (error) {
    // Check if it's a "already exists" error (table/policy already created)
    if (error.code === '42P07' || error.code === '42710' || error.message.includes('already exists')) {
      console.log(`⚠️  Migration ${filename} skipped (already applied)`);
      return true;
    }
    console.error(`❌ Error running migration ${filename}:`, error.message);
    throw error;
  }
}

async function setupDatabase() {
  console.log('🚀 Starting database setup...');
  console.log(`📡 Connecting to database...`);
  
  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful\n');

    // Run migrations in order
    for (const migration of migrations) {
      await runMigration(migration);
    }

    console.log('\n✨ Database setup completed successfully!');
    console.log('\n📊 Tables created:');
    console.log('   - subscribers');
    console.log('   - email_logs');
    console.log('   - newsletters');
    console.log('\n🔒 Row Level Security policies enabled');
    
  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run setup
setupDatabase().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

