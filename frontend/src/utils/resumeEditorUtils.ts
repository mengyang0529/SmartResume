import type { ResumeData, Skill } from '../types/resume'
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
  blocks.push({ id: generateId('blk'), type: 'h1', content: 'Skills' })
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
