import { Router, Request, Response, NextFunction } from 'express'
import { body, param, query, validationResult } from 'express-validator'
import { ValidationError, NotFoundError } from '../middleware/errorHandler'

const router = Router()

/**
 * @route   GET /api/v1/templates
 * @desc    Get all templates
 * @access  Public (or Private for user templates)
 */
router.get(
  '/',
  [
    query('category').optional().isIn(['resume', 'cv', 'cover-letter']),
    query('public').optional().isBoolean(),
    query('page').optional().isInt({ min: 1 }).default(1),
    query('limit').optional().isInt({ min: 1, max: 100 }).default(20),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new ValidationError(errors.mapped())
      }

      const { category, public: _isPublic, page, limit } = req.query

      // TODO: Fetch templates from database with filters

      const mockTemplates = [
        {
          id: 'template-1',
          name: 'Classic Professional',
          category: 'resume',
          description: 'Clean, traditional design suitable for all industries',
          thumbnail: 'https://example.com/thumbnail1.jpg',
          isPublic: true,
          isDefault: true,
          downloadCount: 12500,
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'template-2',
          name: 'Modern Tech',
          category: 'resume',
          description: 'Contemporary design perfect for tech and engineering roles',
          thumbnail: 'https://example.com/thumbnail2.jpg',
          isPublic: true,
          isDefault: false,
          downloadCount: 9800,
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'template-3',
          name: 'Academic CV',
          category: 'cv',
          description: 'Comprehensive template for academic and research positions',
          thumbnail: 'https://example.com/thumbnail3.jpg',
          isPublic: true,
          isDefault: true,
          downloadCount: 7600,
          createdAt: '2024-01-01T00:00:00Z',
        },
      ]

      res.json({
        status: 'success',
        data: {
          templates: mockTemplates,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: mockTemplates.length,
            pages: 1,
          },
        },
      })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * @route   GET /api/v1/templates/:id
 * @desc    Get a specific template
 * @access  Public (or Private for user templates)
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

      // TODO: Fetch template from database

      const mockTemplate = {
        id,
        name: 'Classic Professional',
        category: 'resume',
        description: 'Clean, traditional design suitable for all industries',
        latexTemplate: '\\documentclass{classic-professional}\n% Template definition...',
        settingsSchema: {
          type: 'object',
          properties: {
            colorScheme: {
              type: 'string',
              enum: ['blue', 'green', 'purple'],
              default: 'blue',
            },
            fontSize: {
              type: 'string',
              enum: ['10pt', '11pt', '12pt'],
              default: '11pt',
            },
          },
        },
        thumbnail: 'https://example.com/thumbnail1.jpg',
        isPublic: true,
        isDefault: true,
        downloadCount: 12500,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      if (!mockTemplate) {
        throw new NotFoundError('Template not found')
      }

      res.json({
        status: 'success',
        data: {
          template: mockTemplate,
        },
      })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * @route   POST /api/v1/templates
 * @desc    Create a new template (admin or user)
 * @access  Private
 */
router.post(
  '/',
  [
    body('name').trim().notEmpty(),
    body('category').isIn(['resume', 'cv', 'cover-letter']),
    body('description').optional().trim(),
    body('latexTemplate').notEmpty(),
    body('settingsSchema').optional().isObject(),
    body('isPublic').optional().isBoolean(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new ValidationError(errors.mapped())
      }

      const { name, category, description, latexTemplate, settingsSchema, isPublic } = req.body

      // TODO: Create template in database
      // Validate LaTeX template syntax?

      const newTemplate = {
        id: 'new-template-id',
        name,
        category,
        description: description || '',
        latexTemplate,
        settingsSchema: settingsSchema || {},
        isPublic: isPublic !== undefined ? isPublic : false,
        isDefault: false,
        downloadCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      res.status(201).json({
        status: 'success',
        message: 'Template created successfully',
        data: {
          template: newTemplate,
        },
      })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * @route   PUT /api/v1/templates/:id
 * @desc    Update a template
 * @access  Private (admin or template owner)
 */
router.put(
  '/:id',
  [
    param('id').isUUID(),
    body('name').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('latexTemplate').optional().notEmpty(),
    body('settingsSchema').optional().isObject(),
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

      // TODO: Update template in database
      // Check permissions first

      res.json({
        status: 'success',
        message: 'Template updated successfully',
        data: {
          template: {
            id,
            ...updates,
            updatedAt: new Date().toISOString(),
          },
        },
      })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * @route   DELETE /api/v1/templates/:id
 * @desc    Delete a template
 * @access  Private (admin or template owner)
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

      // TODO: Delete template from database
      // Cannot delete default templates

      res.json({
        status: 'success',
        message: 'Template deleted successfully',
      })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * @route   POST /api/v1/templates/:id/duplicate
 * @desc    Duplicate a template
 * @access  Private
 */
router.post(
  '/:id/duplicate',
  [
    param('id').isUUID(),
    body('name').optional().trim().notEmpty(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new ValidationError(errors.mapped())
      }

      const { id } = req.params
      const { name } = req.body

      // TODO: Duplicate template
      // Reset download count, etc.

      res.status(201).json({
        status: 'success',
        message: 'Template duplicated successfully',
        data: {
          template: {
            id: 'new-template-id',
            name: name || 'Copy of Template',
            // ... other template data
          },
        },
      })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * @route   GET /api/v1/templates/:id/preview
 * @desc    Get template preview with sample data
 * @access  Public
 */
router.get(
  '/:id/preview',
  [
    param('id').isUUID(),
    query('settings').optional().isJSON(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new ValidationError(errors.mapped())
      }

      const { id } = req.params
      const { settings: _settings } = req.query

      // TODO: Generate preview LaTeX with sample data
      // Use template and optional settings

      const previewLatex = '\\documentclass{classic-professional}\n% Preview with sample data...'

      res.set('Content-Type', 'text/plain')
      res.send(previewLatex)
    } catch (error) {
      next(error)
    }
  }
)

/**
 * @route   POST /api/v1/templates/import
 * @desc    Import a template from LaTeX file
 * @access  Private (admin)
 */
router.post(
  '/import',
  [
    body('latexContent').notEmpty(),
    body('name').trim().notEmpty(),
    body('category').isIn(['resume', 'cv', 'cover-letter']),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new ValidationError(errors.mapped())
      }

      const { latexContent, name, category } = req.body

      // TODO: Parse LaTeX content and create template
      // Extract settings schema from LaTeX comments?

      res.status(201).json({
        status: 'success',
        message: 'Template imported successfully',
        data: {
          template: {
            id: 'imported-template-id',
            name,
            category,
            latexTemplate: latexContent,
            // ... other template data
          },
        },
      })
    } catch (error) {
      next(error)
    }
  }
)

export { router as templateRoutes }