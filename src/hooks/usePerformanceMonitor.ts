import { useEffect } from 'react';

interface PerformanceMetrics {
    lcp?: number; // Largest Contentful Paint
    fid?: number; // First Input Delay
    cls?: number; // Cumulative Layout Shift
    ttfb?: number; // Time to First Byte
    fcp?: number; // First Contentful Paint
}

/**
 * Hook for monitoring Core Web Vitals and performance metrics
 */
export function usePerformanceMonitor(
    onMetric?: (metric: { name: string; value: number; rating: 'good' | 'needs-improvement' | 'poor' }) => void
) {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const metrics: PerformanceMetrics = {};

        // Thresholds based on Google's Core Web Vitals
        const thresholds = {
            lcp: { good: 2500, poor: 4000 },
            fid: { good: 100, poor: 300 },
            cls: { good: 0.1, poor: 0.25 },
            ttfb: { good: 800, poor: 1800 },
            fcp: { good: 1800, poor: 3000 },
        };

        const getRating = (name: keyof typeof thresholds, value: number): 'good' | 'needs-improvement' | 'poor' => {
            const threshold = thresholds[name];
            if (value <= threshold.good) return 'good';
            if (value <= threshold.poor) return 'needs-improvement';
            return 'poor';
        };

        const reportMetric = (name: string, value: number) => {
            const rating = getRating(name as keyof typeof thresholds, value);
            console.log(`[Performance] ${name}: ${value.toFixed(2)}ms (${rating})`);
            onMetric?.({ name, value, rating });
        };

        // Observe LCP
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1] as any;
                    const lcp = lastEntry.renderTime || lastEntry.loadTime;
                    metrics.lcp = lcp;
                    reportMetric('LCP', lcp);
                });
                lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

                // Observe FID
                const fidObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach((entry: any) => {
                        const fid = entry.processingStart - entry.startTime;
                        metrics.fid = fid;
                        reportMetric('FID', fid);
                    });
                });
                fidObserver.observe({ type: 'first-input', buffered: true });

                // Observe CLS
                let clsValue = 0;
                const clsObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach((entry: any) => {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                            metrics.cls = clsValue;
                            reportMetric('CLS', clsValue);
                        }
                    });
                });
                clsObserver.observe({ type: 'layout-shift', buffered: true });

                return () => {
                    lcpObserver.disconnect();
                    fidObserver.disconnect();
                    clsObserver.disconnect();
                };
            } catch (e) {
                console.warn('Performance monitoring not supported:', e);
            }
        }

        // Navigation Timing API for TTFB and FCP
        if ('performance' in window && 'getEntriesByType' in window.performance) {
            const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
            if (navigationEntries.length > 0) {
                const navEntry = navigationEntries[0];
                const ttfb = navEntry.responseStart - navEntry.requestStart;
                metrics.ttfb = ttfb;
                reportMetric('TTFB', ttfb);
            }

            const paintEntries = performance.getEntriesByType('paint');
            const fcpEntry = paintEntries.find((entry) => entry.name === 'first-contentful-paint');
            if (fcpEntry) {
                metrics.fcp = fcpEntry.startTime;
                reportMetric('FCP', fcpEntry.startTime);
            }
        }
    }, [onMetric]);
}
