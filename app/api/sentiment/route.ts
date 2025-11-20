// /app/api/sentiment/route.ts

export async function GET() {
  try {
    // Fetch CNN Fear & Greed Index
    const response = await fetch(
      'https://production.dataviz.cnn.io/index/fearandgreed/graphdata',
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );

    if (!response.ok) {
      console.error('CNN API response not OK:', response.status, response.statusText);
      throw new Error(`CNN API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('=== CNN API RESPONSE DEBUG ===');
    console.log('Top-level keys:', Object.keys(data));
    console.log('Full response (first 3000 chars):', JSON.stringify(data).substring(0, 3000));
    
    // Log ALL possible historical value locations
    console.log('Checking for historical values in various locations:');
    console.log('- fear_and_greed_previous_close:', data.fear_and_greed_previous_close);
    console.log('- fear_and_greed_previous_1_week:', data.fear_and_greed_previous_1_week);
    console.log('- fear_and_greed_previous_1_month:', data.fear_and_greed_previous_1_month);
    console.log('- fear_and_greed_previous_1_year:', data.fear_and_greed_previous_1_year);
    
    // Log specific properties we're looking for
    if (data.fear_and_greed_historical) {
      console.log('History object keys:', Object.keys(data.fear_and_greed_historical));
      if (data.fear_and_greed_historical.data) {
        console.log('History data array length:', data.fear_and_greed_historical.data.length);
        console.log('First 5 history items:', JSON.stringify(data.fear_and_greed_historical.data.slice(0, 5)));
        console.log('Last 5 history items:', JSON.stringify(data.fear_and_greed_historical.data.slice(-5)));
      }
    }

    // Validate response structure - check for different possible structures
    if (!data) {
      throw new Error('Empty response from CNN API');
    }

    // Try different possible response structures
    let latest, history, previousClose, weekAgo, monthAgo, yearAgo;

    // Check for standard structure
    if (data.fear_and_greed) {
      latest = data.fear_and_greed;
      history = data.fear_and_greed_historical;
      previousClose = data.fear_and_greed_previous_close;
      weekAgo = data.fear_and_greed_previous_1_week;
      monthAgo = data.fear_and_greed_previous_1_month;
      yearAgo = data.fear_and_greed_previous_1_year;
    } 
    // Check for alternative structure
    else if (data.fearAndGreed) {
      latest = data.fearAndGreed;
      history = data.fearAndGreedHistorical;
      previousClose = data.fearAndGreedPreviousClose;
      weekAgo = data.fearAndGreedPrevious1Week;
      monthAgo = data.fearAndGreedPrevious1Month;
      yearAgo = data.fearAndGreedPrevious1Year;
    }
    // Check if data itself is the fear_and_greed object
    else if (data.score !== undefined) {
      latest = data;
      history = { data: [] };
      previousClose = data.previous_close;
      weekAgo = data.previous_1_week;
      monthAgo = data.previous_1_month;
      yearAgo = data.previous_1_year;
    }
    else {
      console.error('Unexpected API response structure:', JSON.stringify(data).substring(0, 500));
      throw new Error('Unexpected response structure from CNN API');
    }

    // Validate latest data and extract current score first (needed for historical comparison)
    if (!latest) {
      throw new Error('No fear_and_greed data found in response');
    }

    // Extract current score first (needed for historical comparison and logging)
    const score = typeof latest.score === 'number' ? latest.score : 
                  typeof latest.value === 'number' ? latest.value : 
                  typeof latest.rating === 'number' ? latest.rating : 0;

    if (typeof score !== 'number' || isNaN(score)) {
      console.error('Invalid score value:', latest);
      throw new Error('Invalid score value in response');
    }

    // Extract historical values from history array if direct properties are missing
    if (history?.data && Array.isArray(history.data) && history.data.length > 0) {
      const historyData = history.data;
      console.log('History data sample:', JSON.stringify(historyData.slice(0, 5)));
      
      // Helper function to extract value from history item
      const getValue = (item: any) => {
        // Try different possible property names
        if (typeof item === 'number') return item;
        if (typeof item === 'object') {
          return item?.y ?? item?.value ?? item?.score ?? item?.rating ?? item?.fear_and_greed ?? null;
        }
        return null;
      };

      // Helper function to get timestamp from history item
      const getTimestamp = (item: any) => {
        if (typeof item === 'object') {
          if (item.x) return item.x * 1000; // x is often Unix timestamp in seconds
          if (item.timestamp) return new Date(item.timestamp).getTime();
          if (item.time) return new Date(item.time).getTime();
          if (item.date) return new Date(item.date).getTime();
          if (item.t) return item.t * 1000; // Alternative timestamp format
        }
        return 0;
      };

      // Sort history data by timestamp (most recent first)
      const sortedHistory = [...historyData]
        .map((item: any, index: number) => ({
          item,
          timestamp: getTimestamp(item),
          value: getValue(item),
          index
        }))
        .filter((entry: any) => entry.value !== null && entry.timestamp > 0)
        .sort((a: any, b: any) => b.timestamp - a.timestamp); // Most recent first

      console.log('Sorted history (first 10):', sortedHistory.slice(0, 10).map((e: any) => ({
        timestamp: new Date(e.timestamp).toISOString(),
        value: e.value,
        rawItem: e.item
      })));

      const now = Date.now();
      const oneDayAgo = now - 1.5 * 24 * 60 * 60 * 1000; // 1.5 days to account for weekends
      const oneWeekAgo = now - 7.5 * 24 * 60 * 60 * 1000;
      const oneMonthAgo = now - 30.5 * 24 * 60 * 60 * 1000;
      const oneYearAgo = now - 365.5 * 24 * 60 * 60 * 1000;

      console.log('Target timestamps:', {
        now: new Date(now).toISOString(),
        oneDayAgo: new Date(oneDayAgo).toISOString(),
        oneWeekAgo: new Date(oneWeekAgo).toISOString(),
        oneMonthAgo: new Date(oneMonthAgo).toISOString(),
        oneYearAgo: new Date(oneYearAgo).toISOString()
      });

      // Find closest historical values (closest to but not after the target time)
      // Use a more flexible approach - find the entry closest to the target time
      const findClosestValue = (targetTime: number, windowDays: number = 2) => {
        const windowMs = windowDays * 24 * 60 * 60 * 1000;
        const candidates = sortedHistory.filter((entry: any) => {
          return entry.timestamp <= targetTime && entry.timestamp > targetTime - windowMs;
        });
        
        if (candidates.length > 0) {
          // Return the one closest to target time
          return candidates.reduce((closest: any, current: any) => {
            const closestDiff = Math.abs(closest.timestamp - targetTime);
            const currentDiff = Math.abs(current.timestamp - targetTime);
            return currentDiff < closestDiff ? current : closest;
          });
        }
        
        // If no exact match, find the closest overall
        const allCandidates = sortedHistory.filter((entry: any) => entry.timestamp <= targetTime);
        if (allCandidates.length > 0) {
          return allCandidates[0]; // Most recent before target
        }
        
        return null;
      };

      if (!previousClose || previousClose === 0) {
        const yesterdayData = findClosestValue(oneDayAgo, 2);
        if (yesterdayData) {
          previousClose = yesterdayData.value;
          console.log('Found previous close:', previousClose, 'at', new Date(yesterdayData.timestamp).toISOString());
        } else if (sortedHistory.length > 1) {
          // Fallback: use second most recent entry
          previousClose = sortedHistory[1].value;
          console.log('Using fallback previous close:', previousClose);
        }
      }

      if (!weekAgo || weekAgo === 0) {
        const weekData = findClosestValue(oneWeekAgo, 3);
        if (weekData) {
          weekAgo = weekData.value;
          console.log('Found week ago:', weekAgo, 'at', new Date(weekData.timestamp).toISOString());
        }
      }

      if (!monthAgo || monthAgo === 0) {
        const monthData = findClosestValue(oneMonthAgo, 5);
        if (monthData) {
          monthAgo = monthData.value;
          console.log('Found month ago:', monthAgo, 'at', new Date(monthData.timestamp).toISOString());
        }
      }

      if (!yearAgo || yearAgo === 0) {
        const yearData = findClosestValue(oneYearAgo, 14);
        if (yearData) {
          yearAgo = yearData.value;
          console.log('Found year ago:', yearAgo, 'at', new Date(yearData.timestamp).toISOString());
        }
      }

      console.log('Extracted historical values:', {
        previousClose,
        weekAgo,
        monthAgo,
        yearAgo,
        currentScore: score
      });
    }

    // Calculate sentiment level
    const getSentimentLevel = (score: number) => {
      if (score >= 75) return 'Extreme Greed';
      if (score >= 55) return 'Greed';
      if (score >= 45) return 'Neutral';
      if (score >= 25) return 'Fear';
      return 'Extreme Fear';
    };

    return Response.json({
      current: {
        score: score,
        rating: latest.rating || latest.value || 'Unknown',
        level: getSentimentLevel(score),
        timestamp: latest.timestamp || latest.time || Date.now()
      },
      previous: {
        yesterday: typeof previousClose === 'number' ? previousClose : 0,
        week_ago: typeof weekAgo === 'number' ? weekAgo : 0,
        month_ago: typeof monthAgo === 'number' ? monthAgo : 0,
        year_ago: typeof yearAgo === 'number' ? yearAgo : 0
      },
      history: history?.data ? history.data.slice(-30) : [] // Last 30 days
    });

  } catch (error) {
    console.error('Error fetching sentiment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return Response.json(
      { 
        error: 'Failed to fetch sentiment data',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

