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
  startDate: string
  endDate?: string
  description?: string
  gpa?: string
  location?: string
}

export interface Entry {
  id: string
  title: string       // Corresponding to company name or project name
  subtitle: string    // Corresponding to position or sub-title
  location?: string
  startDate: string
  endDate?: string
  description?: string
  highlights?: string[]
}

export interface ResumeSection {
  id: string
  title: string       // Section title, e.g., "Work Experience" or "ADAS & Autonomous Driving"
  entries: Entry[]
}

export interface Skill {
  id: string
  category: string
  name: string
}

export interface Experience {
  id: string
  position: string
  company: string
  location?: string
  startDate: string
  endDate?: string
  description?: string
  highlights?: string[]
}

export interface Project {
  id: string
  name: string
  url?: string
  description?: string
  technologies?: string[]
}

export interface ProjectSection {
  title: string
  entries: Project[]
}

export interface Language {
  name: string
  level: string
}

export interface ResumeData {
  personal: PersonalInfo
  education: Education[]
  sections: ResumeSection[] // Dynamic sections: includes work experience, projects, research, etc.
  skills: Skill[]
  summary?: string
  experience?: Experience[]
  projects?: ProjectSection[]
  languages?: Language[]
  honors?: string[]
  certificates?: string[]
  publications?: string[]
  sectionTitles?: Record<string, string>
}

export interface TemplateSettings {
  colorScheme: string
  fontSize: '10pt' | '11pt' | '12pt'
  paperSize: 'a4paper' | 'letterpaper'
  sectionColorHighlight: boolean
  headerAlignment: 'C' | 'L' | 'R'
  customColor?: string
  className?: string
}
