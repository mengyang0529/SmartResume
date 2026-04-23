import { ResumeData, TemplateSettings } from '../types/resume'
import { RichTextBlock } from '../types/richText'

export function generateResumeTypst(data: ResumeData, settings: TemplateSettings): string {
  const { personal, education, sections, skills, summary } = data
  
  const accentColor = getAccentColor(settings)
  const paperSize = settings.paperSize === 'letterpaper' ? 'us-letter' : 'a4'

  const authorEntries: string[] = []
  authorEntries.push(`    firstname: "${escapeTypstString(personal.firstName)}",`)
  authorEntries.push(`    lastname: "${escapeTypstString(personal.lastName)}",`)
  authorEntries.push(`    positions: ("${escapeTypstString(personal.position)}",),`)
  authorEntries.push(`    email: "${escapeTypstString(personal.email)}",`)
  if (personal.mobile) authorEntries.push(`    phone: "${escapeTypstString(personal.mobile)}",`)
  if (personal.address) authorEntries.push(`    address: "${escapeTypstString(personal.address)}",`)
  if (personal.github) authorEntries.push(`    github: "${escapeTypstString(personal.github.replace('https://github.com/', ''))}",`)

  const authorBlock = authorEntries.join('\n')

  let typst = `#import "awesome-cv.typ": *

#show: resume.with(
  author: (
${authorBlock}
  ),
  profile-picture: none,
  date: datetime.today().display(),
  paper-size: "${paperSize}",
  accent-color: "${accentColor}",
  colored-headers: ${settings.sectionColorHighlight},
  language: "en",
  font: ("Source Sans 3", "Source Sans Pro", "LXGW Neo XiHei"),
)

`

  if (summary) {
    typst += `= Summary\n\n#resume-item[\n  ${escapeTypstContent(summary)}\n]\n\n`
  }

  // 1. Education
  if (education && education.length > 0) {
    if (education[0].blocks && education[0].blocks.length > 0) {
      // Use rich blocks (which should include H1)
      typst += renderBlocksAsEntries(education[0].blocks)
    } else {
      // Fallback to legacy education data
      typst += `= Education\n\n`
      education.forEach(edu => {
        typst += `#resume-entry(
  title: "${escapeTypstString(edu.school)}",
  location: "${escapeTypstString(edu.location || '')}",
  date: "${escapeTypstString(edu.startDate)} -- ${escapeTypstString(edu.endDate || '')}",
  description: "${escapeTypstString(edu.degree)}",
)\n`
        if (edu.description) typst += `#resume-item[\n  - ${escapeTypstContent(edu.description)}\n]\n\n`
      })
    }
  }

  // 2. Dynamic Sections
  sections.forEach(sec => {
    if (sec.blocks && sec.blocks.length > 0) {
      typst += renderBlocksAsEntries(sec.blocks)
    } else if (sec.entries && sec.entries.length > 0) {
      typst += `= ${sec.title}\n\n`
      sec.entries.forEach(entry => {
        typst += `#resume-entry(
  title: "${escapeTypstString(entry.title)}",
  location: "${escapeTypstString(entry.location || '')}",
  date: "${escapeTypstString(entry.startDate)}${entry.endDate ? ' -- ' + entry.endDate : ''}",
  description: "${escapeTypstString(entry.subtitle)}",
)\n`
        if (entry.description) {
          typst += `#resume-item[\n`
          entry.description.split('\n').forEach(line => {
            if (line.trim()) typst += `  - ${escapeTypstContent(line.trim())}\n`
          })
          typst += `]\n\n`
        }
      })
    }
  })

  // 3. Skills
  if (skills && skills.length > 0) {
    typst += `= Skills\n\n`
    const byCategory: any = {}
    skills.forEach(s => {
      if (!byCategory[s.category]) byCategory[s.category] = []
      byCategory[s.category].push(s.name)
    })
    Object.entries(byCategory).forEach(([cat, names]: any) => {
      const namesList = names.length === 1 ? `("${escapeTypstString(names[0])}",)` : `("${names.map(escapeTypstString).join('", "')}")`
      typst += `#resume-skill-item("${escapeTypstString(cat)}", ${namesList})\n`
    })
  }

  return typst
}

function renderBlocksAsEntries(blocks: RichTextBlock[]): string {
  let typst = ''
  let currentEntry: { title?: string, location?: string, date?: string, description?: string, items: string[] } | null = null

  const flush = () => {
    if (currentEntry) {
      typst += `#resume-entry(
  title: [${currentEntry.title || ''}],
  location: [${currentEntry.location || ''}],
  date: [${currentEntry.date || ''}],
  description: [${currentEntry.description || ''}],
)\n`
      if (currentEntry.items.length > 0) {
        typst += `#resume-item[\n`
        currentEntry.items.forEach(item => {
          typst += `  - ${item}\n`
        })
        typst += `]\n\n`
      }
    }
    currentEntry = null
  }

  blocks.forEach(block => {
    if (block.type === 'h1') {
      flush()
      typst += `= ${escapeTypstContent(block.content)}\n\n`
    } else if (block.type === 'h2') {
      flush()
      currentEntry = {
        title: renderFormattedText(block.content, block.bold, block.color),
        location: block.rightContent ? escapeTypstContent(block.rightContent) : '',
        items: []
      }
    } else if (block.type === 'h3') {
      if (!currentEntry) {
        currentEntry = { items: [] }
      }
      currentEntry.description = renderFormattedText(block.content, block.bold, block.color)
      currentEntry.date = block.rightContent ? escapeTypstContent(block.rightContent) : ''
    } else if (block.type === 'bullet' || block.type === 'paragraph') {
      if (!currentEntry) {
        currentEntry = { items: [] }
      }
      currentEntry.items.push(renderFormattedText(block.content, block.bold, block.color))
    }
  })

  flush()
  return typst
}

function renderFormattedText(content: string, bold?: boolean, color?: string): string {
  let text = escapeTypstContent(content)
  if (bold) {
    text = `*${text}*`
  }
  if (color) {
    text = `#text(fill: rgb("${color}"))[${text}]`
  }
  return text
}

function escapeTypstContent(text: string): string {
  if (!text) return ''
  return text
    .replace(/\\/g, '\\\\')
    .replace(/#/g, '\\#')
    .replace(/\*/g, '\\*')
    .replace(/_/g, '\\_')
    .replace(/</g, '\\<')
    .replace(/>/g, '\\>')
    .replace(/"/g, '\\"')
}

function escapeTypstString(text: string): string {
  if (!text) return ''
  return text.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function getAccentColor(settings: TemplateSettings): string {
  const colorMap: Record<string, string> = {
    'awesome-red': '#DC3522',
    'awesome-skyblue': '#0395DE',
    'awesome-emerald': '#00A388',
    'awesome-orange': '#FF6138',
  }
  return colorMap[settings.colorScheme] || '#DC3522'
}
