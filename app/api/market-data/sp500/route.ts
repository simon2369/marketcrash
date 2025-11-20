import { NextResponse } from 'next/server';
import { getSP500Data } from '@/lib/api/marketData';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET() {
  try {
    console.log('Fetching S&P 500 data...');
    const data = await getSP500Data();
    console.log('S&P 500 data received:', data);
    
    // Validate data before returning
    if (!data || data.value === undefined || data.value === null) {
      throw new Error('Invalid data received from getSP500Data');
    }
    
    if (data.value === 0) {
      throw new Error('S&P 500 value is zero - API may have returned invalid data');
    }
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Error fetching S&P 500 data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch S&P 500 data';
    console.error('Error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Return 500 status so the client knows there's an error
    return NextResponse.json(
      { 
        error: errorMessage,
        value: 0,
        change: 0,
        changePercent: 0,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}


