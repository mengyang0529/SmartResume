import axios, { AxiosError, AxiosInstance } from 'axios'
import toast from 'react-hot-toast'
import { config } from '../config'
import { ResumeData, TemplateSettings } from '../types/resume'

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// Request interceptor - add auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    const message = error.response?.data?.message || error.response?.data?.error || error.message || 'An error occurred'
    
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('auth_token')
      toast.error('Session expired. Please log in again.')
    } else if (error.response?.status === 429) {
      toast.error('Rate limit exceeded. Please try again later.')
    } else if (error.response?.status && error.response.status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (!error.response) {
      toast.error('Network error. Please check your connection.')
    } else {
      toast.error(message)
    }
    
    return Promise.reject(error)
  }
)

// Resume API
export const resumeApi = {
  listResumes: async (page = 1, limit = 20, search?: string) => {
    const params = new URLSearchParams()
    params.append('page', String(page))
    params.append('limit', String(limit))
    if (search) params.append('search', search)
    const { data } = await apiClient.get(`/api/v1/resumes?${params.toString()}`)
    return data.data
  },

  getResume: async (id: string) => {
    const { data } = await apiClient.get(`/api/v1/resumes/${id}`)
    return data.data
  },

  createResume: async (title: string, content: ResumeData, templateId?: string, settings?: TemplateSettings) => {
    const { data } = await apiClient.post('/api/v1/resumes', {
      title,
      content,
      templateId,
      settings,
    })
    return data.data
  },

  updateResume: async (id: string, updates: Partial<{ title: string; content: ResumeData; settings: TemplateSettings; isPublic: boolean }>) => {
    const { data } = await apiClient.put(`/api/v1/resumes/${id}`, updates)
    return data.data
  },

  deleteResume: async (id: string) => {
    const { data } = await apiClient.delete(`/api/v1/resumes/${id}`)
    return data
  },

  duplicateResume: async (id: string, title?: string) => {
    const { data } = await apiClient.post(`/api/v1/resumes/${id}/duplicate`, { title })
    return data.data
  },

}

// PDF API
export const pdfApi = {
  generateFromLaTeX: async (latex: string, resumeId?: string) => {
    const { data } = await apiClient.post('/api/v1/pdf/generate', {
      latex,
      resumeId,
    })
    return data.data
  },

  generateFromResume: async (id: string, settings?: TemplateSettings) => {
    const { data } = await apiClient.post(`/api/v1/pdf/generate-from-resume/${id}`, { settings })
    return data.data
  },

  getJobStatus: async (jobId: string) => {
    const { data } = await apiClient.get(`/api/v1/pdf/jobs/${jobId}`)
    return data.data
  },

  downloadPdf: (cacheKey: string) => {
    return `${config.apiUrl}/api/v1/pdf/download/${cacheKey}`
  },

  previewPdf: (cacheKey: string) => {
    return `${config.apiUrl}/api/v1/pdf/preview/${cacheKey}`
  },
}

// Template API
export const templateApi = {
  listTemplates: async (category?: string, page = 1, limit = 20) => {
    const params = new URLSearchParams()
    if (category) params.append('category', category)
    params.append('page', String(page))
    params.append('limit', String(limit))
    const { data } = await apiClient.get(`/api/v1/templates?${params.toString()}`)
    return data.data
  },

  getTemplate: async (id: string) => {
    const { data } = await apiClient.get(`/api/v1/templates/${id}`)
    return data.data
  },

  getTemplatePreview: async (id: string, settings?: TemplateSettings) => {
    const params = new URLSearchParams()
    if (settings) params.append('settings', JSON.stringify(settings))
    const { data } = await apiClient.get(`/api/v1/templates/${id}/preview?${params.toString()}`)
    return data
  },
}

// User API
export const userApi = {
  getProfile: async () => {
    const { data } = await apiClient.get('/api/v1/users/profile')
    return data.data
  },

  updateProfile: async (updates: { name?: string; avatar?: string }) => {
    const { data } = await apiClient.put('/api/v1/users/profile', updates)
    return data.data
  },

  getStats: async () => {
    const { data } = await apiClient.get('/api/v1/users/stats')
    return data.data
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const { data } = await apiClient.put('/api/v1/users/password', {
      currentPassword,
      newPassword,
    })
    return data
  },
}

// Health check
export const healthApi = {
  check: async () => {
    const { data } = await apiClient.get('/health')
    return data
  },
}

export default apiClient
