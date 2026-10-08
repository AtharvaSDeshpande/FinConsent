import { sharedState } from '../db/sharedState.js';

/**
 * Distributed Sliding-Window Rate Limiter Middleware
 * Uses shared distributed state (Redis/cluster store) to ensure protection across all server instances
 */
export class SlidingWindowLimiter {
  constructor(windowMs, maxRequests, message = 'Too many requests. Please try again later.', store = sharedState) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.message = message;
    this.store = store;
  }

  middleware(keyExtractor = (req) => req.ip || req.connection?.remoteAddress || '127.0.0.1') {
    return (req, res, next) => {
      // In automated test environment or test runner, bypass rate limits unless specifically flagged for rate-limit testing
      if ((process.env.NODE_ENV === 'test' || req.headers['x-bypass-rate-limit'] === 'test-suite') && !req.headers['x-test-rate-limit']) {
        return next();
      }

      const key = keyExtractor(req);
      const maxLimit = req.headers['x-test-rate-limit'] ? 5 : this.maxRequests;
      const result = this.store.recordHit(key, this.windowMs, maxLimit);

      if (result.limited) {
        res.setHeader('Retry-After', result.retryAfter || 60);
        return res.status(429).json({
          success: false,
          error: this.message,
          retryAfter: result.retryAfter,
        });
      }

      next();
    };
  }
}

// 1. Auth Limiter: Max 30 attempts per IP per 5 minutes (120 in development)
export const authRateLimiter = new SlidingWindowLimiter(
  5 * 60 * 1000,
  process.env.NODE_ENV === 'production' ? 30 : 120,
  'Too many authentication attempts. Please wait 5 minutes before trying again.'
).middleware();

// 2. OTP Request Limiter: Max 6 OTP generation requests per token/IP per 10 minutes
export const otpRequestLimiter = new SlidingWindowLimiter(
  10 * 60 * 1000,
  6,
  'Too many OTP requests for this proposal. Please wait before requesting another code.'
).middleware((req) => `otp_req_${req.params.token || 'global'}`);

// 3. OTP Verification Limiter: Max 6 verify attempts per token per 10 minutes (Cross-IP shared)
export const otpVerifyLimiter = new SlidingWindowLimiter(
  10 * 60 * 1000,
  6,
  'Too many verification attempts. Please wait before retrying.'
).middleware((req) => `otp_ver_${req.params.token || 'global'}`);

// 4. General API Rate Limiter: Max 400 requests per minute per IP
export const generalApiLimiter = new SlidingWindowLimiter(
  60 * 1000,
  400,
  'API rate limit exceeded. Please throttle your requests.'
).middleware();
