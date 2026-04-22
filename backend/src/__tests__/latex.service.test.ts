import { describe, it, expect } from 'vitest'
import { LatexService } from '../services/latex.service'
import { ResumeData, TemplateSettings } from '../types/resume'

describe('LatexService', () => {
  const latexService = new LatexService()

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

  it('should generate LaTeX source code', () => {
    const latex = latexService.generateResumeLatex(sampleResume, defaultSettings)

    expect(latex).toBeDefined()
    expect(latex).toContain('%!TEX TS-program = xelatex')
    expect(latex).toContain('\\documentclass')
    expect(latex).toContain('John')
    expect(latex).toContain('Doe')
  })

  it('should include personal information commands', () => {
    const latex = latexService.generateResumeLatex(sampleResume, defaultSettings)

    expect(latex).toContain('\\name{John}{Doe}')
    expect(latex).toContain('\\position{Senior Software Engineer}')
    expect(latex).toContain('\\email{john.doe@example.com}')
    expect(latex).toContain('\\github{johndoe}')
  })

  it('should include education section', () => {
    const latex = latexService.generateResumeLatex(sampleResume, defaultSettings)

    expect(latex).toContain('\\cvsection{Education}')
    expect(latex).toContain('Stanford University')
    expect(latex).toContain('Master of Science in Computer Science')
  })

  it('should include experience section', () => {
    const latex = latexService.generateResumeLatex(sampleResume, defaultSettings)

    expect(latex).toContain('\\cvsection{Experience}')
    expect(latex).toContain('Tech Corp Inc.')
    expect(latex).toContain('Senior Software Engineer')
  })

  it('should include skills section', () => {
    const latex = latexService.generateResumeLatex(sampleResume, defaultSettings)

    expect(latex).toContain('\\cvsection{Skills}')
    expect(latex).toContain('Programming Languages')
    expect(latex).toContain('TypeScript, Python, Go')
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

    const latex = latexService.generateResumeLatex(resumeWithoutOptional, defaultSettings)

    expect(latex).toBeDefined()
    // Should not crash when optional arrays are undefined
  })

  it('should apply template settings', () => {
    const customSettings: TemplateSettings = {
      colorScheme: 'awesome-darkblue',
      fontSize: '12pt',
      paperSize: 'letterpaper',
      sectionColorHighlight: false,
      headerAlignment: 'L'
    }

    const latex = latexService.generateResumeLatex(sampleResume, customSettings)

    expect(latex).toContain('\\documentclass[12pt, letterpaper]')
    expect(latex).toContain('\\colorlet{awesome}{awesome-darkblue}')
    expect(latex).toContain('\\setbool{acvSectionColorHighlight}{false}')
    expect(latex).toContain('\\makecvheader[L]')
  })

  it('should handle custom color hex code', () => {
    const settingsWithCustomColor: TemplateSettings = {
      ...defaultSettings,
      customColor: '#FF5733'
    }

    const latex = latexService.generateResumeLatex(sampleResume, settingsWithCustomColor)

    expect(latex).toContain('\\definecolor{awesome}{HTML}{FF5733}')
  })
})