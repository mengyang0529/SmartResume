import { Router, Request, Response, NextFunction } from 'express'
import { body, param, validationResult } from 'express-validator'
import axios from 'axios'
import { pdfRateLimit } from '../middleware/rateLimiter'
import { ValidationError, NotFoundError } from '../middleware/errorHandler'
import { config } from '../config/env'
import { ResumeService } from '../services/resume.service'
import { TypstService } from '../services/typst.service'
import { TemplateSettings } from '../types/resume'

export function createPdfRoutes(resumeService: ResumeService, typstService: TypstService) {
  const router = Router()

  // Apply PDF-specific rate limiting
  router.use(pdfRateLimit)

  /**
   * @route   GET /api/v1/pdf/refresh-all-previews
   * @desc    Force re-generate all gallery preview PDFs
   * @access  Admin (Public for dev)
   */
  router.get(
    '/refresh-all-previews',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const templates = [
          'classic-professional',
          'modern-tech',
          'academic-cv',
          'creative-portfolio',
          'executive-level',
          'cover-letter'
        ];

        // 1. Clear cache
        await axios.post(`${config.typstServiceUrl}/cache/clear`);

        const sampleData = await resumeService.getSampleResume();
        const results = [];

        for (const templateName of templates) {
          const sampleCacheKey = `sample-${templateName}`;
          const settings = {
            fontSize: '11pt' as const,
            paperSize: 'a4paper' as const,
            colorScheme: (templateName === 'academic-cv' ? 'black' : 
                        templateName === 'modern-tech' ? 'awesome-skyblue' :
                        templateName === 'creative-portfolio' ? 'awesome-emerald' :
                        templateName === 'executive-level' ? 'awesome-concrete' : 'awesome-red') as TemplateSettings['colorScheme'],
            headerAlignment: 'C' as const,
            sectionColorHighlight: templateName !== 'academic-cv',
            className: templateName
          };

          const typst = typstService.generateResumeTypst(sampleData as any, settings);
          const compileResponse = await axios.post(
            `${config.typstServiceUrl}/compile`,
            { typst, cacheKey: sampleCacheKey },
            { timeout: 60000 }
          );
          
          results.push({
            template: templateName,
            status: compileResponse.data.status
          });
        }

        res.json({
          status: 'success',
          message: 'All previews refreshed',
          results
        });
      } catch (error) {
        next(error);
      }
    }
  );

  /**
   * @route   GET /api/v1/pdf/preview-template/:templateName
   * @desc    Generate a preview PDF for a specific template using sample data
   * @access  Public
   */
  router.get(
    '/preview-template/:templateName',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { templateName } = req.params
        
        // 1. Create a deterministic cache key for this template's sample
        // This acts as our "database lookup" for the pre-generated PDF
        const sampleCacheKey = `sample-${templateName}`

        // 2. We can first check if it exists (optional, but compile endpoint handles this)
        // By passing the cacheKey to the compile service, it will return the existing 
        // PDF if it was already generated for this key.
        
        const sampleData = await resumeService.getSampleResume()
        
        const settings = {
          fontSize: '11pt' as const,
          paperSize: 'a4paper' as const,
          colorScheme: (templateName === 'academic-cv' ? 'black' : 'awesome-skyblue') as TemplateSettings['colorScheme'],
          headerAlignment: 'C' as const,
          sectionColorHighlight: templateName !== 'academic-cv',
          className: templateName
        }

        const typst = typstService.generateResumeTypst(sampleData as any, settings)

        // Call Typst compilation service with our specific cacheKey
        const typstServiceUrl = config.typstServiceUrl
        const compileResponse = await axios.post(
          `${typstServiceUrl}/compile`,
          { 
            typst, 
            cacheKey: sampleCacheKey // Force the use of our deterministic key
          },
          { timeout: 60000 }
        )

        if (compileResponse.data.status !== 'success') {
          return res.status(500).json({
            status: 'error',
            message: 'Typst compilation failed',
            error: compileResponse.data.error,
          })
        }

        // The response will indicate if it was a "cache_hit"
        res.json({
          status: 'success',
          data: {
            cacheKey: compileResponse.data.cache_key,
            cacheHit: compileResponse.data.cache_hit,
            previewUrl: `/api/v1/pdf/preview/${compileResponse.data.cache_key}`,
          }
        })
      } catch (error) {
        next(error)
      }
    }
  )

  /**
   * @route   POST /api/v1/pdf/generate
   * @desc    Generate PDF from Typst source
   * @access  Private (or Public with API key)
   */
  router.post(
    '/generate',
    [
      body('typst').notEmpty(),
      body('resumeId').optional().isUUID(),
      body('cacheKey').optional().isString(),
    ],
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
          throw new ValidationError(errors.mapped())
        }

        const { typst, resumeId, cacheKey } = req.body

        // Call Typst compilation service
        const typstServiceUrl = config.typstServiceUrl
        const compileResponse = await axios.post(
          `${typstServiceUrl}/compile`,
          { typst, cacheKey },
          { timeout: 60000 }
        )

        const compileData = compileResponse.data

        if (compileData.status !== 'success') {
          return res.status(500).json({
            status: 'error',
            message: compileData.message || 'Typst compilation failed',
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
          console.error('Typst Service Axios Error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url,
          })
          return res.status(502).json({
            status: 'error',
            message: 'Typst compilation service unavailable',
            error: error.message,
            details: error.response?.data
          })
        }
        console.error('PDF Generation Unexpected Error:', error)
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
        // 3. Generate Typst from template
        // 4. Send to Typst compilation service

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

        // Proxy download request to Typst service
        const typstServiceUrl = config.typstServiceUrl
        const pdfResponse = await axios.get(
          `${typstServiceUrl}/download/${cacheKey}`,
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

        // Proxy download request to Typst service but with inline disposition
        const typstServiceUrl = config.typstServiceUrl
        const pdfResponse = await axios.get(
          `${typstServiceUrl}/download/${cacheKey}`,
          { responseType: 'stream', timeout: 30000 }
        )

        res.set('Content-Type', String(pdfResponse.headers['content-type'] || 'application/pdf'))
        res.set('Content-Disposition', `inline; filename="preview_${cacheKey.slice(0, 8)}.pdf"`)
        // Override any global CSP that might prevent framing
        res.set('X-Frame-Options', 'ALLOWALL')
        res.set('Content-Security-Policy', "frame-ancestors 'self' *")

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
      body('jobs.*.typst').notEmpty(),
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

  return router
}

// Default export with instances for backward compatibility
let pdfRoutes: Router
if (process.env.NODE_ENV === 'test') {
  pdfRoutes = createPdfRoutes({} as any, {} as any)
} else {
  pdfRoutes = createPdfRoutes(new ResumeService(), new TypstService())
}
export { pdfRoutes }
