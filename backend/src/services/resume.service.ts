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
   * Get sample resume data for previews
   */
  async getSampleResume() {
    return {
      personal: {
        firstName: 'Smart',
        lastName: 'Resume',
        position: 'Senior Software Architect',
        email: 'hello@smart-resume.ai',
        mobile: '+1 234 567 8900',
        address: '123 Innovation Drive, Silicon Valley, CA',
      },
      summary: 'Innovative software architect with over 10 years of experience in building scalable web applications and AI-powered tools. Expert in TypeScript, React, Node.js, and LaTeX automation.',
      experience: [
        {
          id: '1',
          company: 'Future Systems Inc.',
          position: 'Lead Software Architect',
          location: 'San Francisco, CA',
          startDate: '2020-01',
          endDate: '',
          description: 'Leading the development of a next-generation resume builder. Managed a team of 15 engineers and improved system performance by 40%.',
          highlights: [
            'Architected and implemented a high-performance resume generation engine',
            'Led a team of 15 engineers through 5 successful product launches',
            'Reduced infrastructure costs by 35% through containerization and serverless optimization'
          ]
        },
        {
          id: '2',
          company: 'Tech Solutions Ltd.',
          position: 'Senior Full Stack Developer',
          location: 'New York, NY',
          startDate: '2016-06',
          endDate: '2019-12',
          description: 'Developed and maintained various client projects using React and Node.js.',
          highlights: [
            'Developed real-time collaboration features using WebSockets',
            'Implemented automated CI/CD pipelines reducing deployment time by 50%',
            'Mentored 5 junior developers and established coding standards'
          ]
        },
      ],
      education: [
        {
          id: '1',
          school: 'Massachusetts Institute of Technology (MIT)',
          degree: 'Master of Science',
          field: 'Computer Science',
          startDate: '2014-09',
          endDate: '2016-05',
        },
        {
          id: '2',
          school: 'Stanford University',
          degree: 'Bachelor of Science',
          field: 'Software Engineering',
          startDate: '2010-09',
          endDate: '2014-06',
        },
      ],
      skills: [
        { id: '1', category: 'Languages', name: 'TypeScript, JavaScript, Python, Go, C++' },
        { id: '2', category: 'Frameworks', name: 'React, Next.js, Express, FastAPI, Tailwind CSS' },
        { id: '3', category: 'Tools', name: 'Docker, Kubernetes, AWS, Git, LaTeX, PostgreSQL' },
      ],
    }
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