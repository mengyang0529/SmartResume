import localforage from 'localforage'
import { ResumeData } from '../types/resume'

const RESUME_KEY = 'current_resume'
const RESUME_LIST_KEY = 'resume_list'

export interface StoredResume {
  id: string
  title: string
  data: ResumeData
  updatedAt: string
  createdAt: string
}

function generateId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export const resumeApi = {
  listResumes: async (_page = 1, _limit = 20, _search?: string) => {
    const list = await localforage.getItem<StoredResume[]>(RESUME_LIST_KEY)
    return { resumes: list ?? [], total: (list ?? []).length, page: _page, limit: _limit }
  },

  getResume: async (id: string) => {
    const list = await localforage.getItem<StoredResume[]>(RESUME_LIST_KEY)
    const found = (list ?? []).find(r => r.id === id)
    if (!found) throw new Error('Resume not found')
    return found
  },

  createResume: async (title: string, content: ResumeData) => {
    const now = new Date().toISOString()
    const entry: StoredResume = {
      id: generateId(),
      title,
      data: content,
      createdAt: now,
      updatedAt: now,
    }
    const list = (await localforage.getItem<StoredResume[]>(RESUME_LIST_KEY)) ?? []
    list.push(entry)
    await localforage.setItem(RESUME_LIST_KEY, list)
    return entry
  },

  updateResume: async (id: string, updates: Partial<{ title: string; content: ResumeData }>) => {
    const list = (await localforage.getItem<StoredResume[]>(RESUME_LIST_KEY)) ?? []
    const idx = list.findIndex(r => r.id === id)
    if (idx === -1) throw new Error('Resume not found')
    if (updates.title !== undefined) list[idx].title = updates.title
    if (updates.content !== undefined) list[idx].data = updates.content
    list[idx].updatedAt = new Date().toISOString()
    await localforage.setItem(RESUME_LIST_KEY, list)
    return list[idx]
  },

  deleteResume: async (id: string) => {
    const list = (await localforage.getItem<StoredResume[]>(RESUME_LIST_KEY)) ?? []
    const filtered = list.filter(r => r.id !== id)
    await localforage.setItem(RESUME_LIST_KEY, filtered)
  },

  duplicateResume: async (id: string, title?: string) => {
    const list = (await localforage.getItem<StoredResume[]>(RESUME_LIST_KEY)) ?? []
    const found = list.find(r => r.id === id)
    if (!found) throw new Error('Resume not found')
    const now = new Date().toISOString()
    const copy: StoredResume = {
      id: generateId(),
      title: title ?? `${found.title} (Copy)`,
      data: JSON.parse(JSON.stringify(found.data)),
      createdAt: now,
      updatedAt: now,
    }
    list.push(copy)
    await localforage.setItem(RESUME_LIST_KEY, list)
    return copy
  },

  getCurrentResume: async () => {
    return localforage.getItem<ResumeData>(RESUME_KEY)
  },

  saveCurrentResume: async (data: ResumeData) => {
    await localforage.setItem(RESUME_KEY, data)
  },
}

export const pdfApi = {
  generateFromTypst: async (_typst: string) => {
    throw new Error('PDF generation is now handled client-side via useTypstCompiler')
  },
  downloadPdf: (_cacheKey: string) => '',
  previewPdf: (_cacheKey: string) => '',
}

export const templateApi = {
  listTemplates: async (_category?: string, _page = 1, _limit = 20) => {
    return {
      templates: [{ id: 'awesome-cv', name: 'Awesome CV', category: 'modern' }],
      total: 1,
    }
  },
  getTemplate: async (_id: string) => {
    return { id: 'awesome-cv', name: 'Awesome CV' }
  },
}

export const userApi = {
  getProfile: async () => ({ name: 'Local User', email: '' }),
  updateProfile: async (_updates: { name?: string; avatar?: string }) => ({}),
  getStats: async () => ({ resumeCount: 1 }),
}

export const applicationApi = {
  listApplications: async () => [],
  getApplication: async (_id: string) => { throw new Error('Not available in local mode') },
  createApplication: async (_payload: Record<string, unknown>) => { throw new Error('Not available in local mode') },
  listInterviews: async (_applicationId: string) => [],
  createInterview: async (_applicationId: string, _payload: Record<string, unknown>) => { throw new Error('Not available in local mode') },
}

export const healthApi = {
  check: async () => ({ status: 'healthy', mode: 'local-first' }),
}
