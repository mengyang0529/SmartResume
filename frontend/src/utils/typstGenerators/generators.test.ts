import { describe, it, expect } from 'vitest'
import { generateResumeTypst } from './index'
import { SAMPLE_RESUME_DATA, RIREKISHO_SAMPLE_DATA, SHOKUMU_SAMPLE_DATA } from '../../data/sampleResume'
import type { TemplateSettings } from '../../types/resume'

describe('typstGenerators', () => {
  const defaultSettings: TemplateSettings = {
    colorScheme: 'awesome-red',
    fontSize: '11pt',
    paperSize: 'a4paper',
    sectionColorHighlight: true,
    headerAlignment: 'C',
  }

  it('should generate Typst for Classic template', () => {
    const settings: TemplateSettings = { ...defaultSettings, template: 'classic' }
    const output = generateResumeTypst(SAMPLE_RESUME_DATA, settings)
    
    expect(output).toContain('#import "awesome-cv-classic.typ": *')
    expect(output).toContain('firstname: "Smart"')
    expect(output).toContain('lastname: "Resume"')
    expect(output).toContain('= Professional Experience')
  })

  it('should generate Typst for Modern template', () => {
    const settings: TemplateSettings = { ...defaultSettings, template: 'modern' }
    const output = generateResumeTypst(SAMPLE_RESUME_DATA, settings)
    
    expect(output).toContain('#import "awesome-cv-modern.typ": *')
  })

  it('should generate Typst for Art template', () => {
    const settings: TemplateSettings = { ...defaultSettings, template: 'art', colorScheme: '#FF6138' }
    const output = generateResumeTypst(SAMPLE_RESUME_DATA, settings)
    
    expect(output).toContain('#import "awesome-cv-art.typ": *')
    expect(output).toContain('accent-color: "#FF6138"')
  })

  it('should generate Typst for Rirekisho template', () => {
    const settings: TemplateSettings = { ...defaultSettings, template: 'rirekisho', fontSize: '10pt' }
    const output = generateResumeTypst(RIREKISHO_SAMPLE_DATA, settings)
    
    expect(output).toContain('#import "rirekisho/rirekisho.typ": *')
    expect(output).toContain('firstname: "太郎"')
    expect(output).toContain('lastname: "山田"')
    expect(output).toContain('学歴・職歴')
  })

  it('should generate Typst for Shokumu Keirekisho template', () => {
    const settings: TemplateSettings = { ...defaultSettings, template: 'shokumukeirekisho', fontSize: '10pt' }
    const output = generateResumeTypst(SHOKUMU_SAMPLE_DATA, settings)
    
    expect(output).toContain('#import "shokumukeirekisho/shokumukeirekisho.typ": *')
    expect(output).toContain('職務経歴書')
    expect(output).toContain('職務要約')
    expect(output).toContain('職務経歴')
    // Check for structured metadata
    expect(output).toContain('SF事業部 販促ツール開発')
    expect(output).toContain('使用技術: Excel, Access, Illustrator')
  })

  it('should fall back to Classic if template is unknown', () => {
    const settings: TemplateSettings = { ...defaultSettings, template: 'invalid' as any }
    const output = generateResumeTypst(SAMPLE_RESUME_DATA, settings)
    
    expect(output).toContain('#import "awesome-cv-classic.typ": *')
  })
})
