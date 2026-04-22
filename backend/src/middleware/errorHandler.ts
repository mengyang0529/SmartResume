import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import { config } from '../config/env'

// Custom error classes
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export class ValidationError extends AppError {
  constructor(public errors: Record<string, any>) {
    super(400, 'Validation failed')
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message)
    Object.setPrototypeOf(this, UnauthorizedError.prototype)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message)
    Object.setPrototypeOf(this, ForbiddenError.prototype)
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, message)
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(409, message)
    Object.setPrototypeOf(this, ConflictError.prototype)
  }
}

// Error response interface
interface ErrorResponse {
  status: 'error'
  message: string
  errors?: Record<string, string[]>
  stack?: string
}

// Not found handler
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`)
  next(error)
}

// Global error handler
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Default error values
  let statusCode = 500
  let message = 'Internal server error'
  let errors: Record<string, string[]> | undefined

  // Handle known error types
  if (error instanceof AppError) {
    statusCode = error.statusCode
    message = error.message

    if (error instanceof ValidationError) {
      errors = error.errors
    }
  } else if (error instanceof ZodError) {
    // Zod validation errors
    statusCode = 400
    message = 'Validation failed'
    errors = {}

    error.errors.forEach((err) => {
      const path = err.path.join('.')
      if (!errors![path]) {
        errors![path] = []
      }
      errors![path].push(err.message)
    })
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Prisma errors
    statusCode = 400
    message = 'Database error'

    switch (error.code) {
      case 'P2002':
        message = 'Unique constraint violation'
        break
      case 'P2025':
        message = 'Record not found'
        statusCode = 404
        break
      default:
        message = `Database error: ${error.code}`
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400
    message = 'Invalid database query'
  }

  // Log error
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    statusCode,
    timestamp: new Date().toISOString(),
  })

  // Build response
  const errorResponse: ErrorResponse = {
    status: 'error',
    message,
  }

  // Add validation errors if present
  if (errors && Object.keys(errors).length > 0) {
    errorResponse.errors = errors
  }

  // Add stack trace in development
  if (config.isDevelopment && error.stack) {
    errorResponse.stack = error.stack
  }

  // Send response
  res.status(statusCode).json(errorResponse)
}