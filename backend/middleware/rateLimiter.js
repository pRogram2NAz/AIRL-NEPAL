const rateLimit = require('express-rate-limit');

/**
 * Login limiter — brute-force protection.
 * Max 10 attempts per IP per 15 minutes.
 * Responds with 429 and a clear message on breach.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,  // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,
  message: {
    error: 'Too many login attempts. Please try again in 15 minutes.',
  },
  skipSuccessfulRequests: true, // Only count failed attempts toward the limit
});

/**
 * Contact form limiter — spam protection.
 * Max 5 submissions per IP per hour.
 */
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many messages submitted. Please wait an hour before trying again.',
  },
});

/**
 * General API limiter — broad abuse protection on all routes.
 * Max 200 requests per IP per 15 minutes.
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please slow down.',
  },
});

module.exports = { loginLimiter, contactLimiter, globalLimiter };
