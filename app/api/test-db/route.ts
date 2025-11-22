import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Test database connection
    const result = await db.query('SELECT NOW() as current_time, version() as version');
    
    // Test subscribers table exists
    const tableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'subscribers'
      );
    `);
    
    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        time: result.rows[0].current_time,
        version: result.rows[0].version.split(',')[0],
      },
      tables: {
        subscribers: tableCheck.rows[0].exists,
      },
      connectionString: process.env.POSTGRES_PRISMA_URL 
        ? 'POSTGRES_PRISMA_URL is set' 
        : process.env.DATABASE_URL 
        ? 'DATABASE_URL is set'
        : 'No connection string found',
    });
  } catch (error) {
    console.error('Database test error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        connectionString: process.env.POSTGRES_PRISMA_URL 
          ? 'POSTGRES_PRISMA_URL is set' 
          : process.env.DATABASE_URL 
          ? 'DATABASE_URL is set'
          : 'No connection string found',
      },
      { status: 500 }
    );
  }
}

