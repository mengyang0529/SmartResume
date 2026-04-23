import { describe, it, expect } from 'vitest'
import { TypstService } from '../services/typst.service'
import { ResumeData, TemplateSettings } from '../types/resume'

describe('TypstService', () => {
  const typstService = new TypstService()

  const sampleResume: ResumeData = {
    personal: {
      firstName: 'John',
      lastName: 'Doe',
      position: 'Senior Software Engineer',
      address: 'San Francisco, CA',
      mobile: '+1 (123) 456-7890',
      email: 'john.doe@example.com',
      homePage: 'johndoe.dev',
      github: 'johndoe',
      linkedin: 'johndoe',
      quote: 'Passionate about building scalable software systems.'
    },
    education: [
      {
        id: 'edu1',
        school: 'Stanford University',
        degree: 'Master of Science in Computer Science',
        field: 'Artificial Intelligence',
        startDate: '2018-09',
        endDate: '2020-06',
        gpa: '3.9/4.0',
        location: 'Stanford, CA'
      }
    ],
    experience: [
      {
        id: 'exp1',
        position: 'Senior Software Engineer',
        company: 'Tech Corp Inc.',
        location: 'San Francisco, CA',
        startDate: '2020-07',
        endDate: '2023-12',
        description: 'Led development of cloud-native microservices architecture.',
        highlights: [
          'Reduced API response time by 40% through optimization',
          'Implemented CI/CD pipeline reducing deployment time by 70%',
          'Mentored 3 junior engineers'
        ]
      }
    ],
    skills: [
      {
        id: 'skill1',
        category: 'Programming Languages',
        name: 'TypeScript, Python, Go'
      }
    ],
    projects: [],
    languages: [],
    summary: 'Experienced software engineer with 5+ years in building scalable web applications.',
    honors: [],
    certificates: [],
    publications: []
  }

  const defaultSettings: TemplateSettings = {
    colorScheme: 'awesome-red',
    fontSize: '11pt',
    paperSize: 'a4paper',
    sectionColorHighlight: true,
    headerAlignment: 'C'
  }

  it('should generate Typst source code', () => {
    const typst = typstService.generateResumeTypst(sampleResume, defaultSettings)

    expect(typst).toBeDefined()
    expect(typst).toContain('#import "awesome-cv.typ": *')
    expect(typst).toContain('#show: resume.with(')
    expect(typst).toContain('John')
    expect(typst).toContain('Doe')
  })

  it('should include personal information in author block', () => {
    const typst = typstService.generateResumeTypst(sampleResume, defaultSettings)

    expect(typst).toContain('firstname: "John"')
    expect(typst).toContain('lastname: "Doe"')
    expect(typst).toContain('positions: ("Senior Software Engineer",)')
    expect(typst).toContain('email: "john.doe@example.com"')
  })

  it('should include education section', () => {
    const typst = typstService.generateResumeTypst(sampleResume, defaultSettings)

    expect(typst).toContain('= Education')
    expect(typst).toContain('Stanford University')
    expect(typst).toContain('Master of Science in Computer Science')
  })

  it('should include experience section', () => {
    const typst = typstService.generateResumeTypst(sampleResume, defaultSettings)

    expect(typst).toContain('= Work Experience')
    expect(typst).toContain('Tech Corp Inc.')
    expect(typst).toContain('Senior Software Engineer')
  })

  it('should include skills section', () => {
    const typst = typstService.generateResumeTypst(sampleResume, defaultSettings)

    expect(typst).toContain('= Skills')
    expect(typst).toContain('Programming Languages')
    expect(typst).toContain('TypeScript, Python, Go')
  })

  it('should handle empty optional sections', () => {
    const resumeWithoutOptional: ResumeData = {
      ...sampleResume,
      projects: undefined as any,
      languages: undefined as any,
      honors: undefined as any,
      certificates: undefined as any,
      publications: undefined as any
    }

    const typst = typstService.generateResumeTypst(resumeWithoutOptional, defaultSettings)

    expect(typst).toBeDefined()
    // Should not crash when optional arrays are undefined
  })

  it('should apply template settings', () => {
    const customSettings: TemplateSettings = {
      colorScheme: 'awesome-skyblue',
      fontSize: '12pt',
      paperSize: 'letterpaper',
      sectionColorHighlight: false,
      headerAlignment: 'L'
    }

    const typst = typstService.generateResumeTypst(sampleResume, customSettings)

    expect(typst).toContain('paper-size: "us-letter"')
    expect(typst).toContain('accent-color: "#0395DE"')
    expect(typst).toContain('colored-headers: false')
  })

  it('should handle custom color hex code', () => {
    const settingsWithCustomColor: TemplateSettings = {
      ...defaultSettings,
      customColor: '#FF5733'
    }

    const typst = typstService.generateResumeTypst(sampleResume, settingsWithCustomColor)

    expect(typst).toContain('accent-color: "#FF5733"')
  })

  it('should include correct font configuration', () => {
    const typst = typstService.generateResumeTypst(sampleResume, defaultSettings)

    expect(typst).toContain('font: ("Source Sans 3", "Source Sans Pro", "LXGW Neo XiHei")')
  })
})
