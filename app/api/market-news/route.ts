import { NextResponse } from 'next/server';
import { getMarketNews } from '@/lib/api/marketData';

export const dynamic = 'force-dynamic';
export const revalidate = 1800; // 30 minutes

export async function GET() {
  try {
    const data = await getMarketNews();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('Error fetching market news:', error);
    // Return empty array instead of 500 to prevent app crash
    return NextResponse.json([], {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    });
  }
}

