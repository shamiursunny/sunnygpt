// Rate limiter utility for production
// Built by Shamiur Rashid Sunny (shamiur.com)
// Simple in-memory rate limiting to prevent API abuse

interface RateLimitEntry {
    count: number
    resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up old entries every 5 minutes
setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key)
        }
    }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
    maxRequests: number
    windowMs: number
}

export function rateLimit(identifier: string, config: RateLimitConfig): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const entry = rateLimitStore.get(identifier)

    // No existing entry or expired
    if (!entry || now > entry.resetTime) {
        const resetTime = now + config.windowMs
        rateLimitStore.set(identifier, { count: 1, resetTime })
        return { allowed: true, remaining: config.maxRequests - 1, resetTime }
    }

    // Increment count
    entry.count++

    // Check if exceeded
    if (entry.count > config.maxRequests) {
        return { allowed: false, remaining: 0, resetTime: entry.resetTime }
    }

    return { allowed: true, remaining: config.maxRequests - entry.count, resetTime: entry.resetTime }
}

export function getRateLimitHeaders(result: { remaining: number; resetTime: number }) {
    return {
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
    }
}
