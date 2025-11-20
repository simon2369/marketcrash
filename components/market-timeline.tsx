'use client';

import { useEffect, useRef, useState } from 'react';
import { Timeline } from 'vis-timeline/standalone';
import { DataSet } from 'vis-data/peer';
import { CombinedEconomicIndicators } from '@/hooks/use-economic-indicators';

interface MarketTimelineProps {
  indicators?: CombinedEconomicIndicators;
  className?: string;
}

interface TimelineEvent {
  id: string;
  content: string;
  start: Date;
  end?: Date;
  type?: 'point' | 'range' | 'box';
  group?: string;
  className?: string;
  title?: string;
}

export function MarketTimeline({ indicators, className }: MarketTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineInstance = useRef<Timeline | null>(null);
  const [isClient, setIsClient] = useState(false);
  const indicatorsRef = useRef<string>('');
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);
  const containerSizeRef = useRef({ width: 0, height: 0 });
  const windowResizeRef = useRef<(() => void) | null>(null);
  const rafIdsRef = useRef<number[]>([]);
  const isInitializingRef = useRef(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    console.log('[Timeline] useEffect triggered', { isClient, hasRef: !!timelineRef.current });
    
    if (!isClient || !timelineRef.current) {
      console.log('[Timeline] Early return - not ready', { isClient, hasRef: !!timelineRef.current });
      return;
    }

    // Create a stable key from indicators to avoid unnecessary re-renders
    const indicatorsKey = indicators 
      ? `${indicators.cape?.status || 'none'}-${indicators.yieldCurve?.status || 'none'}-${indicators.marginDebt?.status || 'none'}-${indicators.buffett?.status || 'none'}`
      : 'no-indicators';
    
    console.log('[Timeline] Indicators key:', indicatorsKey, 'Current:', indicatorsRef.current);
    
    // Only recreate timeline if indicators actually changed
    if (timelineInstance.current && indicatorsRef.current === indicatorsKey) {
      console.log('[Timeline] Indicators unchanged, skipping recreation');
      return;
    }
    
    indicatorsRef.current = indicatorsKey;

    // Setup ResizeObserver to handle container size changes AND initial creation
    const setupResizeObserver = () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }

      resizeObserverRef.current = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          console.log('[Timeline] ResizeObserver fired', { 
            width, 
            height, 
            hasTimeline: !!timelineInstance.current,
            currentSize: containerSizeRef.current
          });
          
          // Check if element is visible
          if (!timelineRef.current) {
            console.log('[Timeline] ResizeObserver: No ref available');
            return;
          }
          const computedStyle = window.getComputedStyle(timelineRef.current);
          const isVisible = computedStyle.display !== 'none' && 
                           computedStyle.visibility !== 'hidden' &&
                           computedStyle.opacity !== '0';
          
          console.log('[Timeline] Visibility check', {
            display: computedStyle.display,
            visibility: computedStyle.visibility,
            opacity: computedStyle.opacity,
            isVisible,
            width,
            height,
            meetsSizeRequirement: width > 50 && height > 50
          });
          
          // If timeline doesn't exist yet and we have valid dimensions and visibility, create it
          if (!timelineInstance.current && width > 50 && height > 50 && isVisible) {
            console.log('[Timeline] ResizeObserver: Creating timeline (conditions met)');
            containerSizeRef.current = { width, height };
            const raf1 = requestAnimationFrame(() => {
              const raf2 = requestAnimationFrame(() => {
                createTimeline();
                setupWindowResizeListener();
                setupIntersectionObserver();
                rafIdsRef.current = rafIdsRef.current.filter(id => id !== raf1 && id !== raf2);
              });
              rafIdsRef.current.push(raf2);
            });
            rafIdsRef.current.push(raf1);
            return;
          }
          
          // If timeline exists, only redraw if size actually changed significantly
          if (timelineInstance.current && 
              (Math.abs(width - containerSizeRef.current.width) > 10 || 
               Math.abs(height - containerSizeRef.current.height) > 10)) {
            console.log('[Timeline] ResizeObserver: Redrawing timeline (size changed)');
            containerSizeRef.current = { width, height };
            
            requestAnimationFrame(() => {
              timelineInstance.current?.redraw();
              timelineInstance.current?.fit();
            });
          }
        }
      });

      if (timelineRef.current) {
        console.log('[Timeline] Setting up ResizeObserver');
        resizeObserverRef.current.observe(timelineRef.current);
        
        // Get initial size
        const rect = timelineRef.current.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(timelineRef.current);
        const isVisible = computedStyle.display !== 'none' && 
                         computedStyle.visibility !== 'hidden' &&
                         computedStyle.opacity !== '0';
        containerSizeRef.current = { width: rect.width, height: rect.height };
        
        console.log('[Timeline] Initial container check', {
          width: rect.width,
          height: rect.height,
          isVisible,
          display: computedStyle.display,
          visibility: computedStyle.visibility,
          opacity: computedStyle.opacity,
          hasTimeline: !!timelineInstance.current,
          willCreate: rect.width > 50 && rect.height > 50 && isVisible && !timelineInstance.current
        });
        
        // If we already have valid dimensions and visibility, create timeline immediately
        if (rect.width > 50 && rect.height > 50 && isVisible && !timelineInstance.current) {
          console.log('[Timeline] Creating timeline immediately (initial check passed)');
          const raf1 = requestAnimationFrame(() => {
            const raf2 = requestAnimationFrame(() => {
              createTimeline();
              setupWindowResizeListener();
              setupIntersectionObserver();
              rafIdsRef.current = rafIdsRef.current.filter(id => id !== raf1 && id !== raf2);
            });
            rafIdsRef.current.push(raf2);
          });
          rafIdsRef.current.push(raf1);
        } else {
          console.log('[Timeline] Not creating timeline yet - waiting for ResizeObserver', {
            reason: !(rect.width > 50) ? 'width too small' :
                    !(rect.height > 50) ? 'height too small' :
                    !isVisible ? 'not visible' :
                    timelineInstance.current ? 'already exists' : 'unknown'
          });
        }
      } else {
        console.log('[Timeline] setupResizeObserver: No ref available');
      }
    };

    // Setup window resize listener as backup
    const setupWindowResizeListener = () => {
      const handleResize = () => {
        if (timelineInstance.current && timelineRef.current) {
          const rect = timelineRef.current.getBoundingClientRect();
          const newWidth = rect.width;
          const newHeight = rect.height;
          
          // Only redraw if size actually changed significantly
          if (Math.abs(newWidth - containerSizeRef.current.width) > 10 || 
              Math.abs(newHeight - containerSizeRef.current.height) > 10) {
            containerSizeRef.current = { width: newWidth, height: newHeight };
            
            requestAnimationFrame(() => {
              timelineInstance.current?.redraw();
              timelineInstance.current?.fit();
            });
          }
        }
      };

      window.addEventListener('resize', handleResize, { passive: true });
      windowResizeRef.current = handleResize;
    };
    
    // Setup IntersectionObserver to trigger resize when timeline comes into view
    const setupIntersectionObserver = () => {
      if (intersectionObserverRef.current) {
        intersectionObserverRef.current.disconnect();
      }
      
      if (timelineRef.current && typeof IntersectionObserver !== 'undefined') {
        intersectionObserverRef.current = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && timelineInstance.current) {
              console.log('[Timeline] IntersectionObserver: Timeline entered viewport, forcing resize');
              // Force resize when timeline becomes visible
              window.dispatchEvent(new Event('resize'));
              requestAnimationFrame(() => {
                timelineInstance.current?.redraw();
                timelineInstance.current?.fit();
              });
            }
          });
        }, {
          threshold: 0.1 // Trigger when 10% visible
        });
        
        intersectionObserverRef.current.observe(timelineRef.current);
        console.log('[Timeline] IntersectionObserver set up');
      }
    };

    // Function to create the timeline
    const createTimeline = () => {
      console.log('[Timeline] createTimeline called', { 
        isInitializing: isInitializingRef.current,
        hasInstance: !!timelineInstance.current 
      });
      
      // Prevent multiple simultaneous initializations
      if (isInitializingRef.current || timelineInstance.current) {
        console.log('[Timeline] Already initializing or exists, skipping', {
          isInitializing: isInitializingRef.current,
          hasInstance: !!timelineInstance.current
        });
        return;
      }
      
      if (!timelineRef.current) {
        console.error('[Timeline] createTimeline: No ref available!');
        return;
      }
      
      isInitializingRef.current = true;
      
      const rect = timelineRef.current.getBoundingClientRect();
      console.log('[Timeline] createTimeline: Container dimensions', {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left
      });

      const startDate = new Date('2025-11-01');
      const endDate = new Date('2027-05-31');
      const today = new Date();

      const events: TimelineEvent[] = [];

      // Current date marker
      events.push({
        id: 'today',
        content: '📍 Today',
        start: today,
        type: 'point',
        group: 'current',
        className: 'timeline-today',
        title: 'Current Date',
      });

      // Add indicator-based events (handle undefined indicators gracefully)
      if (indicators) {
        let eventId = 0;

        // CAPE Ratio events
        if (indicators.cape && indicators.cape.status === 'danger') {
          events.push({
            id: `event-${eventId++}`,
            content: '🔴 CAPE Ratio DANGER',
            start: today,
            type: 'point',
            group: 'indicators',
            className: 'timeline-critical',
            title: `CAPE: ${indicators.cape.value.toFixed(1)} (Danger > ${indicators.cape.dangerLevel})`,
          });
        } else if (indicators.cape && indicators.cape.status === 'warning') {
          events.push({
            id: `event-${eventId++}`,
            content: '🟡 CAPE Warning',
            start: today,
            type: 'point',
            group: 'indicators',
            className: 'timeline-warning',
            title: `CAPE: ${indicators.cape.value.toFixed(1)} (Warning > ${indicators.cape.warningLevel})`,
          });
        }

        // Yield Curve events
        if (indicators.yieldCurve && indicators.yieldCurve.status === 'danger') {
          events.push({
            id: `event-${eventId++}`,
            content: '🔴 Yield Curve INVERTED',
            start: today,
            type: 'point',
            group: 'indicators',
            className: 'timeline-critical',
            title: `Yield Curve: ${indicators.yieldCurve.value.toFixed(2)}% (Inverted)`,
          });
        } else if (indicators.yieldCurve && indicators.yieldCurve.status === 'warning') {
          events.push({
            id: `event-${eventId++}`,
            content: '🟡 Yield Curve Warning',
            start: today,
            type: 'point',
            group: 'indicators',
            className: 'timeline-warning',
            title: `Yield Curve: ${indicators.yieldCurve.value.toFixed(2)}%`,
          });
        }

        // Margin Debt events
        if (indicators.marginDebt && indicators.marginDebt.status === 'danger') {
          events.push({
            id: `event-${eventId++}`,
            content: '🔴 Margin Debt EXTREME',
            start: today,
            type: 'point',
            group: 'indicators',
            className: 'timeline-critical',
            title: `Margin Debt: ${indicators.marginDebt.value.toFixed(1)}% GDP (Danger > ${indicators.marginDebt.dangerLevel}%)`,
          });
        }

        // Buffett Indicator events
        if (indicators.buffett && indicators.buffett.status === 'danger') {
          events.push({
            id: `event-${eventId++}`,
            content: '🔴 Buffett Indicator EXTREME',
            start: today,
            type: 'point',
            group: 'indicators',
            className: 'timeline-critical',
            title: `Market Cap/GDP: ${indicators.buffett.value.toFixed(1)}% (Danger > ${indicators.buffett.dangerLevel}%)`,
          });
        }
      }

      // Add future milestone markers
      const milestones = [
        { date: '2025-12-31', label: 'End of 2025', icon: '📅' },
        { date: '2026-03-31', label: 'Q1 2026 End', icon: '📊' },
        { date: '2026-06-30', label: 'Q2 2026 End', icon: '📊' },
        { date: '2026-09-30', label: 'Q3 2026 End', icon: '📊' },
        { date: '2026-12-31', label: 'End of 2026', icon: '📅' },
        { date: '2027-03-31', label: 'Q1 2027 End', icon: '📊' },
      ];

      milestones.forEach((milestone, idx) => {
        const milestoneDate = new Date(milestone.date);
        if (milestoneDate > today && milestoneDate <= endDate) {
          events.push({
            id: `milestone-${idx}`,
            content: `${milestone.icon} ${milestone.label}`,
            start: milestoneDate,
            type: 'point',
            group: 'milestones',
            className: 'timeline-milestone',
            title: milestone.label,
          });
        }
      });

      // Add historical crash reference periods
      events.push({
        id: 'crash-1929-ref',
        content: '1929 Crash (Reference)',
        start: new Date('2026-01-01'),
        end: new Date('2026-02-01'),
        type: 'range',
        group: 'history',
        className: 'timeline-history',
        title: 'Similar conditions to 1929 crash preceded by 6-24 months',
      });

      events.push({
        id: 'crash-2008-ref',
        content: '2008 Crash (Reference)',
        start: new Date('2026-06-01'),
        end: new Date('2026-07-01'),
        type: 'range',
        group: 'history',
        className: 'timeline-history',
        title: 'Similar conditions to 2008 crash preceded by 6-24 months',
      });

      // Define groups
      const groups = [
        { id: 'current', content: 'Current', className: 'timeline-group-current' },
        { id: 'indicators', content: 'Indicators', className: 'timeline-group-indicators' },
        { id: 'milestones', content: 'Milestones', className: 'timeline-group-milestones' },
        { id: 'history', content: 'Historical Ref', className: 'timeline-group-history' },
      ];

      // Get actual container dimensions for explicit sizing
      const containerRect = timelineRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width || 800; // Fallback to 800 if 0
      const containerHeight = containerRect.height || 500; // Fallback to 500 if 0
      
      console.log('[Timeline] Using container dimensions for options', {
        width: containerWidth,
        height: containerHeight
      });
      
      const options = {
        start: startDate,
        end: endDate,
        min: startDate,
        max: endDate,
        zoomMin: 1000 * 60 * 60 * 24 * 7,
        zoomMax: 1000 * 60 * 60 * 24 * 365 * 2,
        editable: false,
        selectable: true,
        stack: false,
        showCurrentTime: true,
        orientation: 'top',
        height: containerHeight,
        width: containerWidth,
        autoResize: true,
        groupOrder: 'id',
        margin: {
          item: 10,
          axis: 5,
        },
        format: {
          minorLabels: {
            month: 'MMM YYYY',
            year: 'YYYY',
          },
          majorLabels: {
            month: 'MMMM YYYY',
            year: 'YYYY',
          },
        },
      };

      try {
        console.log('[Timeline] Creating timeline instance', { 
          eventsCount: events.length, 
          groupsCount: groups.length,
          hasExistingInstance: !!timelineInstance.current
        });
        
        const existingInstance = timelineInstance.current;
        if (existingInstance) {
          console.log('[Timeline] Destroying existing timeline instance');
          existingInstance.destroy();
          timelineInstance.current = null;
        }

        if (!timelineRef.current) {
          console.error('[Timeline] createTimeline: Ref lost before creation!');
          return;
        }

        const itemsDataSet = new DataSet(events);
        const groupsDataSet = new DataSet(groups);
        
        console.log('[Timeline] Creating Timeline with options', {
          start: options.start,
          end: options.end,
          height: options.height,
          width: options.width
        });

        timelineInstance.current = new Timeline(
          timelineRef.current,
          itemsDataSet,
          groupsDataSet,
          options
        );
        
        console.log('[Timeline] Timeline instance created successfully!');
        
        // Immediately check if timeline rendered and force display
        // Use multiple timeouts to ensure timeline has time to render
        setTimeout(() => {
          if (timelineRef.current && timelineInstance.current) {
            const hasContent = timelineRef.current.querySelector('.vis-timeline') !== null;
            console.log('[Timeline] Immediate render check', {
              hasContent,
              containerChildren: timelineRef.current.children.length,
              containerInnerHTML: timelineRef.current.innerHTML.length
            });
            
            // Force timeline to render by triggering a REAL resize
            if (hasContent) {
              console.log('[Timeline] Content detected, forcing resize to display');
              
              // Force a real resize by temporarily changing container dimensions
              // This tricks the browser into thinking the container actually resized
              const container = timelineRef.current;
              const originalWidth = container.style.width;
              const originalHeight = container.style.height;
              const currentWidth = container.offsetWidth;
              const currentHeight = container.offsetHeight;
              
              // Temporarily change size to trigger real resize
              container.style.width = (currentWidth - 1) + 'px';
              
              requestAnimationFrame(() => {
                // Restore original size
                container.style.width = originalWidth;
                container.style.height = originalHeight;
                
                // Now trigger resize events - this should be a "real" resize
                window.dispatchEvent(new Event('resize'));
                
                if (timelineInstance.current) {
                  timelineInstance.current.redraw();
                  timelineInstance.current.fit();
                }
                
                // Additional triggers after delays
                setTimeout(() => {
                  window.dispatchEvent(new Event('resize'));
                  timelineInstance.current?.redraw();
                  timelineInstance.current?.fit();
                }, 50);
                
                setTimeout(() => {
                  window.dispatchEvent(new Event('resize'));
                  timelineInstance.current?.redraw();
                  timelineInstance.current?.fit();
                }, 200);
              });
            } else {
              console.log('[Timeline] No content detected, forcing immediate redraw');
              timelineInstance.current.redraw();
            }
          }
        }, 0);

        // Force initial render and focus
        const raf1 = requestAnimationFrame(() => {
          const raf2 = requestAnimationFrame(() => {
            if (timelineInstance.current) {
              try {
                console.log('[Timeline] Redrawing and focusing timeline');
                timelineInstance.current.redraw();
                timelineInstance.current.fit();
                if (events.some(e => e.id === 'today')) {
                  timelineInstance.current.focus('today', { animation: false });
                  console.log('[Timeline] Focused on "today" event');
                }
                
                // Force another redraw after a short delay to ensure rendering
                setTimeout(() => {
                  if (timelineInstance.current && timelineRef.current) {
                    console.log('[Timeline] Forcing final redraw after delay');
                    
                    // Multiple resize triggers to ensure timeline renders
                    const forceResize = () => {
                      // Direct timeline methods first
                      if (timelineInstance.current) {
                        timelineInstance.current.redraw();
                        timelineInstance.current.fit();
                      }
                      
                      // Then trigger resize event that timeline library listens to
                      const resizeEvent = new Event('resize', { bubbles: true });
                      window.dispatchEvent(resizeEvent);
                    };
                    
                    // Trigger multiple times with increasing delays
                    forceResize();
                    setTimeout(forceResize, 50);
                    setTimeout(forceResize, 100);
                    setTimeout(forceResize, 200);
                    setTimeout(() => {
                      forceResize();
                      
                      // Check if timeline DOM elements exist and are visible
                      const timelineElements = timelineRef.current.querySelectorAll('.vis-timeline, .vis-panel, .vis-item');
                      const visTimeline = timelineRef.current.querySelector('.vis-timeline') as HTMLElement;
                      
                      // Force visibility if needed
                      if (visTimeline) {
                        visTimeline.style.display = '';
                        visTimeline.style.visibility = '';
                        visTimeline.style.opacity = '';
                      }
                      
                      console.log('[Timeline] Timeline DOM check', {
                        containerExists: !!timelineRef.current,
                        timelineElements: timelineElements.length,
                        hasVisTimeline: !!visTimeline,
                        hasVisPanel: !!timelineRef.current.querySelector('.vis-panel'),
                        containerWidth: timelineRef.current.offsetWidth,
                        containerHeight: timelineRef.current.offsetHeight,
                        timelineDisplay: visTimeline ? window.getComputedStyle(visTimeline).display : 'N/A',
                        timelineVisibility: visTimeline ? window.getComputedStyle(visTimeline).visibility : 'N/A',
                        timelineOpacity: visTimeline ? window.getComputedStyle(visTimeline).opacity : 'N/A'
                      });
                    }, 300);
                  }
                  isInitializingRef.current = false;
                  console.log('[Timeline] Timeline initialization complete!');
                }, 100);
              } catch (err) {
                console.error('[Timeline] Error during redraw/focus:', err);
                isInitializingRef.current = false;
              }
            } else {
              console.error('[Timeline] Timeline instance lost during RAF!');
              isInitializingRef.current = false;
            }
            // Remove RAF IDs from tracking
            rafIdsRef.current = rafIdsRef.current.filter(id => id !== raf1 && id !== raf2);
          });
          rafIdsRef.current.push(raf2);
        });
        rafIdsRef.current.push(raf1);
      } catch (error) {
        console.error('[Timeline] Error initializing timeline:', error);
        isInitializingRef.current = false;
      }
    };

    // Set up ResizeObserver immediately - it will create timeline when container has dimensions
    // Use a small delay to ensure DOM is ready, and wait for document to be ready
    console.log('[Timeline] Setting up initialization', {
      readyState: document.readyState,
      delay: document.readyState === 'complete' ? 50 : 200
    });
    
    const initDelay = document.readyState === 'complete' ? 50 : 200;
    const timeoutId = setTimeout(() => {
      console.log('[Timeline] Initialization timeout fired - setting up ResizeObserver', {
        readyState: document.readyState
      });
      setupResizeObserver();
      
      // Fallback: if ResizeObserver doesn't fire within 500ms, try to create anyway
      setTimeout(() => {
        console.log('[Timeline] Fallback timeout (500ms) fired');
        if (!timelineInstance.current && timelineRef.current) {
          const rect = timelineRef.current.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(timelineRef.current);
          const isVisible = computedStyle.display !== 'none' && 
                           computedStyle.visibility !== 'hidden' &&
                           computedStyle.opacity !== '0';
          console.log('[Timeline] Fallback check', {
            width: rect.width,
            height: rect.height,
            isVisible,
            willCreate: rect.width > 50 && rect.height > 50 && isVisible
          });
          if (rect.width > 50 && rect.height > 50 && isVisible) {
            console.log('[Timeline] Fallback: Creating timeline');
            createTimeline();
            setupWindowResizeListener();
            setupIntersectionObserver();
          } else {
            console.warn('[Timeline] Fallback: Conditions not met, timeline not created', {
              width: rect.width,
              height: rect.height,
              isVisible
            });
          }
        } else {
          console.log('[Timeline] Fallback: Timeline already exists or no ref', {
            hasTimeline: !!timelineInstance.current,
            hasRef: !!timelineRef.current
          });
        }
      }, 500);
    }, 50);

    // Cleanup function
    return () => {
      console.log('[Timeline] Cleanup function called', { 
        isInitializing: isInitializingRef.current,
        pendingRAFs: rafIdsRef.current.length 
      });
      clearTimeout(timeoutId);
      
      // Cancel any pending RAF callbacks
      rafIdsRef.current.forEach(id => {
        cancelAnimationFrame(id);
      });
      rafIdsRef.current = [];
      
      // Clean up ResizeObserver
      if (resizeObserverRef.current) {
        console.log('[Timeline] Disconnecting ResizeObserver');
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      
      // Clean up IntersectionObserver
      if (intersectionObserverRef.current) {
        console.log('[Timeline] Disconnecting IntersectionObserver');
        intersectionObserverRef.current.disconnect();
        intersectionObserverRef.current = null;
      }
      
      // Clean up window resize listener
      if (windowResizeRef.current) {
        console.log('[Timeline] Removing window resize listener');
        window.removeEventListener('resize', windowResizeRef.current);
        windowResizeRef.current = null;
      }
      
      // Wait longer if we're still initializing, then destroy
      if (isInitializingRef.current || rafIdsRef.current.length > 0) {
        console.log('[Timeline] Still initializing or has pending RAFs, waiting before cleanup', {
          isInitializing: isInitializingRef.current,
          pendingRAFs: rafIdsRef.current.length
        });
        // Wait longer to ensure all RAF callbacks complete
        setTimeout(() => {
          // Cancel any remaining RAFs
          rafIdsRef.current.forEach(id => cancelAnimationFrame(id));
          rafIdsRef.current = [];
          
          const delayedInstance = timelineInstance.current;
          if (delayedInstance) {
            console.log('[Timeline] Destroying timeline instance (delayed)');
            delayedInstance.destroy();
            timelineInstance.current = null;
          }
          isInitializingRef.current = false;
        }, 500); // Increased delay to 500ms
      } else {
        const cleanupInstance = timelineInstance.current;
        if (cleanupInstance) {
          console.log('[Timeline] Destroying timeline instance');
          cleanupInstance.destroy();
          timelineInstance.current = null;
        }
      }
    };
  }, [isClient, indicators]);

  if (!isClient) {
    console.log('[Timeline] Rendering: Not client-side yet');
    return (
      <div className="w-full h-[500px] bg-slate-800/50 rounded-lg border border-slate-700 flex items-center justify-center">
        <div className="text-slate-400">Loading timeline...</div>
      </div>
    );
  }

  console.log('[Timeline] Rendering: Client-side, container should be mounted', {
    hasRef: !!timelineRef.current,
    hasTimeline: !!timelineInstance.current
  });
  
  return (
    <div className={className}>
      {/* Styles moved to globals.css; keeping component minimal */}
      <div 
        ref={timelineRef}
        className="w-full h-[500px] rounded-lg overflow-hidden bg-slate-800"
        style={{ minHeight: '500px', height: '500px', width: '100%', display: 'block', position: 'relative' }}
      />
      {/* Legend and tip unchanged */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-slate-400">Critical Alert</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className="text-slate-400">Warning</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-slate-400">Milestone</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span className="text-slate-400">Historical Reference</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-xs text-slate-500">
        💡 Tip: Scroll to zoom, drag to pan. Click events for details.
      </div>
    </div>
  );
}

