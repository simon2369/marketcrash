'use client';

import { useEffect, useRef } from 'react';
import { Timeline, TimelineOptions } from 'vis-timeline/standalone';
import { DataSet } from 'vis-data/peer';

/**
 * Timeline event data structure
 */
export interface TimelineEvent {
  id: string;
  content: string;
  start: Date | string;
  end?: Date | string;
  group: string;
  className?: string;
  title?: string;
}

/**
 * Timeline group data structure
 */
export interface TimelineGroup {
  id: string;
  content: string;
  className?: string;
}

/**
 * Crash Timeline Component
 * Displays an 18-month timeline from November 2025 to March 2027
 * showing economic indicators, market events, and Fed actions
 */
export function CrashTimeline() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineInstanceRef = useRef<Timeline | null>(null);

  useEffect(() => {
    if (!timelineRef.current) return;

    // Wait for DOM to be ready
    const initTimeline = () => {
      if (!timelineRef.current) return;

      // Define groups
      const groups: TimelineGroup[] = [
        { id: 'economic', content: 'Economic Indicators' },
        { id: 'market', content: 'Market Events' },
        { id: 'fed', content: 'Fed Actions' },
      ];

      // Define events with key crash indicators
      const events: TimelineEvent[] = [
        // ===== MARKET EVENTS =====
        {
          id: 'market-1',
          content: 'Monitoring begins',
          start: new Date('2025-11-01'),
          group: 'market',
          className: 'timeline-green',
          title: 'Market crash monitoring dashboard activated - Initial assessment',
        },
        {
          id: 'market-2',
          content: 'First market correction',
          start: new Date('2025-11-15'),
          end: new Date('2025-12-15'),
          group: 'market',
          className: 'timeline-yellow',
          title: 'Initial market correction - 5-10% decline expected',
        },
        {
          id: 'market-3',
          content: 'Dead cat bounce',
          start: new Date('2026-01-01'),
          end: new Date('2026-03-31'),
          group: 'market',
          className: 'timeline-yellow',
          title: 'Temporary recovery period - False hope before further decline',
        },
        {
          id: 'market-4',
          content: 'Major sell-off begins',
          start: new Date('2026-04-01'),
          group: 'market',
          className: 'timeline-red',
          title: 'Significant market sell-off - 15-20% decline',
        },
        {
          id: 'market-5',
          content: 'Capitulation phase',
          start: new Date('2026-07-01'),
          end: new Date('2027-01-31'),
          group: 'market',
          className: 'timeline-red',
          title: 'Severe market downturn - Panic selling and mass liquidation',
        },
        {
          id: 'market-6',
          content: '18-month mark',
          start: new Date('2027-03-31'),
          group: 'market',
          className: 'timeline-red',
          title: 'End of monitoring period - Potential bottom formation',
        },
        
        // ===== ECONOMIC INDICATORS =====
        {
          id: 'economic-1',
          content: 'CAPE Ratio peaks',
          start: new Date('2025-11-15'),
          group: 'economic',
          className: 'timeline-red',
          title: 'CAPE Ratio reaches extreme levels (>35) - Historical crash signal',
        },
        {
          id: 'economic-2',
          content: 'Yield curve inversion',
          start: new Date('2025-12-01'),
          group: 'economic',
          className: 'timeline-yellow',
          title: '10Y-3M yield curve inverts - Recession warning signal',
        },
        {
          id: 'economic-3',
          content: 'GDP contraction',
          start: new Date('2026-01-15'),
          group: 'economic',
          className: 'timeline-yellow',
          title: 'Q4 2025 GDP shows contraction - Economic slowdown confirmed',
        },
        {
          id: 'economic-4',
          content: 'Unemployment spike',
          start: new Date('2026-08-01'),
          group: 'economic',
          className: 'timeline-red',
          title: 'Unemployment rates increase significantly - Labor market weakening',
        },
        {
          id: 'economic-5',
          content: 'Credit spreads widen',
          start: new Date('2026-05-01'),
          group: 'economic',
          className: 'timeline-red',
          title: 'High-yield credit spreads exceed 7% - Credit market stress',
        },
        {
          id: 'economic-6',
          content: 'Margin debt unwinding',
          start: new Date('2026-06-01'),
          end: new Date('2026-09-30'),
          group: 'economic',
          className: 'timeline-red',
          title: 'Margin debt levels decline rapidly - Forced liquidations',
        },
        
        // ===== FED ACTIONS =====
        {
          id: 'fed-1',
          content: 'Emergency rate cut',
          start: new Date('2025-12-10'),
          group: 'fed',
          className: 'timeline-yellow',
          title: 'Federal Reserve emergency 50bp interest rate cut',
        },
        {
          id: 'fed-2',
          content: 'Additional rate cuts',
          start: new Date('2026-02-01'),
          end: new Date('2026-04-30'),
          group: 'fed',
          className: 'timeline-yellow',
          title: 'Fed continues aggressive rate cutting cycle',
        },
        {
          id: 'fed-3',
          content: 'Quantitative easing',
          start: new Date('2026-07-15'),
          group: 'fed',
          className: 'timeline-red',
          title: 'Fed implements quantitative easing measures - Market intervention',
        },
        {
          id: 'fed-4',
          content: 'Emergency liquidity',
          start: new Date('2026-09-01'),
          group: 'fed',
          className: 'timeline-red',
          title: 'Fed provides emergency liquidity facilities',
        },
        {
          id: 'fed-5',
          content: 'Market stabilization',
          start: new Date('2027-02-01'),
          group: 'fed',
          className: 'timeline-green',
          title: 'Fed actions begin to stabilize markets - Recovery signals',
        },
      ];

      // Create DataSet for groups
      const groupsDataSet = new DataSet(groups);

      // Create DataSet for items
      const itemsDataSet = new DataSet(events);

      // Timeline options with dark theme and mobile support
      const options: TimelineOptions = {
        start: new Date('2025-11-01'),
        end: new Date('2027-03-31'),
        zoomMin: 1000 * 60 * 60 * 24 * 7, // 1 week minimum zoom
        zoomMax: 1000 * 60 * 60 * 24 * 365 * 2, // 2 years maximum zoom
        orientation: { axis: 'both', item: 'top' },
        stack: true,
        showCurrentTime: true,
        showMajorLabels: true,
        showMinorLabels: true,
        format: {
          minorLabels: {
            month: 'MMM',
            year: 'YYYY',
          },
          majorLabels: {
            month: 'MMMM YYYY',
            year: 'YYYY',
          },
        },
        // Mobile-specific settings
        verticalScroll: true,
        zoomable: true,
        moveable: true,
        // Touch-friendly on mobile
        multiselect: false,
        multiselectPerGroup: false,
        // Adjust height for mobile (will be set via CSS media query)
        height: '500px',
        // Dark theme styling
        backgroundColor: '#0f172a', // slate-900
        fontColor: '#e2e8f0', // slate-200
        groupOrder: 'id',
        // Custom styling
        editable: false,
        selectable: true,
        tooltip: {
          followMouse: true,
          overflowMethod: 'cap',
        },
      } as any;

      // Initialize timeline
      try {
        const timeline = new Timeline(timelineRef.current, itemsDataSet, groupsDataSet, options);

        // Store timeline instance for cleanup
        timelineInstanceRef.current = timeline;

        // Fit timeline to show all items
        timeline.fit();
      } catch (error) {
        console.error('Error initializing timeline:', error);
      }
    };

    // Initialize immediately or after a short delay to ensure DOM is ready
    let timeoutId: NodeJS.Timeout | null = null;
    if (document.readyState === 'complete') {
      initTimeline();
    } else {
      timeoutId = setTimeout(initTimeline, 100);
    }

    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (timelineInstanceRef.current) {
        try {
          timelineInstanceRef.current.destroy();
        } catch (error) {
          console.error('Error destroying timeline:', error);
        }
        timelineInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full">
      <style jsx global>{`
        /* Dark theme overrides for vis-timeline */
        .vis-timeline {
          border: 1px solid #334155;
          background-color: #0f172a;
          color: #e2e8f0;
        }

        .vis-item {
          border-color: #475569;
          background-color: #1e293b;
          color: #e2e8f0;
          border-radius: 4px;
        }

        .vis-item.vis-selected {
          border-color: #60a5fa;
          background-color: #3b82f6;
        }

        .vis-item.timeline-blue {
          background-color: #3b82f6;
          border-color: #2563eb;
          color: white;
        }

        .vis-item.timeline-yellow {
          background-color: #eab308;
          border-color: #ca8a04;
          color: #1e293b;
        }

        .vis-item.timeline-red {
          background-color: #ef4444;
          border-color: #dc2626;
          color: white;
        }

        .vis-item.timeline-green {
          background-color: #22c55e;
          border-color: #16a34a;
          color: white;
        }

        .vis-label {
          background-color: #1e293b;
          color: #e2e8f0;
          border-color: #334155;
        }

        .vis-time-axis {
          background-color: #0f172a;
        }

        .vis-time-axis .vis-text {
          color: #94a3b8;
        }

        .vis-time-axis .vis-text.vis-major {
          color: #e2e8f0;
          font-weight: 600;
        }

        .vis-current-time {
          background-color: #ef4444;
        }

        .vis-grid.vis-vertical {
          border-color: #334155;
        }

        .vis-grid.vis-horizontal {
          border-color: #334155;
        }

        .vis-panel.vis-center,
        .vis-panel.vis-left,
        .vis-panel.vis-right,
        .vis-panel.vis-top,
        .vis-panel.vis-bottom {
          border-color: #334155;
        }

        .vis-item.vis-range {
          border-radius: 4px;
        }

        .vis-item.vis-point {
          border-radius: 50%;
        }

        .vis-item.vis-dot {
          border-radius: 50%;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .vis-timeline {
            font-size: 12px;
          }

          .vis-item {
            font-size: 11px;
            padding: 2px 4px;
          }
        }
      `}</style>
      <div
        ref={timelineRef}
        className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 md:p-4"
        style={{ minHeight: '400px', height: '500px' }}
      />
    </div>
  );
}
