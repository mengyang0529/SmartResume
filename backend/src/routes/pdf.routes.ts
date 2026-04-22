import { Router, Request, Response, NextFunction } from 'express'
import { body, param, validationResult } from 'express-validator'
import axios from 'axios'
import { pdfRateLimit } from '../middleware/rateLimiter'
import { ValidationError, NotFoundError } from '../middleware/errorHandler'
import { config } from '../config/env'

const router = Router()

// Apply PDF-specific rate limiting
router.use(pdfRateLimit)

/**
 * @route   POST /api/v1/pdf/generate
 * @desc    Generate PDF from LaTeX source
 * @access  Private (or Public with API key)
 */
router.post(
  '/generate',
  [
    body('latex').notEmpty(),
    body('resumeId').optional().isUUID(),
    body('cacheKey').optional().isString(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new ValidationError(errors.mapped())
      }

      const { latex, resumeId, cacheKey } = req.body

      // Call LaTeX compilation service
      const latexServiceUrl = config.latexServiceUrl
      const compileResponse = await axios.post(
        `${latexServiceUrl}/compile`,
        { latex, cacheKey },
        { timeout: 60000 }
      )

      const compileData = compileResponse.data

      if (compileData.status !== 'success') {
        return res.status(500).json({
          status: 'error',
          message: compileData.message || 'LaTeX compilation failed',
          error: compileData.error,
        })
      }

      res.status(200).json({
        status: 'success',
        message: compileData.message || 'PDF generated successfully',
        data: {
          jobId: compileData.job_id || null,
          cacheKey: compileData.cache_key || compileData.cacheKey,
          cacheHit: compileData.cache_hit || compileData.cacheHit || false,
          compileTime: compileData.compile_time || compileData.compileTime,
          pdfUrl: `/api/v1/pdf/download/${compileData.cache_key || compileData.cacheKey}`,
          previewUrl: `/api/v1/pdf/preview/${compileData.cache_key || compileData.cacheKey}`,
          size: compileData.size || null,
          createdAt: new Date().toISOString(),
        },
      })
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return res.status(502).json({
          status: 'error',
          message: 'LaTeX compilation service unavailable',
          error: error.message,
        })
      }
      next(error)
    }
  }
)

/**
 * @route   POST /api/v1/pdf/generate-from-resume/:id
 * @desc    Generate PDF from an existing resume
 * @access  Private
 */
router.post(
  '/generate-from-resume/:id',
  [
    param('id').isUUID(),
    body('settings').optional().isObject(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new ValidationError(errors.mapped())
      }

      const { id } = req.params
      const { settings } = req.body

      // TODO:
      // 1. Fetch resume from database
      // 2. Apply settings overrides if provided
      // 3. Generate LaTeX from template
      // 4. Send to LaTeX compilation service

      res.status(202).json({
        status: 'success',
        message: 'PDF generation started',
        data: {
          jobId: 'job-456',
          resumeId: id,
          cacheKey: 'sha256-hash-from-resume',
        },
      })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * @route   GET /api/v1/pdf/jobs/:jobId
 * @desc    Get PDF generation job status
 * @access  Private (or Public with job ID)
 */
router.get(
  '/jobs/:jobId',
  [
    param('jobId').isUUID(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new ValidationError(errors.mapped())
      }

      const { jobId } = req.params

      // TODO: Fetch job status from database

      const mockJob = {
        id: jobId,
        status: 'completed', // pending, processing, completed, failed
        resumeId: 'resume-123',
        cacheKey: 'sha256-hash',
        compileTime: 2500,
        pdfUrl: '/api/v1/pdf/download/sha256-hash',
        error: null,
        createdAt: '2024-01-15T10:30:00Z',
        completedAt: '2024-01-15T10:30:02.500Z',
      }

      res.json({
        status: 'success',
        data: {
          job: mockJob,
        },
      })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * @route   GET /api/v1/pdf/download/:cacheKey
 * @desc    Download generated PDF
 * @access  Public (with cache key)
 */
router.get(
  '/download/:cacheKey',
  [
    param('cacheKey').matches(/^[a-f0-9]{64}$/),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new ValidationError(errors.mapped())
      }

      const { cacheKey } = req.params

      // Proxy download request to LaTeX service
      const latexServiceUrl = config.latexServiceUrl
      const pdfResponse = await axios.get(
        `${latexServiceUrl}/download/${cacheKey}`,
        { responseType: 'stream', timeout: 30000 }
      )

      res.set('Content-Type', String(pdfResponse.headers['content-type'] || 'application/pdf'))
      res.set('Content-Disposition', String(pdfResponse.headers['content-disposition'] || `attachment; filename="resume_${cacheKey.slice(0, 8)}.pdf"`))

      pdfResponse.data.pipe(res)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return next(new NotFoundError('PDF not found'))
        }
        return res.status(502).json({
          status: 'error',
          message: 'Failed to retrieve PDF from compilation service',
          error: error.message,
        })
      }
      next(error)
    }
  }
)

/**
 * @route   GET /api/v1/pdf/preview/:cacheKey
 * @desc    Preview PDF in browser (inline)
 * @access  Public (with cache key)
 */
router.get(
  '/preview/:cacheKey',
  [
    param('cacheKey').matches(/^[a-f0-9]{64}$/),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new ValidationError(errors.mapped())
      }

      const { cacheKey } = req.params

      // Proxy download request to LaTeX service but with inline disposition
      const latexServiceUrl = config.latexServiceUrl
      const pdfResponse = await axios.get(
        `${latexServiceUrl}/download/${cacheKey}`,
        { responseType: 'stream', timeout: 30000 }
      )

      res.set('Content-Type', String(pdfResponse.headers['content-type'] || 'application/pdf'))
      res.set('Content-Disposition', `inline; filename="preview_${cacheKey.slice(0, 8)}.pdf"`)

      pdfResponse.data.pipe(res)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return next(new NotFoundError('PDF not found'))
        }
        return res.status(502).json({
          status: 'error',
          message: 'Failed to retrieve PDF from compilation service',
          error: error.message,
        })
      }
      next(error)
    }
  }
)

/**
 * @route   POST /api/v1/pdf/batch
 * @desc    Generate multiple PDFs in batch
 * @access  Private (admin or with special permission)
 */
router.post(
  '/batch',
  [
    body('jobs').isArray({ min: 1, max: 10 }),
    body('jobs.*.latex').notEmpty(),
    body('jobs.*.id').optional().isString(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new ValidationError(errors.mapped())
      }

      const { jobs } = req.body

      // TODO: Process batch asynchronously
      // Use job queue for better performance

      res.status(202).json({
        status: 'success',
        message: 'Batch PDF generation started',
        data: {
          batchId: 'batch-789',
          jobCount: jobs.length,
          statusUrl: '/api/v1/pdf/batch/batch-789',
        },
      })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * @route   GET /api/v1/pdf/batch/:batchId
 * @desc    Get batch job status
 * @access  Private
 */
router.get(
  '/batch/:batchId',
  [
    param('batchId').isUUID(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new ValidationError(errors.mapped())
      }

      const { batchId } = req.params

      // TODO: Fetch batch status

      res.json({
        status: 'success',
        data: {
          batchId,
          status: 'processing', // pending, processing, completed, partial
          completed: 3,
          total: 5,
          failed: 1,
          jobs: [
            { id: 'job-1', status: 'completed' },
            { id: 'job-2', status: 'completed' },
            { id: 'job-3', status: 'completed' },
            { id: 'job-4', status: 'processing' },
            { id: 'job-5', status: 'failed', error: 'Compilation timeout' },
          ],
        },
      })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * @route   DELETE /api/v1/pdf/cache/:cacheKey
 * @desc    Delete cached PDF
 * @access  Private (admin)
 */
router.delete(
  '/cache/:cacheKey',
  [
    param('cacheKey').matches(/^[a-f0-9]{64}$/),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new ValidationError(errors.mapped())
      }

      const { cacheKey } = req.params

      // TODO: Delete from cache/storage

      res.json({
        status: 'success',
        message: 'Cached PDF deleted',
      })
    } catch (error) {
      next(error)
    }
  }
)

export { router as pdfRoutes }
