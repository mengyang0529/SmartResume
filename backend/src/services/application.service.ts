import { PrismaClient, Prisma } from '@prisma/client'

export interface ApplicationCreateData {
  company: string
  jobTitle: string
  location?: string
  status?: string
  stage?: string
  appliedAt?: string
  source?: string
  notes?: string
  resumeId?: string
}

export interface ApplicationUpdateData {
  company?: string
  jobTitle?: string
  location?: string
  status?: string
  stage?: string
  appliedAt?: string
  source?: string
  notes?: string
  resumeId?: string
}

export interface InterviewCreateData {
  applicationId: string
  round?: number
  interviewType?: string
  interviewer?: string
  scheduledAt?: string
  outcome?: string
  feedback?: string
  notes?: string
}

export class ApplicationService {
  private prisma: PrismaClient

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || new PrismaClient()
  }

  async listApplications(userId: string) {
    return this.prisma.application.findMany({
      where: { userId },
      include: {
        interviews: {
          orderBy: { scheduledAt: 'asc' },
        },
      },
      orderBy: { appliedAt: 'desc' },
    })
  }

  async getApplication(applicationId: string, userId: string) {
    return this.prisma.application.findFirst({
      where: {
        id: applicationId,
        userId,
      },
      include: {
        interviews: {
          orderBy: { scheduledAt: 'asc' },
        },
      },
    })
  }

  async createApplication(userId: string, data: ApplicationCreateData) {
    const created = await this.prisma.application.create({
      data: {
        userId,
        company: data.company,
        jobTitle: data.jobTitle,
        location: data.location || null,
        status: data.status || 'applied',
        stage: data.stage || 'Resume submitted',
        appliedAt: data.appliedAt ? new Date(data.appliedAt) : new Date(),
        source: data.source || null,
        notes: data.notes || null,
        resumeId: data.resumeId || null,
      },
    })
    return created
  }

  async updateApplication(applicationId: string, userId: string, updates: ApplicationUpdateData) {
    const existing = await this.prisma.application.findFirst({
      where: { id: applicationId, userId },
    })

    if (!existing) {
      throw new Error('Application not found or access denied')
    }

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        company: updates.company ?? existing.company,
        jobTitle: updates.jobTitle ?? existing.jobTitle,
        location: updates.location ?? existing.location,
        status: updates.status ?? existing.status,
        stage: updates.stage ?? existing.stage,
        appliedAt: updates.appliedAt ? new Date(updates.appliedAt) : existing.appliedAt,
        source: updates.source ?? existing.source,
        notes: updates.notes ?? existing.notes,
        resumeId: updates.resumeId ?? existing.resumeId,
      },
    })

    return updated
  }

  async deleteApplication(applicationId: string, userId: string) {
    const existing = await this.prisma.application.findFirst({
      where: { id: applicationId, userId },
    })

    if (!existing) {
      throw new Error('Application not found or access denied')
    }

    await this.prisma.application.delete({
      where: { id: applicationId },
    })

    return true
  }

  async listInterviews(applicationId: string, userId: string) {
    const application = await this.prisma.application.findFirst({
      where: { id: applicationId, userId },
    })

    if (!application) {
      throw new Error('Application not found or access denied')
    }

    return this.prisma.interview.findMany({
      where: { applicationId },
      orderBy: { scheduledAt: 'asc' },
    })
  }

  async createInterview(data: InterviewCreateData) {
    return this.prisma.interview.create({
      data: {
        applicationId: data.applicationId,
        round: data.round ?? 1,
        interviewType: data.interviewType || null,
        interviewer: data.interviewer || null,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        outcome: data.outcome || 'pending',
        feedback: data.feedback || null,
        notes: data.notes || null,
      },
    })
  }
}
