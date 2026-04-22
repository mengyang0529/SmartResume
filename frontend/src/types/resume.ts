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
  title: string
  subtitle: string
  location?: string
  startDate: string
  endDate?: string
  description?: string
  highlights?: string[]
}

export interface ResumeSection {
  id: string
  title: string
  entries: Entry[]
}

export interface Skill {
  id: string
  category: string
  name: string
}

export interface ResumeData {
  personal: PersonalInfo
  education: Education[]
  sections: ResumeSection[]
  skills: Skill[]
  summary?: string
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
