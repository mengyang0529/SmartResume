import { describe, it, expect } from 'vitest'
import { educationToBlocks, blocksToEducation, sectionToBlocks, blocksToSection } from './resumeTransforms'
import type { Education, ResumeSection } from '../types/resume'
import type { RichTextBlock } from '../types/richText'

describe('resumeTransforms', () => {
  describe('Education <-> Blocks', () => {
    it('should preserve bold and color when converting blocks to education', () => {
      const blocks: RichTextBlock[] = [
        { id: '1', type: 'h2', content: 'Test University', bold: true, color: '#FF0000', rightContent: 'London' },
        { id: '2', type: 'h3', content: 'BSc Computer Science', bold: false, color: '#00FF00', rightContent: '2020 -- 2023' },
        { id: '3', type: 'bullet', content: 'First Class Honors', bold: true }
      ]

      const education = blocksToEducation(blocks)
      expect(education).toHaveLength(1)
      expect(education[0].school).toBe('Test University')
      expect(education[0].blocks).toHaveLength(3)
      expect(education[0].blocks![0].bold).toBe(true)
      expect(education[0].blocks![0].color).toBe('#FF0000')
      expect(education[0].blocks![2].bold).toBe(true)
    })

    it('should prefer existing blocks in educationToBlocks', () => {
      const education: Education[] = [
        {
          id: 'edu-1',
          school: 'Fallback School',
          degree: 'Fallback Degree',
          startDate: '2020',
          blocks: [
            { id: 'b-1', type: 'h2', content: 'Real School', bold: true, color: '#123456' }
          ]
        }
      ]

      const blocks = educationToBlocks(education)
      expect(blocks).toHaveLength(1)
      expect(blocks[0].content).toBe('Real School')
      expect(blocks[0].color).toBe('#123456')
    })
  })

  describe('ResumeSection <-> Blocks', () => {
    it('should preserve formatting in section blocks', () => {
      const blocks: RichTextBlock[] = [
        { id: 's-1', type: 'h1', content: 'Work Experience', bold: true },
        { id: 's-2', type: 'h2', content: 'Google', color: '#4285F4' },
        { id: 's-3', type: 'h3', content: 'Software Engineer', rightContent: '2022' }
      ]

      const section = blocksToSection(blocks, 'sec-1')
      expect(section.title).toBe('Work Experience')
      expect(section.blocks).toHaveLength(3)
      expect(section.blocks![1].color).toBe('#4285F4')

      const backToBlocks = sectionToBlocks(section)
      expect(backToBlocks).toEqual(blocks)
    })
  })
})
