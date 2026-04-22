import { Router, Request, Response, NextFunction } from 'express'
import { body, param, query, validationResult, matchedData } from 'express-validator'
import { ValidationError, NotFoundError } from '../middleware/errorHandler'
import { ResumeService } from '../services/resume.service'

export function createResumeRoutes(resumeService: ResumeService) {
  const router = Router()

/**
 * @route   GET /api/v1/resumes
 * @desc    Get all resumes for current user
 * @access  Private
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt().default(1),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt().default(20),
    query('search').optional().trim(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new ValidationError(errors.mapped())
      }

      // Get validated and sanitized data
      const data = matchedData(req)
      const page = data.page || 1
      const limit = data.limit || 20
      const search = data.search

      // TODO: Get user ID from JWT token (mock for now)
      const userId = 'user-id-mock'

      const result = await resumeService.listResumes(userId, {
        page,
        limit,
        search
      })

      res.json({
        status: 'success',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * @route   POST /api/v1/resumes
 * @desc    Create a new resume
 * @access  Private
 */
router.post(
  '/',
  [
    body('title').trim().notEmpty(),
    body('content').isObject(),
    body('templateId').optional().isUUID(),
    body('settings').optional().isObject(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new ValidationError(errors.mapped())
      }

      const { title, content, templateId, settings } = req.body

      // TODO: Get user ID from JWT token (mock for now)
      const userId = 'user-id-mock'

      const resume = await resumeService.createResume(userId, {
        title,
        content,
        templateId,
        settings
      })

      res.status(201).json({
        status: 'success',
        message: 'Resume created successfully',
        data: {
          resume,
        },
      })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * @route   GET /api/v1/resumes/:id
 * @desc    Get a specific resume
 * @access  Private (or Public if resume is public)
 */
router.get(
  '/:id',
  [
    param('id').isUUID(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new ValidationError(errors.mapped())
      }

      const { id } = req.params

      // TODO: Get user ID from JWT token if authenticated
      const userId = req.user?.id // Will be set by auth middleware

      const resume = await resumeService.getResume(id, userId)

      if (!resume) {
        throw new NotFoundError('Resume not found')
      }

      res.json({
        status: 'success',
        data: {
          resume,
        },
      })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * @route   PUT /api/v1/resumes/:id
 * @desc    Update a resume
 * @access  Private
 */
router.put(
  '/:id',
  [
    param('id').isUUID(),
    body('title').optional().trim().notEmpty(),
    body('content').optional().isObject(),
    body('settings').optional().isObject(),
    body('isPublic').optional().isBoolean(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new ValidationError(errors.mapped())
      }

      const { id } = req.params
      const updates = req.body

      // TODO: Get user ID from JWT token
      const userId = 'user-id-mock'

      const resume = await resumeService.updateResume(id, userId, updates)

      res.json({
        status: 'success',
        message: 'Resume updated successfully',
        data: {
          resume,
        },
      })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * @route   DELETE /api/v1/resumes/:id
 * @desc    Delete a resume
 * @access  Private
 */
router.delete(
  '/:id',
  [
    param('id').isUUID(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new ValidationError(errors.mapped())
      }

      const { id } = req.params

      // TODO: Get user ID from JWT token
      const userId = 'user-id-mock'

      await resumeService.deleteResume(id, userId)

      res.json({
        status: 'success',
        message: 'Resume deleted successfully',
      })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * @route   POST /api/v1/resumes/:id/duplicate
 * @desc    Duplicate a resume
 * @access  Private
 */
router.post(
  '/:id/duplicate',
  [
    param('id').isUUID(),
    body('title').optional().trim().notEmpty(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new ValidationError(errors.mapped())
      }

      const { id } = req.params
      const { title } = req.body

      // TODO: Get user ID from JWT token
      const userId = 'user-id-mock'

      const newResume = await resumeService.duplicateResume(id, userId, title)

      res.status(201).json({
        status: 'success',
        message: 'Resume duplicated successfully',
        data: {
          resume: newResume,
        },
      })
    } catch (error) {
      next(error)
    }
  }
)

  return router
}

// Default export with default ResumeService instance for backward compatibility
// In test environment, create a mock service to avoid PrismaClient initialization
let resumeRoutes: Router
if (process.env.NODE_ENV === 'test') {
  // Mock service for tests
  const mockService = {
    listResumes: () => Promise.resolve({ resumes: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } }),
    createResume: () => Promise.resolve({ id: 'mock-id', title: 'Mock Resume' }),
    getResume: () => Promise.resolve(null),
    updateResume: () => Promise.resolve({ id: 'mock-id', title: 'Updated' }),
    deleteResume: () => Promise.resolve(),
    duplicateResume: () => Promise.resolve({ id: 'mock-id', title: 'Duplicate' }),
    incrementDownloadCount: () => Promise.resolve()
  }
  resumeRoutes = createResumeRoutes(mockService as any)
} else {
  const defaultResumeService = new ResumeService()
  resumeRoutes = createResumeRoutes(defaultResumeService)
}
export { resumeRoutes }