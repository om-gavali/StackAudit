const rateLimit = require('express-rate-limit');

// Auth routes: 5 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429
});

// General API: 60 requests per minute per IP
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: {
    success: false,
    error: 'Too many requests. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429
});

// AI endpoints: 10 requests per minute per IP/User
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: {
    success: false,
    error: 'AI analysis limits exceeded. Please wait a minute before running another audit.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429
});

module.exports = {
  authLimiter,
  generalLimiter,
  aiLimiter
};
