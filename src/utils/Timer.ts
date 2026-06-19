/**
 * Timer utility for performance measurement
 */
export class Timer {
  private startTime: number;
  private label: string;

  constructor(label = 'Timer') {
    this.label = label;
    this.startTime = performance.now();
  }

  /**
   * Get elapsed time in milliseconds
   */
  elapsed(): number {
    return performance.now() - this.startTime;
  }

  /**
   * Log elapsed time
   */
  log(): void {
    console.log(`[${this.label}] ${this.elapsed().toFixed(2)}ms`);
  }

  /**
   * Reset timer
   */
  reset(): void {
    this.startTime = performance.now();
  }
}
