import type { TemplateSettings } from '../types/resume'

export type ResumeTemplate = {
  id: number
  slug: string
  name: string
  category: string
  description: string
  previewImage: string
  settings: TemplateSettings
}

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    id: 1,
    slug: 'classic',
    name: 'Classic',
    category: 'Awesome-CV',
    description: 'Minimal black-and-white elegant style.',
    previewImage: '/template-previews/classic.webp',
    settings: {
      colorScheme: 'awesome-red',
      fontSize: '11pt',
      paperSize: 'a4paper',
      sectionColorHighlight: true,
      headerAlignment: 'C',
      template: 'classic',
    },
  },
  {
    id: 2,
    slug: 'modern',
    name: 'Modern',
    category: 'Awesome-CV',
    description: 'Original Awesome CV style with colored accents.',
    previewImage: '/template-previews/modern.webp',
    settings: {
      colorScheme: 'awesome-red',
      fontSize: '11pt',
      paperSize: 'a4paper',
      sectionColorHighlight: true,
      headerAlignment: 'C',
      template: 'modern',
    },
  },
  {
    id: 3,
    slug: 'art',
    name: 'Art',
    category: 'Awesome-CV',
    description: 'Dark-themed artistic style with vibrant accents.',
    previewImage: '/template-previews/art.webp',
    settings: {
      colorScheme: '#FF6138',
      fontSize: '11pt',
      paperSize: 'a4paper',
      sectionColorHighlight: true,
      headerAlignment: 'C',
      template: 'art',
    },
  },
  {
    id: 4,
    slug: 'rirekisho',
    name: 'Rirekisho',
    category: 'Japanese',
    description: 'Traditional Japanese-style resume (履歴書) with standard JIS format including photo, education, and work history tables.',
    previewImage: '/template-previews/rirekisho.webp',
    settings: {
      colorScheme: 'awesome-red',
      fontSize: '10pt',
      paperSize: 'a4paper',
      sectionColorHighlight: false,
      headerAlignment: 'L',
      template: 'rirekisho',
    },
  },
  {
    id: 5,
    slug: 'shokumukeirekisho',
    name: 'Shokumu Keirekisho',
    category: 'Japanese',
    description: 'Japanese career history document (職務経歴書) with detailed project experience, tech stacks, and achievements.',
    previewImage: '/template-previews/shokumukeirekisho.webp',
    settings: {
      colorScheme: 'awesome-red',
      fontSize: '10pt',
      paperSize: 'a4paper',
      sectionColorHighlight: false,
      headerAlignment: 'L',
      template: 'shokumukeirekisho',
    },
  },
]

export const DEFAULT_TEMPLATE = RESUME_TEMPLATES[0]

export function findTemplateBySlug(slug?: string) {
  if (!slug) return DEFAULT_TEMPLATE
  return RESUME_TEMPLATES.find(template => template.slug === slug || String(template.id) === slug)
}
