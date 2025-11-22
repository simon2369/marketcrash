import pg from 'pg';

const { Pool } = pg;

// Create connection pool
// Use POSTGRES_PRISMA_URL (Supabase/Prisma) or fallback to DATABASE_URL
const connectionString = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('⚠️ Database connection string not found. Set POSTGRES_PRISMA_URL or DATABASE_URL in your environment variables.');
}

// Determine if this is a Supabase connection
const isSupabaseConnection = connectionString 
  ? (connectionString.includes('supabase') || 
     connectionString.includes('pooler') ||
     connectionString.includes('supabase.co'))
  : false;

// Configure SSL for Supabase connections
// Supabase requires SSL but may have certificate chain issues in some environments
const sslConfig = isSupabaseConnection 
  ? {
      rejectUnauthorized: false, // Allow self-signed certificates for Supabase
    }
  : undefined;

const pool = connectionString ? new Pool({
  connectionString,
  ssl: sslConfig,
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
}) : null;

// Test connection on startup
if (pool) {
  pool.on('connect', () => {
    console.log('✅ Database connected');
  });

  pool.on('error', (err) => {
    console.error('❌ Unexpected database error:', err);
  });
}

export const db = {
  query: async (text: string, params?: any[]) => {
    if (!pool) {
      throw new Error('Database connection not configured. Please set POSTGRES_PRISMA_URL or DATABASE_URL environment variable.');
    }
    
    const start = Date.now();
    try {
      const result = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: result.rowCount });
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },

  // Useful helper for transactions
  getClient: async () => {
    if (!pool) {
      throw new Error('Database connection not configured. Please set POSTGRES_PRISMA_URL or DATABASE_URL environment variable.');
    }
    const client = await pool.connect();
    return client;
  }
};

// Export pool for advanced usage
export { pool };

