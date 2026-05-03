import { describe, it, expect } from 'vitest'
import { sectionToBlocks, blocksToSection } from './resumeTransforms'
import type { ResumeSection } from '../types/resume'
import type { RichTextBlock } from '../types/richText'

describe('resumeTransforms', () => {
  describe('ResumeSection <-> Blocks', () => {
    it('should convert section to blocks with proper structure', () => {
      const section: ResumeSection = {
        id: 'sec-1',
        title: 'Work Experience',
        entries: [
          {
            id: 'entry-1',
            title: 'Google',
            subtitle: 'Software Engineer',
            startDate: '2022',
            endDate: '2024',
            location: 'Mountain View',
            description: 'Built cool stuff\nWorked on big projects',
          },
        ],
      }

      const blocks = sectionToBlocks(section)
      expect(blocks).toHaveLength(5)
      expect(blocks[0]).toMatchObject({ type: 'h1', content: 'Work Experience' })
      expect(blocks[1]).toMatchObject({ type: 'h2', content: 'Google', rightContent: 'Mountain View' })
      expect(blocks[2]).toMatchObject({ type: 'h3', content: 'Software Engineer', rightContent: '2022 -- 2024' })
      expect(blocks[3]).toMatchObject({ type: 'bullet', content: 'Built cool stuff' })
      expect(blocks[4]).toMatchObject({ type: 'bullet', content: 'Worked on big projects' })
    })

    it('should preserve formatting in blocks roundtrip', () => {
      const blocks: RichTextBlock[] = [
        { id: 's-1', type: 'h1', content: 'Work Experience', bold: true },
        { id: 's-2', type: 'h2', content: 'Google', color: '#4285F4' },
        { id: 's-3', type: 'h3', content: 'Software Engineer', rightContent: '2022' },
      ]

      const section = blocksToSection(blocks, 'sec-1')
      expect(section.title).toBe('Work Experience')
      expect(section.blocks).toHaveLength(3)
      expect(section.blocks![1].color).toBe('#4285F4')

      const backToBlocks = sectionToBlocks(section)
      expect(backToBlocks).toEqual(blocks)
    })

    it('should prefer existing blocks over generating new ones', () => {
      const section: ResumeSection = {
        id: 'sec-1',
        title: 'Education',
        entries: [
          { id: 'e-1', title: 'Fallback School', subtitle: 'Degree', startDate: '2020' },
        ],
        blocks: [
          { id: 'b-1', type: 'h2', content: 'Real School', bold: true, color: '#123456' },
        ],
      }

      const blocks = sectionToBlocks(section)
      expect(blocks).toHaveLength(1)
      expect(blocks[0].content).toBe('Real School')
      expect(blocks[0].color).toBe('#123456')
    })

    it('should parse text-only sections into a default entry', () => {
      const blocks: RichTextBlock[] = [
        { id: 'b1', type: 'h1', content: 'Professional Summary' },
        { id: 'b2', type: 'paragraph', content: 'An experienced software engineer with a passion for building great products.' },
        { id: 'b3', type: 'bullet', content: 'Proficient in TypeScript and React.' },
      ]

      const section = blocksToSection(blocks, 'sec-1')
      expect(section.title).toBe('Professional Summary')
      expect(section.entries).toHaveLength(1)
      expect(section.entries[0].title).toBe('')
      expect(section.entries[0].description).toBe(
        'An experienced software engineer with a passion for building great products.\nProficient in TypeScript and React.'
      )
    })
  })
})
