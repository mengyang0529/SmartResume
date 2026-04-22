import { Router } from 'express'

const router = Router()

/**
 * Authentication endpoints are disabled in this version.
 * The application operates without user accounts.
 */

router.post('/register', (_req, res) => {
  res.status(503).json({
    status: 'error',
    message: 'User registration is not available. The application operates without accounts.',
  })
})

router.post('/login', (_req, res) => {
  res.status(503).json({
    status: 'error',
    message: 'Login is not available. The application operates without accounts.',
  })
})

router.post('/logout', (_req, res) => {
  res.status(503).json({
    status: 'error',
    message: 'Logout is not available. The application operates without accounts.',
  })
})

router.get('/me', (_req, res) => {
  res.status(503).json({
    status: 'error',
    message: 'User profiles are not available. The application operates without accounts.',
  })
})

router.post('/refresh', (_req, res) => {
  res.status(503).json({
    status: 'error',
    message: 'Token refresh is not available. The application operates without accounts.',
  })
})

export { router as authRoutes }
