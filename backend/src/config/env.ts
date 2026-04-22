import dotenv from 'dotenv'
import { z } from 'zod'

// Load environment variables
dotenv.config()

// Environment schema validation
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  SESSION_SECRET: z.string().min(32),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  LATEX_SERVICE_URL: z.string().url().default('http://localhost:5050'),
  REDIS_URL: z.string().url().optional(),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  API_KEY: z.string().optional(),
})

// Parse and validate environment variables
const envParseResult = envSchema.safeParse(process.env)

if (!envParseResult.success) {
  console.error('❌ Invalid environment variables:', envParseResult.error.format())
  process.exit(1)
}

export const config = {
  nodeEnv: envParseResult.data.NODE_ENV,
  port: envParseResult.data.PORT,
  databaseUrl: envParseResult.data.DATABASE_URL,
  jwtSecret: envParseResult.data.JWT_SECRET,
  sessionSecret: envParseResult.data.SESSION_SECRET,
  corsOrigin: envParseResult.data.CORS_ORIGIN,
  latexServiceUrl: envParseResult.data.LATEX_SERVICE_URL,
  redisUrl: envParseResult.data.REDIS_URL,
  rateLimitWindowMs: envParseResult.data.RATE_LIMIT_WINDOW_MS,
  rateLimitMaxRequests: envParseResult.data.RATE_LIMIT_MAX_REQUESTS,
  apiKey: envParseResult.data.API_KEY,
  version: process.env.npm_package_version || '1.0.0',
  isProduction: envParseResult.data.NODE_ENV === 'production',
  isDevelopment: envParseResult.data.NODE_ENV === 'development',
  isTest: envParseResult.data.NODE_ENV === 'test',
}

// Type exports
export type Config = typeof config