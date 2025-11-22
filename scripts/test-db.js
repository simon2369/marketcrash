import { config } from 'dotenv';
import pg from 'pg';

// Load environment variables from .env.local or .env.development.local
config({ path: '.env.development.local' });
config({ path: '.env.local' });

// Disable SSL certificate validation for Supabase connections
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Pool } = pg;

// Get database connection string from environment
// For testing, prefer non-pooling connection (better for DDL operations)
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
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
});

async function testDatabase() {
  console.log('🧪 Testing database connection...\n');

  try {
    // Test basic connection
    console.log('1. Testing connection...');
    const connectionTest = await pool.query('SELECT NOW() as current_time, version() as version');
    console.log('   ✅ Connection successful');
    console.log(`   📅 Server time: ${connectionTest.rows[0].current_time}`);
    console.log(`   🗄️  PostgreSQL version: ${connectionTest.rows[0].version.split(',')[0]}\n`);

    // Check if tables exist
    console.log('2. Checking tables...');
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('subscribers', 'email_logs', 'newsletters')
      ORDER BY table_name;
    `;
    const tables = await pool.query(tablesQuery);
    
    const expectedTables = ['subscribers', 'email_logs', 'newsletters'];
    const existingTables = tables.rows.map(row => row.table_name);
    
    expectedTables.forEach(table => {
      if (existingTables.includes(table)) {
        console.log(`   ✅ Table '${table}' exists`);
      } else {
        console.log(`   ❌ Table '${table}' not found`);
      }
    });

    // Check table structures
    if (existingTables.length > 0) {
      console.log('\n3. Checking table structures...');
      for (const table of existingTables) {
        const columnsQuery = `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = $1
          ORDER BY ordinal_position;
        `;
        const columns = await pool.query(columnsQuery, [table]);
        console.log(`   📋 ${table} (${columns.rows.length} columns)`);
        columns.rows.forEach(col => {
          const nullable = col.is_nullable === 'YES' ? 'nullable' : 'required';
          console.log(`      - ${col.column_name}: ${col.data_type} (${nullable})`);
        });
      }
    }

    // Check RLS status
    console.log('\n4. Checking Row Level Security...');
    const rlsQuery = `
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename IN ('subscribers', 'email_logs', 'newsletters');
    `;
    const rlsStatus = await pool.query(rlsQuery);
    rlsStatus.rows.forEach(row => {
      const status = row.rowsecurity ? '✅ Enabled' : '❌ Disabled';
      console.log(`   ${status} RLS on '${row.tablename}'`);
    });

    // Count records (if any)
    console.log('\n5. Checking record counts...');
    for (const table of existingTables) {
      try {
        const count = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`   📊 ${table}: ${count.rows[0].count} records`);
      } catch (error) {
        console.log(`   ⚠️  Could not count records in ${table}: ${error.message}`);
      }
    }

    console.log('\n✨ Database test completed successfully!');

  } catch (error) {
    console.error('\n❌ Database test failed:', error.message);
    console.error('   Error details:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run test
testDatabase().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

