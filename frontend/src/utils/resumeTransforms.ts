import type { RichTextBlock } from '../types/richText'
import type { ResumeSection, Entry, ResumeData } from '../types/resume'

/* ------------------------------------------------------------------ */
/*  Generic Section  <=>  RichTextBlock[]                               */
/* ------------------------------------------------------------------ */

export function sectionToBlocks(section: ResumeSection): RichTextBlock[] {
  // If we have cached blocks for this section, use them
  if (section.blocks && section.blocks.length > 0) return section.blocks

  const blocks: RichTextBlock[] = []
  
  // H1 for Section Title
  blocks.push({
    id: `sec-h1-${section.id}`,
    type: 'h1',
    content: section.title,
  })

  section.entries.forEach((entry) => {
    // H2 for main entity (Company/School)
    blocks.push({
      id: `ent-h2-${entry.id}`,
      type: 'h2',
      content: entry.title,
      rightContent: entry.location || '',
    })

    // H3 for subtitle (Role/Degree) and dates
    const dateStr = `${entry.startDate}${entry.endDate ? ' -- ' + entry.endDate : ''}`
    blocks.push({
      id: `ent-h3-${entry.id}`,
      type: 'h3',
      content: entry.subtitle,
      rightContent: dateStr,
    })

    // Paragraphs/Bullets for description
    if (entry.description) {
      entry.description
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
        .forEach((line, i) => {
          blocks.push({
            id: `ent-b-${entry.id}-${i}`,
            type: 'bullet',
            content: line,
          })
        })
    }
  })

  return blocks
}

export function blocksToSection(blocks: RichTextBlock[], sectionId: string): ResumeSection {
  const section: ResumeSection = { 
    id: sectionId, 
    title: '', 
    entries: [],
    blocks: [...blocks] 
  }
  
  let current: Partial<Entry> & { id: string } = { id: crypto.randomUUID() }
  let inEntry = false

  blocks.forEach((block) => {
    if (block.type === 'h1') {
      section.title = block.content
    } else if (block.type === 'h2') {
      if (inEntry && current.title) {
        section.entries.push(current as Entry)
      }
      current = { id: crypto.randomUUID(), title: block.content, location: block.rightContent || undefined }
      inEntry = true
    } else if (block.type === 'h3' && inEntry) {
      current.subtitle = block.content
      const rc = block.rightContent || ''
      const m = rc.match(/^(.+?)\s*--\s*(.*)$/)
      if (m) {
        current.startDate = m[1].trim()
        const end = m[2].trim()
        if (end) current.endDate = end
      } else {
        current.startDate = rc.trim()
      }
    } else if (inEntry && (block.type === 'bullet' || block.type === 'paragraph')) {
      current.description = current.description
        ? current.description + '\n' + block.content
        : block.content
    }
  })

  if (inEntry && current.title) {
    section.entries.push(current as Entry)
  }
  
  return section
}

/* ------------------------------------------------------------------ */
/*  Modules (All Sections) <=> RichTextBlock[]                          */
/* ------------------------------------------------------------------ */

export function modulesToBlocks(sections: ResumeSection[]): RichTextBlock[] {
  let allBlocks: RichTextBlock[] = []
  sections.forEach(sec => {
    allBlocks = allBlocks.concat(sectionToBlocks(sec))
  })
  return allBlocks
}

export function blocksToModules(blocks: RichTextBlock[]): ResumeSection[] {
  const sectionGroups: { id: string, blocks: RichTextBlock[] }[] = []
  let currentGroup: RichTextBlock[] | null = null

  blocks.forEach(block => {
    if (block.type === 'h1') {
      const newSecId = block.id.startsWith('sec-h1-') ? block.id.replace('sec-h1-', '') : `sec-${crypto.randomUUID()}`
      const newGroup: RichTextBlock[] = []
      sectionGroups.push({ id: newSecId, blocks: newGroup })
      currentGroup = newGroup
    }
    if (currentGroup) {
      currentGroup.push(block)
    } else if (blocks.indexOf(block) === 0) {
      // First block is not H1, create a default group
      const newGroup: RichTextBlock[] = []
      sectionGroups.push({ id: `sec-${crypto.randomUUID()}`, blocks: newGroup })
      currentGroup = newGroup
      currentGroup.push(block)
    } else if (currentGroup) {
      currentGroup.push(block)
    }
  })

  return sectionGroups.map(group => blocksToSection(group.blocks, group.id))
}
