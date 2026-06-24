/**
 * Performance monitoring and logging utilities
 */

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private marks: Map<string, number> = new Map();

  /**
   * Start measuring a performance mark
   */
  startMark(name: string): void {
    this.marks.set(name, performance.now());
  }

  /**
   * End measuring and record the duration
   */
  endMark(name: string): number {
    const startTime = this.marks.get(name);
    if (!startTime) {
      console.warn(`Mark "${name}" not found`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.metrics.push({
      name,
      duration,
      timestamp: Date.now()
    });

    this.marks.delete(name);
    return duration;
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics by name
   */
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.name === name);
  }

  /**
   * Get average duration for a metric
   */
  getAverageDuration(name: string): number {
    const metrics = this.getMetricsByName(name);
    if (metrics.length === 0) return 0;
    const total = metrics.reduce((sum, m) => sum + m.duration, 0);
    return total / metrics.length;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.marks.clear();
  }

  /**
   * Log performance summary
   */
  logSummary(): void {
    console.group('Performance Summary');
    const summary = this.getSummary();
    Object.entries(summary).forEach(([name, stats]) => {
      console.log(`${name}:`, stats);
    });
    console.groupEnd();
  }

  /**
   * Get performance summary grouped by name
   */
  private getSummary(): Record<string, { count: number; avg: number; min: number; max: number }> {
    const summary: Record<string, PerformanceMetric[]> = {};
    
    this.metrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = [];
      }
      summary[metric.name].push(metric);
    });

    const result: Record<string, { count: number; avg: number; min: number; max: number }> = {};
    
    Object.entries(summary).forEach(([name, metrics]) => {
      const durations = metrics.map(m => m.duration);
      result[name] = {
        count: metrics.length,
        avg: durations.reduce((a, b) => a + b, 0) / durations.length,
        min: Math.min(...durations),
        max: Math.max(...durations)
      };
    });

    return result;
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * Measure async function performance
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  performanceMonitor.startMark(name);
  try {
    return await fn();
  } finally {
    performanceMonitor.endMark(name);
  }
}

/**
 * Log error with context
 */
export function logError(error: Error, context?: Record<string, unknown>): void {
  console.error('Error:', error.message, context || '');
  
  // In production, you would send this to an error tracking service
  if (import.meta.env.PROD) {
    // Send to error tracking service (e.g., Sentry)
    console.error('Production error logged:', error);
  }
}

/**
 * Log warning with context
 */
export function logWarning(message: string, context?: Record<string, unknown>): void {
  console.warn('Warning:', message, context || '');
}
