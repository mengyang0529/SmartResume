import type { ResumeData, Skill, Education } from '../types/resume'
import type { RichTextBlock } from '../types/richText'

export const generateId = (prefix = 'id') => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 11)}`
}

export function skillsToBlocks(skills: Skill[]): RichTextBlock[] {
  const byCategory: Record<string, string[]> = {}
  skills.forEach(s => {
    if (!byCategory[s.category]) byCategory[s.category] = []
    byCategory[s.category].push(s.name)
  })
  const blocks: RichTextBlock[] = []
  if (Object.keys(byCategory).length > 0) {
    blocks.push({ id: generateId('blk'), type: 'h1', content: 'Skills' })
  }
  Object.entries(byCategory).forEach(([cat, names]) => {
    if (cat) blocks.push({ id: generateId('blk'), type: 'h2', content: cat })
    names.forEach(name => {
      if (name.trim()) blocks.push({ id: generateId('blk'), type: 'h3', content: name.trim() })
    })
  })
  return blocks
}

export function blocksToSkills(blocks: RichTextBlock[]): Skill[] {
  const skills: Skill[] = []
  let currentCategory = ''
  blocks.forEach((block, i) => {
    if (block.type === 'h2') {
      currentCategory = block.content
    } else if (block.type === 'h3' || block.type === 'bullet' || block.type === 'paragraph') {
      if (block.content.trim()) {
        skills.push({ id: `sk-${i}`, category: currentCategory, name: block.content.trim() })
      }
    }
  })
  return skills
}

export function educationToBlocks(education: Education[]): RichTextBlock[] {
  const blocks: RichTextBlock[] = []
  blocks.push({ id: generateId('blk'), type: 'h1', content: 'Education' })
  education.forEach(edu => {
    blocks.push({
      id: generateId('blk'), type: 'h2', content: edu.school,
      rightContent: edu.location || '',
    })
    blocks.push({
      id: generateId('blk'), type: 'h3', content: edu.degree,
      rightContent: `${edu.startDate}${edu.endDate ? ' -- ' + edu.endDate : ''}`,
    })
    if (edu.description) {
      edu.description.split('\n').filter(l => l.trim()).forEach(line => {
        blocks.push({ id: generateId('blk'), type: 'bullet', content: line.trim() })
      })
    }
  })
  return blocks
}

// Convert a section (e.g. 志望の動機, 本人希望記入欄) into RichTextBlocks
// for inclusion in skillsBlocks: h1 for title, paragraph for content.
export function sectionToRirekiBlocks(section: { title: string; entries: { description?: string }[] }): RichTextBlock[] {
  const blocks: RichTextBlock[] = []
  blocks.push({ id: generateId('blk'), type: 'h1', content: section.title })
  const desc = section.entries.map(e => e.description || '').filter(Boolean).join('\n')
  if (desc) {
    blocks.push({ id: generateId('blk'), type: 'paragraph', content: desc })
  }
  return blocks
}

// Separate rirekisho-specific sections (志望の動機, 本人希望記入欄) from regular sections
// and return blocks for appending to skillsBlocks.
export function separateRirekiSections<T extends { title: string; entries: { description?: string }[] }>(sections: T[]): {
  regularSections: T[]
  extraBlocks: RichTextBlock[]
} {
  const regularSections: T[] = []
  const extraBlocks: RichTextBlock[] = []
  for (const sec of sections) {
    if (/志望の動機|自己PR/i.test(sec.title) || /本人希望記入欄/i.test(sec.title)) {
      extraBlocks.push(...sectionToRirekiBlocks(sec))
    } else {
      regularSections.push(sec)
    }
  }
  return { regularSections, extraBlocks }
}

export const EMPTY_RESUME_DATA: ResumeData = {
  personal: {
    firstName: '',
    lastName: '',
    position: '',
    email: '',
    mobile: '',
    address: '',
    homepage: '',
  },
  education: [],
  sections: [],
  skills: [],
}
