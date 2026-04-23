import { Express } from 'express'
import { authRoutes } from './auth.routes'
import { resumeRoutes } from './resume.routes'
import { templateRoutes } from './template.routes'
import { pdfRoutes } from './pdf.routes'
import { userRoutes } from './user.routes'
import { applicationRoutes } from './application.routes'

export const setupRoutes = (app: Express) => {
  // API prefix
  const apiPrefix = '/api/v1'

  // Health check (no prefix)
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'healthy' })
  })

  // API Documentation
  app.get('/api/docs', (_req, res) => {
    res.json({
      message: 'WebResume API Documentation',
      version: '1.0.0',
      endpoints: {
        auth: `${apiPrefix}/auth`,
        resumes: `${apiPrefix}/resumes`,
        applications: `${apiPrefix}/applications`,
        templates: `${apiPrefix}/templates`,
        pdf: `${apiPrefix}/pdf`,
        users: `${apiPrefix}/users`,
      },
      documentation: 'https://github.com/yourusername/web-resume/wiki/API-Documentation',
    })
  })

  // Register route modules
  app.use(`${apiPrefix}/auth`, authRoutes)
  app.use(`${apiPrefix}/resumes`, resumeRoutes)
  app.use(`${apiPrefix}/applications`, applicationRoutes)
  app.use(`${apiPrefix}/templates`, templateRoutes)
  app.use(`${apiPrefix}/pdf`, pdfRoutes)
  app.use(`${apiPrefix}/users`, userRoutes)

  // Catch-all for undefined API routes
  app.all(`${apiPrefix}/*`, (req, res) => {
    res.status(404).json({
      status: 'error',
      message: `API endpoint ${req.method} ${req.originalUrl} not found`,
    })
  })
}