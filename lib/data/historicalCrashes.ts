export const crashData = {
  crash1929: [
    { date: '1929-01', value: 100, event: 'Peak' },
    { date: '1929-09', value: 100, event: 'Stage 5 begins' },
    { date: '1929-10', value: 82, event: 'Black Tuesday' },
    { date: '1929-11', value: 75, event: 'Initial crash' },
    { date: '1930-01', value: 70, event: 'False hope' },
    { date: '1930-04', value: 55, event: 'Dead cat bounce' },
    { date: '1930-12', value: 45, event: 'Grind down' },
    { date: '1931-03', value: 42, event: '18-month mark' },
    { date: '1932-07', value: 11, event: 'Bottom (89% loss)' },
  ],

  crash2008: [
    { date: '2007-10', value: 100, event: 'Peak' },
    { date: '2008-01', value: 92, event: 'Bear Stearns' },
    { date: '2008-09', value: 78, event: 'Lehman collapse' },
    { date: '2008-10', value: 62, event: 'Panic selling' },
    { date: '2009-03', value: 47, event: 'Bottom (53% loss)' },
    { date: '2009-06', value: 55, event: 'Recovery begins' },
  ],

  current2025: [
    { date: '2025-11', value: 100, event: 'Stage 5 identified' },
    { date: '2025-12', value: 98, event: 'Monitoring' },
    // Add monthly projections based on 1929 pattern
    { date: '2026-01', value: 95, event: 'Projected' },
    { date: '2026-03', value: 88, event: 'Projected' },
    { date: '2026-06', value: 78, event: 'Projected' },
    { date: '2026-09', value: 65, event: 'Projected' },
    { date: '2026-12', value: 52, event: 'Projected' },
    { date: '2027-03', value: 42, event: 'Projected 18-month mark' },
  ],
};

export const indicators1929vs2025 = {
  capeRatio: { '1929': 32, '2025': 39.2, danger: 30 },
  marginDebt: { '1929': 8.5, '2025': 3.8, danger: 3.0 },
  buffettIndicator: { '1929': 87, '2025': 228, danger: 160 },
};

