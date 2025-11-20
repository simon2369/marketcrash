"use client";

import { useEffect, useRef } from "react";
import { Timeline } from "vis-timeline";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";
import type { TimelineEvent } from "@/lib/types";

// Type definitions for vis-timeline (since @types package doesn't exist)
interface TimelineItem {
  id: string;
  content: string;
  start: Date | string;
  type?: string;
  className?: string;
  group?: string;
}

interface TimelineGroup {
  id: string;
  content: string;
  className?: string;
}

interface CrashTimelineProps {
  events?: TimelineEvent[];
  className?: string;
}

export function CrashTimeline({
  events,
  className,
}: CrashTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineInstanceRef = useRef<Timeline | null>(null);

  useEffect(() => {
    if (!timelineRef.current) return;

    // Sample events if none provided
    const defaultEvents: TimelineEvent[] = events || [
      {
        date: "2025-11-15",
        title: "High VIX Spike",
        description: "VIX reaches 28.5",
        severity: "high",
        category: "market",
      },
      {
        date: "2025-12-01",
        title: "Fed Rate Decision",
        description: "Federal Reserve announces rate cut",
        severity: "medium",
        category: "economic",
      },
      {
        date: "2026-01-15",
        title: "Inflation Report",
        description: "CPI exceeds expectations",
        severity: "high",
        category: "economic",
      },
      {
        date: "2026-02-20",
        title: "Market Correction",
        description: "S&P 500 drops 5%",
        severity: "critical",
        category: "market",
      },
      {
        date: "2026-04-10",
        title: "Fed Emergency Meeting",
        description: "Emergency rate adjustment",
        severity: "critical",
        category: "economic",
      },
      {
        date: "2026-06-01",
        title: "Unemployment Spike",
        description: "Unemployment rate increases",
        severity: "high",
        category: "economic",
      },
      {
        date: "2026-08-15",
        title: "Market Recovery",
        description: "Markets show signs of stabilization",
        severity: "low",
        category: "market",
      },
      {
        date: "2026-10-01",
        title: "GDP Growth",
        description: "Positive GDP growth reported",
        severity: "low",
        category: "economic",
      },
      {
        date: "2026-12-15",
        title: "Fed Policy Normalization",
        description: "Fed returns to normal policy",
        severity: "medium",
        category: "economic",
      },
      {
        date: "2027-01-20",
        title: "Market Stability",
        description: "Markets stabilize",
        severity: "low",
        category: "market",
      },
    ];

    // Convert events to timeline items
    const items: TimelineItem[] = defaultEvents.map((event, index) => {
      const severity = event.severity || "medium";
      let className = "";
      let group = "";

      // Color coding based on severity
      switch (severity) {
        case "critical":
          className = "timeline-critical";
          break;
        case "high":
          className = "timeline-high";
          break;
        case "medium":
          className = "timeline-medium";
          break;
        case "low":
          className = "timeline-low";
          break;
        default:
          className = "timeline-medium";
      }

      // Group by category
      switch (event.category) {
        case "market":
          group = "market-events";
          break;
        case "economic":
          group = "economic-indicators";
          break;
        case "political":
          group = "fed-actions";
          break;
        default:
          group = "market-events";
      }

      return {
        id: `event-${index}`,
        content: `<div class="timeline-event-content">
          <strong>${event.title}</strong>
          ${event.description ? `<br><small>${event.description}</small>` : ""}
        </div>`,
        start: typeof event.date === "string" ? event.date : event.date.toISOString().split("T")[0],
        className,
        group,
      };
    });

    // Define groups
    const groups: TimelineGroup[] = [
      {
        id: "market-events",
        content: "Market Events",
        className: "timeline-group-market",
      },
      {
        id: "economic-indicators",
        content: "Economic Indicators",
        className: "timeline-group-economic",
      },
      {
        id: "fed-actions",
        content: "Fed Actions",
        className: "timeline-group-fed",
      },
    ];

    // Timeline options
    const options = {
      start: new Date("2025-11-01"),
      end: new Date("2027-03-31"),
      editable: false,
      selectable: true,
      zoomMin: 1000 * 60 * 60 * 24 * 7, // 1 week
      zoomMax: 1000 * 60 * 60 * 24 * 365 * 2, // 2 years
      orientation: {
        axis: "top",
        item: "top",
      },
      stack: false,
      showCurrentTime: true,
      locale: "en",
      format: {
        minorLabels: {
          month: "MMM YYYY",
          year: "YYYY",
        },
        majorLabels: {
          month: "MMMM YYYY",
          year: "YYYY",
        },
      },
    };

    // Create timeline instance
    const timeline = new Timeline(timelineRef.current, items, groups, options);
    timelineInstanceRef.current = timeline;

    // Cleanup on unmount
    return () => {
      if (timelineInstanceRef.current) {
        timelineInstanceRef.current.destroy();
        timelineInstanceRef.current = null;
      }
    };
  }, [events]);

  return (
    <div className={`w-full ${className || ""}`}>
      <div
        ref={timelineRef}
        className="w-full"
        style={{ minHeight: "400px" }}
      />
      <style jsx global>{`
        .vis-timeline {
          border: 1px solid hsl(var(--border));
          background: hsl(var(--background));
          font-family: inherit;
        }

        .vis-item {
          border-radius: 4px;
          border-width: 2px;
          font-size: 12px;
          padding: 4px 8px;
        }

        .vis-item.vis-selected {
          border-color: hsl(var(--primary)) !important;
        }

        .timeline-critical {
          background-color: hsl(0 84% 60%);
          border-color: hsl(0 84% 50%);
          color: white;
        }

        .timeline-high {
          background-color: hsl(38 92% 50%);
          border-color: hsl(38 92% 40%);
          color: white;
        }

        .timeline-medium {
          background-color: hsl(45 93% 47%);
          border-color: hsl(45 93% 37%);
          color: white;
        }

        .timeline-low {
          background-color: hsl(142 76% 36%);
          border-color: hsl(142 76% 26%);
          color: white;
        }

        .vis-item.timeline-critical:hover {
          background-color: hsl(0 84% 55%);
        }

        .vis-item.timeline-high:hover {
          background-color: hsl(38 92% 45%);
        }

        .vis-item.timeline-medium:hover {
          background-color: hsl(45 93% 42%);
        }

        .vis-item.timeline-low:hover {
          background-color: hsl(142 76% 31%);
        }

        .vis-label {
          background-color: hsl(var(--card));
          border-color: hsl(var(--border));
          color: hsl(var(--foreground));
        }

        .vis-time-axis .vis-text {
          color: hsl(var(--foreground));
        }

        .vis-current-time {
          background-color: hsl(var(--primary));
        }

        .timeline-event-content {
          line-height: 1.4;
        }

        .timeline-event-content strong {
          display: block;
          margin-bottom: 2px;
        }

        .timeline-event-content small {
          opacity: 0.9;
          font-size: 11px;
        }

        .vis-timeline .vis-grid.vis-minor {
          border-color: hsl(var(--border) / 0.3);
        }

        .vis-timeline .vis-grid.vis-major {
          border-color: hsl(var(--border) / 0.5);
        }
      `}</style>
    </div>
  );
}

