import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import { createResumeRoutes } from '../routes/resume.routes'
import { ResumeService } from '../services/resume.service'
import { errorHandler, notFoundHandler, ValidationError, NotFoundError } from '../middleware/errorHandler'

// Test constants
const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000'
const VALID_UUID_2 = '223e4567-e89b-12d3-a456-426614174000'

// Minimal valid resume content
const minimalResumeContent = {
  personal: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com'
  },
  education: [],
  experience: [],
  skills: [],
  summary: ''
}

// We'll create a mock ResumeService instance and pass it to createResumeRoutes
// No need for global mock since we're using dependency injection

describe('Resume API Routes', () => {
  let mockResumeService: any
  let app: express.Express

  beforeEach(() => {
    vi.clearAllMocks()

    mockResumeService = {
      listResumes: vi.fn(),
      createResume: vi.fn(),
      getResume: vi.fn(),
      updateResume: vi.fn(),
      deleteResume: vi.fn(),
      duplicateResume: vi.fn(),
      incrementDownloadCount: vi.fn()
    }

    // Create new Express app for each test
    app = express()
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    // Create routes with mocked service
    const resumeRoutes = createResumeRoutes(mockResumeService as any)
    app.use('/api/v1/resumes', resumeRoutes)

    // Add error handling middleware
    app.use(notFoundHandler)
    app.use(errorHandler)
  })

  describe('GET /api/v1/resumes', () => {
    it('should return list of resumes with pagination', async () => {
      const mockDate = new Date().toISOString()
      const mockResult = {
        resumes: [
          { id: 'resume-1', title: 'Resume 1', updatedAt: mockDate },
          { id: 'resume-2', title: 'Resume 2', updatedAt: mockDate }
        ],
        pagination: { page: 1, limit: 20, total: 2, pages: 1 }
      }

      mockResumeService.listResumes.mockResolvedValue(mockResult)

      const response = await request(app)
        .get('/api/v1/resumes')
        .query({ page: 1, limit: 20 })
        .expect(200)

      expect(response.body).toEqual({
        status: 'success',
        data: mockResult
      })

      // Should call service with mock user ID (currently hardcoded as 'user-id-mock')
      expect(mockResumeService.listResumes).toHaveBeenCalledWith('user-id-mock', {
        page: 1,
        limit: 20,
        search: undefined
      })
    })

    it('should validate query parameters', async () => {
      // Invalid page (less than 1)
      await request(app)
        .get('/api/v1/resumes')
        .query({ page: 0 })
        .expect(400)

      // Invalid limit (greater than 100)
      await request(app)
        .get('/api/v1/resumes')
        .query({ limit: 101 })
        .expect(400)
    })

    it('should support search query', async () => {
      mockResumeService.listResumes.mockResolvedValue({
        resumes: [],
        pagination: { page: 1, limit: 20, total: 0, pages: 0 }
      })

      await request(app)
        .get('/api/v1/resumes')
        .query({ search: 'engineer' })
        .expect(200)

      expect(mockResumeService.listResumes).toHaveBeenCalledWith('user-id-mock', {
        page: 1,
        limit: 20,
        search: 'engineer'
      })
    })
  })

  describe('POST /api/v1/resumes', () => {
    it('should create a new resume', async () => {
      const resumeData = {
        title: 'My Resume',
        content: minimalResumeContent,
        templateId: VALID_UUID_2,
        settings: { colorScheme: 'awesome-red' }
      }

      const mockDate = new Date().toISOString()
      const createdResume = {
        id: VALID_UUID_2,
        ...resumeData,
        userId: 'user-id-mock',
        typstSource: 'typst-code',
        isPublic: false,
        downloadCount: 0,
        createdAt: mockDate,
        updatedAt: mockDate
      }

      mockResumeService.createResume.mockResolvedValue(createdResume)

      const response = await request(app)
        .post('/api/v1/resumes')
        .send(resumeData)
        .expect(201)

      expect(response.body).toEqual({
        status: 'success',
        message: 'Resume created successfully',
        data: {
          resume: createdResume
        }
      })

      expect(mockResumeService.createResume).toHaveBeenCalledWith('user-id-mock', resumeData)
    })

    it('should validate required fields', async () => {
      // Missing title
      await request(app)
        .post('/api/v1/resumes')
        .send({
          content: minimalResumeContent
        })
        .expect(400)

      // Invalid templateId (not UUID)
      await request(app)
        .post('/api/v1/resumes')
        .send({
          title: 'Resume',
          content: minimalResumeContent,
          templateId: 'not-a-uuid'
        })
        .expect(400)
    })
  })

  describe('GET /api/v1/resumes/:id', () => {
    it('should return a resume by ID', async () => {
      const resumeId = VALID_UUID
      const mockResume = {
        id: resumeId,
        title: 'My Resume',
        content: minimalResumeContent,
        userId: 'user-id-mock'
      }

      mockResumeService.getResume.mockResolvedValue(mockResume)

      const response = await request(app)
        .get(`/api/v1/resumes/${resumeId}`)
        .expect(200)

      expect(response.body).toEqual({
        status: 'success',
        data: {
          resume: mockResume
        }
      })

      // Currently routes pass undefined userId when not authenticated
      expect(mockResumeService.getResume).toHaveBeenCalledWith(resumeId, undefined)
    })

    it('should return 404 when resume not found', async () => {
      const resumeId = VALID_UUID

      mockResumeService.getResume.mockResolvedValue(null)

      await request(app)
        .get(`/api/v1/resumes/${resumeId}`)
        .expect(404)
    })

    it('should validate UUID parameter', async () => {
      await request(app)
        .get('/api/v1/resumes/not-a-uuid')
        .expect(400)
    })
  })

  describe('PUT /api/v1/resumes/:id', () => {
    it('should update a resume', async () => {
      const resumeId = VALID_UUID
      const updates = {
        title: 'Updated Title',
        isPublic: true
      }

      const updatedResume = {
        id: resumeId,
        ...updates,
        content: {},
        userId: 'user-id-mock'
      }

      mockResumeService.updateResume.mockResolvedValue(updatedResume)

      const response = await request(app)
        .put(`/api/v1/resumes/${resumeId}`)
        .send(updates)
        .expect(200)

      expect(response.body).toEqual({
        status: 'success',
        message: 'Resume updated successfully',
        data: {
          resume: updatedResume
        }
      })

      expect(mockResumeService.updateResume).toHaveBeenCalledWith(
        resumeId,
        'user-id-mock',
        updates
      )
    })

    it('should validate update fields', async () => {
      const resumeId = '123e4567-e89b-12d3-a456-426614174000'

      // Empty title
      await request(app)
        .put(`/api/v1/resumes/${resumeId}`)
        .send({ title: '' })
        .expect(400)

      // Invalid isPublic (not boolean)
      await request(app)
        .put(`/api/v1/resumes/${resumeId}`)
        .send({ isPublic: 'yes' })
        .expect(400)
    })
  })

  describe('DELETE /api/v1/resumes/:id', () => {
    it('should delete a resume', async () => {
      const resumeId = VALID_UUID

      mockResumeService.deleteResume.mockResolvedValue(undefined)

      const response = await request(app)
        .delete(`/api/v1/resumes/${resumeId}`)
        .expect(200)

      expect(response.body).toEqual({
        status: 'success',
        message: 'Resume deleted successfully'
      })

      expect(mockResumeService.deleteResume).toHaveBeenCalledWith(resumeId, 'user-id-mock')
    })

    it('should validate UUID parameter', async () => {
      await request(app)
        .delete('/api/v1/resumes/not-a-uuid')
        .expect(400)
    })
  })

  describe('POST /api/v1/resumes/:id/duplicate', () => {
    it('should duplicate a resume', async () => {
      const resumeId = VALID_UUID
      const duplicateData = {
        title: 'Copy of My Resume'
      }

      const newResume = {
        id: 'resume-456',
        title: 'Copy of My Resume',
        userId: 'user-id-mock'
      }

      mockResumeService.duplicateResume.mockResolvedValue(newResume)

      const response = await request(app)
        .post(`/api/v1/resumes/${resumeId}/duplicate`)
        .send(duplicateData)
        .expect(201)

      expect(response.body).toEqual({
        status: 'success',
        message: 'Resume duplicated successfully',
        data: {
          resume: newResume
        }
      })

      expect(mockResumeService.duplicateResume).toHaveBeenCalledWith(
        resumeId,
        'user-id-mock',
        duplicateData.title
      )
    })
  })

  // TODO: Add /export/typst route to resume.routes.ts if needed
  // describe('GET /api/v1/resumes/:id/export/typst', () => {
  //   it('should return Typst source', async () => {
  //     const resumeId = VALID_UUID
  //     const response = await request(app)
  //       .get(`/api/v1/resumes/${resumeId}/export/typst`)
  //       .expect(200)
  //     expect(response.headers['content-type']).toContain('text/plain')
  //   })
  // })
})