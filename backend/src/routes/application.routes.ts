import { Router, Request, Response, NextFunction } from 'express'
import { body, param, query, validationResult } from 'express-validator'
import { ValidationError } from '../middleware/errorHandler'
import { ApplicationService } from '../services/application.service'

export function createApplicationRoutes(applicationService: ApplicationService) {
  const router = Router()

  router.get(
    '/',
    [
      query('status').optional().isString(),
      query('company').optional().trim(),
      query('page').optional().isInt({ min: 1 }).toInt().default(1),
      query('limit').optional().isInt({ min: 1, max: 100 }).toInt().default(50),
    ],
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
          throw new ValidationError(errors.mapped())
        }

        const userId = 'user-id-mock'
        const applications = await applicationService.listApplications(userId)

        res.json({ status: 'success', data: { applications } })
      } catch (error) {
        next(error)
      }
    }
  )

  router.get(
    '/:id',
    [param('id').isUUID()],
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
          throw new ValidationError(errors.mapped())
        }

        const { id } = req.params
        const userId = 'user-id-mock'
        const application = await applicationService.getApplication(id, userId)

        if (!application) {
          return res.status(404).json({ status: 'error', message: 'Application not found' })
        }

        res.json({ status: 'success', data: { application } })
      } catch (error) {
        next(error)
      }
    }
  )

  router.post(
    '/',
    [
      body('company').trim().notEmpty(),
      body('jobTitle').trim().notEmpty(),
      body('location').optional().trim(),
      body('status').optional().isString(),
      body('stage').optional().trim(),
      body('appliedAt').optional().isISO8601(),
      body('source').optional().trim(),
      body('notes').optional().trim(),
      body('resumeId').optional().isUUID(),
    ],
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
          throw new ValidationError(errors.mapped())
        }

        const userId = 'user-id-mock'
        const application = await applicationService.createApplication(userId, req.body)

        res.status(201).json({ status: 'success', message: 'Application created', data: { application } })
      } catch (error) {
        next(error)
      }
    }
  )

  router.put(
    '/:id',
    [
      param('id').isUUID(),
      body('company').optional().trim().notEmpty(),
      body('jobTitle').optional().trim().notEmpty(),
      body('location').optional().trim(),
      body('status').optional().isString(),
      body('stage').optional().trim(),
      body('appliedAt').optional().isISO8601(),
      body('source').optional().trim(),
      body('notes').optional().trim(),
      body('resumeId').optional().isUUID(),
    ],
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
          throw new ValidationError(errors.mapped())
        }

        const { id } = req.params
        const userId = 'user-id-mock'
        const application = await applicationService.updateApplication(id, userId, req.body)

        res.json({ status: 'success', message: 'Application updated', data: { application } })
      } catch (error) {
        next(error)
      }
    }
  )

  router.delete(
    '/:id',
    [param('id').isUUID()],
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
          throw new ValidationError(errors.mapped())
        }

        const { id } = req.params
        const userId = 'user-id-mock'
        await applicationService.deleteApplication(id, userId)

        res.json({ status: 'success', message: 'Application deleted' })
      } catch (error) {
        next(error)
      }
    }
  )

  router.get(
    '/:id/interviews',
    [param('id').isUUID()],
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
          throw new ValidationError(errors.mapped())
        }

        const { id } = req.params
        const userId = 'user-id-mock'
        const interviews = await applicationService.listInterviews(id, userId)

        res.json({ status: 'success', data: { interviews } })
      } catch (error) {
        next(error)
      }
    }
  )

  router.post(
    '/:id/interviews',
    [
      param('id').isUUID(),
      body('round').optional().isInt({ min: 1 }).toInt(),
      body('interviewType').optional().trim(),
      body('interviewer').optional().trim(),
      body('scheduledAt').optional().isISO8601(),
      body('outcome').optional().trim(),
      body('feedback').optional().trim(),
      body('notes').optional().trim(),
    ],
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
          throw new ValidationError(errors.mapped())
        }

        const { id } = req.params
        const interview = await applicationService.createInterview({
          applicationId: id,
          ...req.body,
        })

        res.status(201).json({ status: 'success', message: 'Interview created', data: { interview } })
      } catch (error) {
        next(error)
      }
    }
  )

  return router
}

let applicationRoutes: Router
if (process.env.NODE_ENV === 'test') {
  const mockService = {
    listApplications: () => Promise.resolve([]),
    getApplication: () => Promise.resolve(null),
    createApplication: () => Promise.resolve(null),
    updateApplication: () => Promise.resolve(null),
    deleteApplication: () => Promise.resolve(true),
    listInterviews: () => Promise.resolve([]),
    createInterview: () => Promise.resolve(null),
  }
  applicationRoutes = createApplicationRoutes(mockService as any)
} else {
  applicationRoutes = createApplicationRoutes(new ApplicationService())
}

export { applicationRoutes }
