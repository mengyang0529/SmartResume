import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ResumeService } from '../services/resume.service'
import { ResumeData } from '../types/resume'

describe('ResumeService', () => {
  let resumeService: ResumeService
  let mockTypstService: any
  let mockPrisma: any

  beforeEach(() => {
    vi.clearAllMocks()

    mockTypstService = {
      generateResumeTypst: vi.fn().mockReturnValue('mock-typst-source')
    }

    mockPrisma = {
      resume: {
        create: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
      }
    }

    // Create ResumeService with mocked dependencies
    resumeService = new ResumeService(mockPrisma as any, mockTypstService as any)
  })

  describe('createResume', () => {
    it('should create a resume with generated Typst', async () => {
      const userId = 'user-123'
      const resumeData = {
        title: 'My Resume',
        content: {
          personal: {
            firstName: 'John',
            lastName: 'Doe',
            position: 'Engineer',
            email: 'john@example.com'
          },
          education: [],
          experience: [],
          skills: [],
          summary: ''
        },
        templateId: 'template-123',
        settings: {}
      }

      mockPrisma.resume.create.mockResolvedValue({
        id: 'resume-456',
        title: 'My Resume',
        content: resumeData.content,
        typstSource: 'mock-typst-source',
        templateId: 'template-123',
        settings: {},
        userId: 'user-123',
        isPublic: false,
        downloadCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      mockTypstService.generateResumeTypst.mockReturnValue('mock-typst-source')

      const result = await resumeService.createResume(userId, resumeData)

      expect(mockTypstService.generateResumeTypst).toHaveBeenCalledWith(
        resumeData.content,
        expect.objectContaining({
          colorScheme: 'awesome-red',
          fontSize: '11pt',
          paperSize: 'a4paper'
        })
      )

      expect(mockPrisma.resume.create).toHaveBeenCalledWith({
        data: {
          title: 'My Resume',
          content: resumeData.content,
          typstSource: 'mock-typst-source',
          templateId: 'template-123',
          settings: expect.any(Object),
          userId: 'user-123',
          isPublic: false,
          downloadCount: 0
        }
      })

      expect(result).toHaveProperty('id', 'resume-456')
    })
  })

  describe('getResume', () => {
    it('should return resume when user is owner', async () => {
      const resumeId = 'resume-123'
      const userId = 'user-123'
      const mockResume = {
        id: resumeId,
        title: 'My Resume',
        userId: 'user-123',
        isPublic: false
      }

      mockPrisma.resume.findFirst.mockResolvedValue(mockResume)

      const result = await resumeService.getResume(resumeId, userId)

      expect(mockPrisma.resume.findFirst).toHaveBeenCalledWith({
        where: {
          id: resumeId,
          OR: [
            { isPublic: true },
            { userId }
          ]
        }
      })
      expect(result).toEqual(mockResume)
    })

    it('should return public resume when user is not owner', async () => {
      const resumeId = 'resume-123'
      const userId = 'user-456' // Different user
      const mockResume = {
        id: resumeId,
        title: 'My Resume',
        userId: 'user-123',
        isPublic: true
      }

      mockPrisma.resume.findFirst.mockResolvedValue(mockResume)

      const result = await resumeService.getResume(resumeId, userId)

      expect(mockPrisma.resume.findFirst).toHaveBeenCalledWith({
        where: {
          id: resumeId,
          OR: [
            { isPublic: true },
            { userId: 'user-456' }
          ]
        }
      })
      expect(result).toEqual(mockResume)
    })

    it('should return null when resume not found or not accessible', async () => {
      const resumeId = 'resume-123'
      const userId = 'user-456'

      mockPrisma.resume.findFirst.mockResolvedValue(null)

      const result = await resumeService.getResume(resumeId, userId)

      expect(result).toBeNull()
    })
  })

  describe('listResumes', () => {
    it('should list resumes with pagination', async () => {
      const userId = 'user-123'
      const options = { page: 1, limit: 20 }
      const mockResumes = [
        { id: 'resume-1', title: 'Resume 1' },
        { id: 'resume-2', title: 'Resume 2' }
      ]

      mockPrisma.resume.findMany.mockResolvedValue(mockResumes)
      mockPrisma.resume.count.mockResolvedValue(50)

      const result = await resumeService.listResumes(userId, options)

      expect(mockPrisma.resume.findMany).toHaveBeenCalledWith({
        where: { userId },
        skip: 0,
        take: 20,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          updatedAt: true,
          downloadCount: true,
          isPublic: true
        }
      })

      expect(result).toEqual({
        resumes: mockResumes,
        pagination: {
          page: 1,
          limit: 20,
          total: 50,
          pages: 3
        }
      })
    })

    it('should support search filter', async () => {
      const userId = 'user-123'
      const options = { page: 1, limit: 20, search: 'engineer' }

      mockPrisma.resume.findMany.mockResolvedValue([])
      mockPrisma.resume.count.mockResolvedValue(0)

      await resumeService.listResumes(userId, options)

      expect(mockPrisma.resume.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          title: {
            contains: 'engineer',
            mode: 'insensitive'
          }
        },
        skip: 0,
        take: 20,
        orderBy: { updatedAt: 'desc' },
        select: expect.any(Object)
      })
    })
  })

  describe('updateResume', () => {
    it('should update resume and regenerate Typst when content changes', async () => {
      const resumeId = 'resume-123'
      const userId = 'user-123'
      const updates = {
        title: 'Updated Title',
        content: {
          personal: { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' },
          education: [],
          experience: [],
          skills: [],
          summary: ''
        }
      }

      const existingResume = {
        id: resumeId,
        userId,
        title: 'Old Title',
        content: { personal: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' } },
        settings: { colorScheme: 'awesome-red' },
        typstSource: 'old-typst'
      }

      mockPrisma.resume.findFirst.mockResolvedValue(existingResume)
      mockPrisma.resume.update.mockResolvedValue({
        ...existingResume,
        title: 'Updated Title'
      })

      mockTypstService.generateResumeTypst.mockReturnValue('new-typst-source')

      const result = await resumeService.updateResume(resumeId, userId, updates)

      expect(mockPrisma.resume.findFirst).toHaveBeenCalledWith({
        where: { id: resumeId, userId }
      })

      expect(mockTypstService.generateResumeTypst).toHaveBeenCalled()

      expect(mockPrisma.resume.update).toHaveBeenCalledWith({
        where: { id: resumeId },
        data: {
          title: 'Updated Title',
          content: updates.content,
          settings: expect.any(Object),
          typstSource: 'new-typst-source',
          updatedAt: expect.any(Date)
        }
      })

      expect(result).toHaveProperty('title', 'Updated Title')
    })
  })

  describe('deleteResume', () => {
    it('should delete resume when user is owner', async () => {
      const resumeId = 'resume-123'
      const userId = 'user-123'

      mockPrisma.resume.findFirst.mockResolvedValue({ id: resumeId, userId })
      mockPrisma.resume.delete.mockResolvedValue({})

      await resumeService.deleteResume(resumeId, userId)

      expect(mockPrisma.resume.findFirst).toHaveBeenCalledWith({
        where: { id: resumeId, userId }
      })

      expect(mockPrisma.resume.delete).toHaveBeenCalledWith({
        where: { id: resumeId }
      })
    })

    it('should throw error when resume not found or access denied', async () => {
      const resumeId = 'resume-123'
      const userId = 'user-123'

      mockPrisma.resume.findFirst.mockResolvedValue(null)

      await expect(resumeService.deleteResume(resumeId, userId)).rejects.toThrow(
        'Resume not found or access denied'
      )
    })
  })
})