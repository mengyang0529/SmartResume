import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import Redis from 'ioredis'
import { config } from '../config/env'

// Create Redis client if URL is provided
let redisClient: Redis | undefined
let redisStore: any

if (config.redisUrl) {
  try {
    redisClient = new Redis(config.redisUrl)
    redisStore = new RedisStore({
      // @ts-expect-error - RedisStore expects a different Redis client type
      sendCommand: (...args: string[]) => redisClient!.call(...args),
    })

    redisClient.on('error', (err) => {
      console.warn('Redis connection error:', err.message)
    })

    redisClient.on('connect', () => {
      console.log('✅ Connected to Redis for rate limiting')
    })
  } catch (error) {
    console.warn('Failed to initialize Redis for rate limiting:', error)
  }
}

// Common rate limit configuration
const commonRateLimit = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: {
    status: 'error',
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  // Use Redis store if available, otherwise use memory
  store: redisStore,
  keyGenerator: (req) => {
    // Use IP address as default key
    return req.ip || 'unknown'
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health'
  },
})

// Stricter rate limit for PDF generation (expensive operation)
export const pdfRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increase to 200 requests per window for development
  message: {
    status: 'error',
    message: 'Too many PDF generation requests. Please wait before generating more PDFs.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore,
  keyGenerator: (req) => {
    // Include user ID if authenticated, otherwise use IP
    const userId = (req as any).user?.id
    return userId ? `user:${userId}` : req.ip || 'unknown'
  },
})

// Login/registration rate limiting
export const authRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 attempts per hour
  message: {
    status: 'error',
    message: 'Too many authentication attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore,
  skipSuccessfulRequests: true, // Only count failed attempts
})

// API key rate limiting (for external API access)
export const apiKeyRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // 1000 requests per hour per API key
  message: {
    status: 'error',
    message: 'API rate limit exceeded.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore,
  keyGenerator: (req) => {
    // Use API key from header or query parameter
    const apiKey = req.headers['x-api-key'] || req.query.apiKey
    return apiKey ? `api-key:${apiKey}` : req.ip || 'unknown'
  },
})

export { commonRateLimit as rateLimiter }