// Simple in-memory rate limiter for API routes
// For production, use Redis or similar

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimits = new Map<string, RateLimitEntry>();

export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimits.get(identifier);

  // Clean up old entries
  if (entry && entry.resetTime < now) {
    rateLimits.delete(identifier);
  }

  const current = rateLimits.get(identifier);

  if (!current || current.resetTime < now) {
    // Create new entry
    rateLimits.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      remaining: limit - 1,
      resetIn: windowMs,
    };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: current.resetTime - now,
    };
  }

  current.count++;
  return {
    allowed: true,
    remaining: limit - current.count,
    resetIn: current.resetTime - now,
  };
}

// Login-specific rate limiter (more restrictive)
export function checkLoginRateLimit(
  ip: string,
  email: string
): { allowed: boolean; attempts: number; locked: boolean } {
  const identifier = `login:${ip}:${email}`;
  const loginLimits = new Map<string, { attempts: number; lockUntil: number }>();

  const now = Date.now();
  const entry = loginLimits.get(identifier);

  if (entry && entry.lockUntil > now) {
    return {
      allowed: false,
      attempts: entry.attempts,
      locked: true,
    };
  }

  if (!entry) {
    loginLimits.set(identifier, { attempts: 1, lockUntil: 0 });
    return { allowed: true, attempts: 1, locked: false };
  }

  entry.attempts++;
  
  // Lock after 5 failed attempts for 15 minutes
  if (entry.attempts >= 5) {
    entry.lockUntil = now + 15 * 60 * 1000;
    return { allowed: false, attempts: entry.attempts, locked: true };
  }

  return { allowed: true, attempts: entry.attempts, locked: false };
}
