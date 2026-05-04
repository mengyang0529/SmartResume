import type { RichTextBlock } from '../types/richText'
import type { ResumeSection, Entry } from '../types/resume'
import { generateId } from './id'

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
    rightContent: section.rightContent || '',
  })

  let lastH2Title = ''

  section.entries.forEach((entry) => {
    // H2 for company
    if (entry.title && entry.title !== lastH2Title) {
      lastH2Title = entry.title
      blocks.push({
        id: `ent-h2-${entry.id}`,
        type: 'h2',
        content: entry.title,
        rightContent: entry.rightContent || '',
      })
    }

    // H3 for position/project
    blocks.push({
      id: `ent-h3-${entry.id}`,
      type: 'h3',
      content: entry.projectName || entry.subtitle,
      rightContent: entry.rightContent || '',
    })

    // Paragraphs/Bullets for description
    if (entry.description) {
      entry.description
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
        .forEach((line, i) => {
          let content = line
          let bold = false

          // Detect whole-line bold: **text**
          const boldMatch = line.match(/^\*\*(.+)\*\*$/)
          if (boldMatch) {
            content = boldMatch[1]
            bold = true
          }

          blocks.push({
            id: `ent-b-${entry.id}-${i}`,
            type: 'bullet',
            content,
            bold,
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

  let current: Partial<Entry> & { id: string } = { id: generateId() }
  let inEntry = false
  let h2Title = ''

  blocks.forEach((block) => {
    if (block.type === 'h1') {
      section.title = block.content
      section.rightContent = block.rightContent
    } else if (block.type === 'h2') {
      // h2 = company
      if (inEntry && (current.title || current.description)) {
        section.entries.push(current as Entry)
      }
      h2Title = block.content
      current = { 
        id: generateId(), 
        title: h2Title, 
        subtitle: '', 
        rightContent: block.rightContent,
        startDate: '', 
        endDate: '' 
      }
      inEntry = false
    } else if (block.type === 'h3') {
      // h3 = project
      if (inEntry && (current.subtitle || current.description)) {
        section.entries.push(current as Entry)
      }
      current = {
        id: generateId(),
        title: h2Title,
        subtitle: block.content,
        rightContent: block.rightContent,
        projectName: block.projectName,
        teamSize: block.teamSize,
        technologies: block.technologies,
      }
      // Parse dates for backward compatibility/sorting, but we prefer rightContent now
      const rc = block.rightContent || ''
      const m = rc.match(/^(.+?)\s*--\s*(.*)$/)
      if (m) {
        current.startDate = m[1].trim()
        current.endDate = m[2].trim()
      } else {
        current.startDate = rc.trim()
      }
      inEntry = true
    } else if (block.type === 'bullet' || block.type === 'paragraph') {
      if (!inEntry) {
        inEntry = true
        current = { id: generateId(), title: h2Title, subtitle: '', startDate: '', endDate: '' }
      }

      const content = block.bold ? `**${block.content}**` : block.content
      current.description = current.description
        ? current.description + '\n' + content
        : content
    }
  })

  if (inEntry && (current.title || current.description)) {
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
      const newSecId = block.id.startsWith('sec-h1-') ? block.id.replace('sec-h1-', '') : `sec-${generateId()}`
      const newGroup: RichTextBlock[] = []
      sectionGroups.push({ id: newSecId, blocks: newGroup })
      currentGroup = newGroup
    }
    if (currentGroup) {
      currentGroup.push(block)
    } else if (blocks.indexOf(block) === 0) {
      const newGroup: RichTextBlock[] = []
      sectionGroups.push({ id: `sec-${generateId()}`, blocks: newGroup })
      currentGroup = newGroup
      currentGroup.push(block)
    }
  })

  return sectionGroups.map(group => blocksToSection(group.blocks, group.id))
}
