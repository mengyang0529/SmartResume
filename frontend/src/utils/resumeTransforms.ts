import type { RichTextBlock } from '../types/richText'
import type { Education, ResumeSection, Entry } from '../types/resume'

/* ------------------------------------------------------------------ */
/*  Education  <=>  RichTextBlock[]                                     */
/* ------------------------------------------------------------------ */

export function educationToBlocks(education: Education[]): RichTextBlock[] {
  const blocks: RichTextBlock[] = []

  education.forEach((edu) => {
    blocks.push({
      id: `edu-h2-${edu.id}`,
      type: 'h2',
      content: edu.school,
      rightContent: edu.location || '',
    })

    const dateStr = `${edu.startDate}${edu.endDate ? ' -- ' + edu.endDate : ''}`
    blocks.push({
      id: `edu-h3-${edu.id}`,
      type: 'h3',
      content: edu.degree,
      rightContent: dateStr,
    })

    if (edu.description) {
      edu.description
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
        .forEach((line, i) => {
          blocks.push({
            id: `edu-b-${edu.id}-${i}`,
            type: 'bullet',
            content: line,
          })
        })
    }
  })

  return blocks
}

export function blocksToEducation(blocks: RichTextBlock[]): Education[] {
  const education: Education[] = []
  let current: Partial<Education> & { id: string } = { id: crypto.randomUUID() }
  let hasCurrent = false

  const flush = () => {
    if (hasCurrent && current.school) {
      education.push({
        id: current.id,
        school: current.school,
        degree: current.degree || '',
        startDate: current.startDate || '',
        endDate: current.endDate,
        location: current.location,
        description: current.description,
      })
    }
    current = { id: crypto.randomUUID() }
    hasCurrent = false
  }

  blocks.forEach((block) => {
    if (block.type === 'h2') {
      flush()
      current.school = block.content
      current.location = block.rightContent || undefined
      hasCurrent = true
    } else if (block.type === 'h3') {
      current.degree = block.content
      const rc = block.rightContent || ''
      const m = rc.match(/^(.+?)\s*--\s*(.*)$/)
      if (m) {
        current.startDate = m[1].trim()
        const end = m[2].trim()
        if (end) current.endDate = end
      } else {
        current.startDate = rc.trim()
      }
    } else if (block.type === 'bullet' || block.type === 'paragraph') {
      current.description = current.description
        ? current.description + '\n' + block.content
        : block.content
    }
  })

  flush()
  return education
}

/* ------------------------------------------------------------------ */
/*  ResumeSection  <=>  RichTextBlock[]                                 */
/* ------------------------------------------------------------------ */

export function sectionToBlocks(section: ResumeSection): RichTextBlock[] {
  const blocks: RichTextBlock[] = []

  blocks.push({
    id: `sec-h1-${section.id}`,
    type: 'h1',
    content: section.title,
  })

  section.entries.forEach((entry) => {
    blocks.push({
      id: `ent-h2-${entry.id}`,
      type: 'h2',
      content: entry.title,
      rightContent: entry.location || '',
    })

    const dateStr = `${entry.startDate}${entry.endDate ? ' -- ' + entry.endDate : ''}`
    blocks.push({
      id: `ent-h3-${entry.id}`,
      type: 'h3',
      content: entry.subtitle,
      rightContent: dateStr,
    })

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

    if (entry.highlights) {
      entry.highlights.forEach((hl, i) => {
        blocks.push({
          id: `ent-hl-${entry.id}-${i}`,
          type: 'bullet',
          content: hl,
        })
      })
    }
  })

  return blocks
}

export function blocksToSection(blocks: RichTextBlock[], sectionId: string): ResumeSection {
  const section: ResumeSection = { id: sectionId, title: '', entries: [] }
  let current: Partial<Entry> & { id: string } = { id: crypto.randomUUID() }
  let inEntry = false

  const flushEntry = () => {
    if (inEntry && current.title) {
      section.entries.push({
        id: current.id,
        title: current.title,
        subtitle: current.subtitle || '',
        startDate: current.startDate || '',
        endDate: current.endDate,
        location: current.location,
        description: current.description,
        highlights: current.highlights,
      })
    }
    current = { id: crypto.randomUUID() }
    inEntry = false
  }

  blocks.forEach((block) => {
    if (block.type === 'h1') {
      flushEntry()
      section.title = block.content
    } else if (block.type === 'h2') {
      flushEntry()
      current.title = block.content
      current.location = block.rightContent || undefined
      inEntry = true
    } else if (block.type === 'h3') {
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
    } else if (block.type === 'bullet' || block.type === 'paragraph') {
      current.description = current.description
        ? current.description + '\n' + block.content
        : block.content
    }
  })

  flushEntry()
  return section
}
