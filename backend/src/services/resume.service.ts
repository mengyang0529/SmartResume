import { PrismaClient } from '@prisma/client'
import { LatexService } from './latex.service'
import { ResumeData, TemplateSettings } from '../types/resume'

export class ResumeService {
  private prisma: PrismaClient
  private latexService: LatexService

  constructor(prisma?: PrismaClient, latexService?: LatexService) {
    this.prisma = prisma || new PrismaClient()
    this.latexService = latexService || new LatexService()
  }
  /**
   * Create a new resume with generated LaTeX source
   */
  async createResume(
    userId: string,
    data: {
      title: string
      content: ResumeData
      templateId?: string
      settings?: Partial<TemplateSettings>
    }
  ) {
    const { title, content, templateId, settings = {} } = data

    // Merge with default settings
    const fullSettings: TemplateSettings = {
      colorScheme: 'awesome-red',
      fontSize: '11pt',
      paperSize: 'a4paper',
      sectionColorHighlight: true,
      headerAlignment: 'C',
      ...settings
    }

    // Generate LaTeX source
    const latexSource = this.latexService.generateResumeLatex(content, fullSettings)

    // Create resume in database
    const resume = await this.prisma.resume.create({
      data: {
        title,
        content: content as any, // Prisma JSON type
        latexSource,
        templateId,
        settings: fullSettings as any,
        userId,
        isPublic: false,
        downloadCount: 0
      }
    })

    return resume
  }

  /**
   * Update an existing resume and regenerate LaTeX if content changed
   */
  async updateResume(
    resumeId: string,
    userId: string,
    updates: {
      title?: string
      content?: ResumeData
      settings?: Partial<TemplateSettings>
      isPublic?: boolean
    }
  ) {
    // First, fetch the existing resume
    const existing = await this.prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId
      }
    })

    if (!existing) {
      throw new Error('Resume not found or access denied')
    }

    const { title, content, settings, isPublic } = updates

    // Prepare update data
    const updateData: any = {}

    if (title !== undefined) updateData.title = title
    if (isPublic !== undefined) updateData.isPublic = isPublic

    // Regenerate LaTeX if content or settings changed
    if (content || settings) {
      const currentContent = (existing.content || {}) as unknown as ResumeData
      const currentSettings = (existing.settings || {}) as unknown as TemplateSettings

      const newContent = content || currentContent
      const newSettings = settings ? { ...currentSettings, ...settings } : currentSettings

      // Generate new LaTeX
      const latexSource = this.latexService.generateResumeLatex(newContent, newSettings)

      updateData.content = newContent as any
      updateData.settings = newSettings as any
      updateData.latexSource = latexSource
    }

    updateData.updatedAt = new Date()

    const updated = await this.prisma.resume.update({
      where: { id: resumeId },
      data: updateData
    })

    return updated
  }

  /**
   * Get resume by ID with permission check
   */
  async getResume(resumeId: string, userId?: string) {
    const resume = await this.prisma.resume.findFirst({
      where: {
        id: resumeId,
        OR: [
          { isPublic: true },
          ...(userId ? [{ userId }] : [])
        ]
      }
    })

    return resume
  }

  /**
   * List resumes for a user
   */
  async listResumes(userId: string, options: {
    page?: number
    limit?: number
    search?: string
  }) {
    const { page = 1, limit = 20, search } = options
    const skip = (page - 1) * limit

    const where: any = { userId }
    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive'
      }
    }

    const [resumes, total] = await Promise.all([
      this.prisma.resume.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          updatedAt: true,
          downloadCount: true,
          isPublic: true
        }
      }),
      this.prisma.resume.count({ where })
    ])

    return {
      resumes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  /**
   * Delete a resume
   */
  async deleteResume(resumeId: string, userId: string) {
    // Verify ownership
    const existing = await this.prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId
      }
    })

    if (!existing) {
      throw new Error('Resume not found or access denied')
    }

    await this.prisma.resume.delete({
      where: { id: resumeId }
    })
  }

  /**
   * Duplicate a resume
   */
  async duplicateResume(resumeId: string, userId: string, newTitle?: string) {
    const original = await this.prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId
      }
    })

    if (!original) {
      throw new Error('Resume not found or access denied')
    }

    const newResume = await this.prisma.resume.create({
      data: {
        title: newTitle || `Copy of ${original.title}`,
        content: original.content as any,
        latexSource: original.latexSource,
        templateId: original.templateId,
        settings: original.settings as any,
        userId,
        isPublic: false,
        downloadCount: 0
      }
    })

    return newResume
  }

  /**
   * Increment download count
   */
  async incrementDownloadCount(resumeId: string) {
    await this.prisma.resume.update({
      where: { id: resumeId },
      data: {
        downloadCount: {
          increment: 1
        }
      }
    })
  }
}