// /app/api/usd-news/route.ts

export async function GET() {
  try {
    // Fetch USD economic calendar data
    const response = await fetch(
      'https://nfs.faireconomy.media/ff_calendar_thisweek.json',
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch USD news: ${response.status} ${response.statusText}`);
    }

    let data = await response.json();
    
    // Handle different possible response structures
    // The API might return an object with events array, or directly an array
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      // Check for common property names
      data = data.events || data.data || data.calendar || Object.values(data)[0] || [];
    }
    
    if (!Array.isArray(data)) {
      console.error('Unexpected data structure:', typeof data, Object.keys(data || {}));
      throw new Error('Invalid data structure from API');
    }

    console.log('Total events received:', data.length);
    console.log('Sample event structure:', data[0]);

    // Filter for high impact USD-related events
    const highImpactNews = data
      .filter((event: any) => {
        if (!event) return false;
        
        // Check for high impact (try different property names)
        const impact = event.impact || event.importance || event.volatility || '';
        const isHighImpact = impact === 'High' || 
                            impact === 'high' || 
                            impact === 'H' ||
                            impact === 3 ||
                            impact === '3';
        
        // Check for USD/US events (try different property names)
        const currency = (event.currency || event.cur || '').toUpperCase();
        const country = (event.country || event.countryCode || '').toUpperCase();
        const title = (event.title || event.event || event.name || '').toLowerCase();
        
        const isUSD = currency === 'USD' || 
                     country === 'US' || 
                     country === 'USA' ||
                     title.includes('united states') ||
                     title.includes('u.s.') ||
                     title.includes('us ') ||
                     title.includes('fed') ||
                     title.includes('federal reserve') ||
                     title.includes('non-farm payroll') ||
                     title.includes('cpi') ||
                     title.includes('gdp');
        
        return isHighImpact && isUSD;
      })
      .sort((a: any, b: any) => {
        // Sort by date/time (upcoming events first)
        const getDate = (event: any) => {
          const dateStr = event.date || event.time || event.timestamp || event.datetime;
          if (!dateStr) return 0;
          const date = new Date(dateStr);
          return isNaN(date.getTime()) ? 0 : date.getTime();
        };
        return getDate(a) - getDate(b);
      })
      .slice(0, 10); // Get top 10 upcoming events

    console.log('Filtered high impact USD events:', highImpactNews.length);

    return Response.json({
      events: highImpactNews,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching USD news:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return Response.json(
      { 
        error: 'Failed to fetch USD news',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

