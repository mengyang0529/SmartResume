export interface PersonalInfo {
  firstName: string
  lastName: string
  position: string
  address?: string
  mobile?: string
  email: string
  homePage?: string
  linkedin?: string
  gitlab?: string
  twitter?: string
  photo?: {
    url: string
    shape?: 'circle' | 'rectangle'
    edge?: boolean
    position?: 'left' | 'right'
  }
  quote?: string
}

export interface Education {
  id: string
  school: string
  degree: string
  field?: string
  startDate: string // YYYY-MM or YYYY-MM-DD
  endDate?: string // YYYY-MM or YYYY-MM-DD
  description?: string
  gpa?: string
  location?: string
}

export interface Experience {
  id: string
  position: string
  company: string
  location?: string
  startDate: string
  endDate?: string // empty for present
  description?: string
  highlights?: string[]
}

export interface Skill {
  id: string
  category: string
  name: string
  level?: number // 1-5
  keywords?: string[]
}

export interface Project {
  id: string
  name: string
  description: string
  technologies?: string[]
  url?: string
}

export interface Language {
  id: string
  name: string
  level: string // e.g., 'Native', 'Fluent', 'Intermediate', 'Basic'
}

export interface ResumeData {
  personal: PersonalInfo
  education: Education[]
  experience: Experience[]
  skills: Skill[]
  projects?: Project[]
  languages?: Language[]
  summary?: string
  honors?: string[]
  certificates?: string[]
  publications?: string[]
}

export interface TemplateSettings {
  colorScheme: 'awesome-emerald' | 'awesome-skyblue' | 'awesome-red' | 'awesome-pink' | 'awesome-orange' | 'awesome-nephritis' | 'awesome-concrete' | 'awesome-darknight' | string
  fontSize: '10pt' | '11pt' | '12pt'
  paperSize: 'a4paper' | 'letterpaper'
  sectionColorHighlight: boolean
  headerAlignment: 'C' | 'L' | 'R'
  customColor?: string // hex color
}

export type ResumeType = 'resume' | 'cv' | 'coverletter'

// Default empty resume data
export const defaultResumeData: ResumeData = {
  personal: {
    firstName: '',
    lastName: '',
    position: '',
    email: '',
  },
  education: [],
  experience: [],
  skills: [],
  projects: [],
  languages: [],
  summary: '',
  honors: [],
  certificates: [],
  publications: [],
}

// Default template settings
export const defaultTemplateSettings: TemplateSettings = {
  colorScheme: 'awesome-skyblue',
  fontSize: '11pt',
  paperSize: 'a4paper',
  sectionColorHighlight: true,
  headerAlignment: 'C',
}