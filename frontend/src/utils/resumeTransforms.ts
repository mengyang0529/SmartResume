import type { RichTextBlock } from '../types/richText'
import type { ResumeSection, Entry } from '../types/resume'

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

  let lastCompany = ''

  section.entries.forEach((entry) => {
    // H2 for company (only emit when company changes)
    if (entry.title && entry.title !== lastCompany) {
      lastCompany = entry.title
      blocks.push({
        id: `ent-h2-${entry.id}`,
        type: 'h2',
        content: entry.title,
        rightContent: entry.location || '',
      })
    } else if (!entry.title && entry.subtitle && !lastCompany) {
      // Fallback: entry without company title, but with a project name
      lastCompany = entry.subtitle
      blocks.push({
        id: `ent-h2-${entry.id}`,
        type: 'h2',
        content: entry.subtitle,
        rightContent: '',
      })
    }

    // H3 for project name
    const dateStr = `${entry.startDate}${entry.endDate ? ' -- ' + entry.endDate : ''}`
    blocks.push({
      id: `ent-h3-${entry.id}`,
      type: 'h3',
      content: entry.projectName || entry.subtitle,
      rightContent: dateStr,
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

  let current: Partial<Entry> & { id: string } = { id: crypto.randomUUID() }
  let inEntry = false
  let companyName = ''

  blocks.forEach((block) => {
    if (block.type === 'h1') {
      section.title = block.content
    } else if (block.type === 'h2') {
      // h2 = company, sets context but does NOT create an entry
      if (inEntry && (current.title || current.description)) {
        section.entries.push(current as Entry)
      }
      companyName = block.content
      current = { id: crypto.randomUUID(), title: '', subtitle: '', startDate: '', endDate: '' }
      inEntry = false  // wait for h3 to start the first project
    } else if (block.type === 'h3') {
      // h3 = project name, creates a new entry under the current company
      if (inEntry && (current.subtitle || current.description)) {
        section.entries.push(current as Entry)
      }
      current = {
        id: crypto.randomUUID(),
        title: companyName,
        subtitle: block.content,
        projectName: block.projectName,
        teamSize: block.teamSize,
        technologies: block.technologies,
      }
      // Parse dates from rightContent
      const rc = block.rightContent || ''
      const m = rc.match(/^(.+?)\s*--\s*(.*)$/)
      if (m) {
        current.startDate = m[1].trim()
        const end = m[2].trim()
        if (end) current.endDate = end
      } else {
        current.startDate = rc.trim()
      }
      inEntry = true
    } else if (block.type === 'bullet' || block.type === 'paragraph') {
      if (!inEntry) {
        inEntry = true
        current = { id: crypto.randomUUID(), title: companyName, subtitle: '', startDate: '', endDate: '' }
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
      const newSecId = block.id.startsWith('sec-h1-') ? block.id.replace('sec-h1-', '') : `sec-${crypto.randomUUID()}`
      const newGroup: RichTextBlock[] = []
      sectionGroups.push({ id: newSecId, blocks: newGroup })
      currentGroup = newGroup
    }
    if (currentGroup) {
      currentGroup.push(block)
    } else if (blocks.indexOf(block) === 0) {
      const newGroup: RichTextBlock[] = []
      sectionGroups.push({ id: `sec-${crypto.randomUUID()}`, blocks: newGroup })
      currentGroup = newGroup
      currentGroup.push(block)
    }
  })

  return sectionGroups.map(group => blocksToSection(group.blocks, group.id))
}
