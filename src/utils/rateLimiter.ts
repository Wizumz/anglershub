// Client-side rate limiter to prevent excessive API calls
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 5) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now >= entry.resetTime) {
      // First request or window expired, allow and reset
      this.limits.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (entry.count >= this.maxRequests) {
      // Rate limit exceeded
      return false;
    }

    // Increment count and allow
    entry.count++;
    this.limits.set(key, entry);
    return true;
  }

  getTimeUntilReset(key: string): number {
    const entry = this.limits.get(key);
    if (!entry) return 0;
    return Math.max(0, entry.resetTime - Date.now());
  }

  clearKey(key: string): void {
    this.limits.delete(key);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now >= entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

// Create shared instances for different API endpoints
export const marineApiLimiter = new RateLimiter(60000, 3); // 3 requests per minute for marine API
export const tideApiLimiter = new RateLimiter(60000, 5); // 5 requests per minute for tide API
export const weatherApiLimiter = new RateLimiter(60000, 10); // 10 requests per minute for weather API

// Clean up old entries periodically
setInterval(() => {
  marineApiLimiter.cleanup();
  tideApiLimiter.cleanup();
  weatherApiLimiter.cleanup();
}, 60000);