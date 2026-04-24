import { ResumeData, TemplateSettings } from '../types/resume'
import { RichTextBlock } from '../types/richText'

export function generateResumeTypst(data: ResumeData, settings: TemplateSettings, skillsBlocks?: RichTextBlock[]): string {
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
if (personal.homepage) authorEntries.push(`    homepage: "${escapeTypstString(personal.homepage)}",`)

  const authorBlock = authorEntries.join('\n')

  const photoUrl = personal.photo?.url
  let photoEntry: string
  if (photoUrl) {
    photoEntry = `profile-picture: image(bytes((
  ${dataUrlToTypstBytes(photoUrl)}
)), height: 4cm, fit: "cover"),`
  } else {
    photoEntry = 'profile-picture: none,'
  }

  const templateFile = settings.template === 'modern' ? 'awesome-cv-modern.typ' : 'awesome-cv-classic.typ'
  let typst = `#import "${templateFile}": *

#show: resume.with(
  author: (
${authorBlock}
  ),
  ${photoEntry}
  date: datetime.today().display(),
  paper-size: "${paperSize}",
  accent-color: "${accentColor}",
  colored-headers: ${settings.sectionColorHighlight},
  language: "en",
  font: ("Noto Sans CJK SC", "Noto Sans CJK JP", "Source Sans 3"),
)

// Disable automatic uppercase for headings to respect user input
// Note: awesome-cv-classic.typ handles this via styling if needed, but 'upper' is not a valid parameter for heading in Typst

`

  if (summary) {
    typst += `#block(sticky: true, above: 1em)[
  #set text(size: 16pt, weight: "regular")
  #align(left)[
    #text(fill: black)[*Summary*]
    #box(width: 1fr, line(length: 100%))
  ]
]\n\n#resume-item[\n  ${escapeTypstContent(summary)}\n]\n\n`
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
    // Render H1 heading from skills blocks in black, or no heading if absent
    const skillsHeading = skillsBlocks?.find(b => b.type === 'h1')?.content
    if (skillsHeading) {
      typst += `= ${escapeTypstContent(skillsHeading)}\n\n`
    }
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
      const content = renderFormattedText(block.content, block.bold ?? false, block.color)
      typst += `= ${content}\n\n`
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

function dataUrlToTypstBytes(dataUrl: string): string {
  const base64 = dataUrl.split(',')[1]
  if (!base64) return '0x00'
  const binaryStr = atob(base64)
  const parts: string[] = []
  for (let i = 0; i < binaryStr.length; i++) {
    parts.push('0x' + binaryStr.charCodeAt(i).toString(16).toUpperCase().padStart(2, '0'))
  }
  // Group into lines of 16 hex bytes
  const lines: string[] = []
  for (let i = 0; i < parts.length; i += 16) {
    lines.push('    ' + parts.slice(i, i + 16).join(', '))
  }
  return lines.join(',\n') + ','
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

export function getAccentColor(settings: TemplateSettings): string {
  if (settings.colorScheme.startsWith('#')) return settings.colorScheme
  const colorMap: Record<string, string> = {
    'awesome-red': '#DC3522',
    'awesome-skyblue': '#0395DE',
    'awesome-emerald': '#00A388',
    'awesome-orange': '#FF6138',
  }
  return colorMap[settings.colorScheme] || '#DC3522'
}
