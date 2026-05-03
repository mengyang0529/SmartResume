import type { ResumeData, ResumeSection } from '../types/resume'

function parseYaml(lines: string[]): Record<string, string> {
  const result: Record<string, string> = {}
  for (const line of lines) {
    const m = line.match(/^(\w+):\s*(.+)/)
    if (m) {
      result[m[1]] = m[2].replace(/^["']|["']$/g, '').trim()
    }
  }
  return result
}

export function parseMarkdownResume(md: string): ResumeData {
  const lines = md.split('\n')
  const personal: Record<string, string> = {}
  const education: ResumeData['education'] = []
  const sections: ResumeSection[] = []
  const skills: { category: string; name: string }[] = []

  let currentSection: ResumeSection | null = null
  let currentEntry: any = null
  let currentEntryLines: string[] = []
  let inYaml = false
  let yamlLines: string[] = []
  let inFirstSection = true // track if we're before the first "## Skills"

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // YAML frontmatter
    if (i === 0 && trimmed === '---') {
      inYaml = true
      continue
    }
    if (inYaml && trimmed === '---') {
      inYaml = false
      Object.assign(personal, parseYaml(yamlLines))
      continue
    }
    if (inYaml) {
      yamlLines.push(line)
      continue
    }

    // --- Skills section terminator ---
    if (trimmed === '## Skills') {
      // flush current section/entry before switching
      flushEntry()
      flushSection()
      inFirstSection = false
      continue
    }

    if (!inFirstSection) {
      // Skills section: "- **Category**: skill1, skill2"
      const skillMatch = trimmed.match(/^-\s+\*\*([^*]+)\*\*:\s*(.+)/)
      if (skillMatch) {
        skills.push({ category: skillMatch[1].trim(), name: skillMatch[2].trim() })
      }
      continue
    }

    // --- Regular sections ---

    // H2 = new section
    const h2Match = trimmed.match(/^##\s+(.+)/)
    if (h2Match) {
      flushEntry()
      flushSection()
      const title = h2Match[1].trim()
      if (title === 'Education') {
        // Special handling: Education entries are H3 under ## Education
        currentSection = { id: genId('sec'), title: 'Education', entries: [] }
      } else {
        currentSection = { id: genId('sec'), title, entries: [] }
      }
      continue
    }

    // 免許・資格 section: each "- **Category**: names" line is its own entry
    if (currentSection && /免許・資格/.test(currentSection.title)) {
      const certMatch = trimmed.match(/^-\s+\*\*([^*]+)\*\*:\s*(.+)/)
      if (certMatch) {
        flushEntry()
        currentEntry = { title: certMatch[1].trim(), subtitle: '', startDate: '', endDate: '', description: certMatch[2].trim() }
        currentEntryLines = []
        flushEntry() // each line is a separate entry
      } else if (trimmed) {
        if (!currentEntry) {
          currentEntry = { title: '', subtitle: '', startDate: '', endDate: '', description: '' }
          currentEntryLines = []
        }
        currentEntryLines.push(trimmed)
      }
      continue
    }

    // H3 = new entry (section entry or education entry)
    const h3Match = trimmed.match(/^###\s+(.+)/)
    if (h3Match) {
      flushEntry()
      currentEntry = { title: h3Match[1].trim(), subtitle: '', startDate: '', endDate: '', description: '' }
      currentEntryLines = []
      continue
    }

    // Bold line: **subtitle** [| dates]
    const boldMatch = trimmed.match(/^\*\*(.+?)\*\*(\s*\|\s*(.+))?/)
    if (boldMatch && currentEntry) {
      currentEntry.subtitle = boldMatch[1].trim()
      if (boldMatch[3]) {
        const datePart = boldMatch[3].trim()
        const dateSep = datePart.indexOf(' - ')
        if (dateSep > 0) {
          currentEntry.startDate = datePart.slice(0, dateSep).trim()
          currentEntry.endDate = datePart.slice(dateSep + 3).trim()
        } else {
          currentEntry.startDate = datePart
        }
      }
      continue
    }

    // Italic line (alternative role): *role*
    const italicMatch = trimmed.match(/^\*(.+)\*/)
    if (italicMatch && currentEntry && !currentEntry.subtitle) {
      currentEntry.subtitle = italicMatch[1].trim()
      continue
    }

    // Collect other lines (description)
    // Auto-create entry for sections with plain text (no H3 headers),
    // e.g. 志望の動機, 本人希望記入欄 in rirekisho resumes.
    if (trimmed) {
      if (!currentEntry && currentSection) {
        currentEntry = { title: '', subtitle: '', startDate: '', endDate: '', description: '' }
        currentEntryLines = []
      }
      if (currentEntry) {
        currentEntryLines.push(trimmed)
      }
    }
  }

  flushEntry()
  flushSection()

  function flushEntry() {
    if (!currentEntry || !currentSection) return
    if (currentEntryLines.length > 0) {
      currentEntry.description = currentEntryLines
        .map(l => l.replace(/^- /, '').trim())
        .filter(Boolean)
        .join('\n')
    }
    // If it's Education section, map to education array
    if (currentSection.title === 'Education') {
      education.push({
        id: genId('edu'),
        school: currentEntry.title,
        degree: currentEntry.subtitle,
        startDate: currentEntry.startDate,
        endDate: currentEntry.endDate,
        location: '',
        description: currentEntry.description || '',
      })
    } else {
      currentSection.entries.push({
        id: genId('entry'),
        title: currentEntry.title,
        subtitle: currentEntry.subtitle,
        startDate: currentEntry.startDate,
        endDate: currentEntry.endDate,
        description: currentEntry.description,
      })
    }
    currentEntry = null
    currentEntryLines = []
  }

  function flushSection() {
    if (currentSection && currentSection.entries.length > 0) {
      sections.push(currentSection)
    }
    currentSection = null
  }

  // Extract summary from 志望の動機 section (if present)
  const summary = sections.find(s => /志望の動機|自己PR/i.test(s.title))?.entries?.[0]?.description || ''

  return {
    personal: {
      firstName: personal.firstName || '',
      lastName: personal.lastName || '',
      furiganaFirstName: personal.furiganaFirstName || '',
      furiganaLastName: personal.furiganaLastName || '',
      birth: personal.birth || '',
      position: personal.position || '',
      email: personal.email || '',
      mobile: personal.mobile || '',
      address: personal.address || '',
      homepage: personal.homepage || personal.github || '',
    },
    education,
    sections,
    skills: skills.map((s, i) => ({ id: `sk-${i}`, category: s.category, name: s.name })),
    summary,
  }
}

function genId(prefix: string) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 11)}`
}

function escapeYaml(val: string): string {
  return /[:#\[\]{},"']/.test(val) ? `"${val}"` : val
}

export function generateMarkdownResume(data: ResumeData): string {
  const lines: string[] = []

  // YAML frontmatter
  lines.push('---')
  if (data.personal.firstName) lines.push(`firstName: ${escapeYaml(data.personal.firstName)}`)
  if (data.personal.lastName) lines.push(`lastName: ${escapeYaml(data.personal.lastName)}`)
  if (data.personal.furiganaFirstName) lines.push(`furiganaFirstName: ${escapeYaml(data.personal.furiganaFirstName)}`)
  if (data.personal.furiganaLastName) lines.push(`furiganaLastName: ${escapeYaml(data.personal.furiganaLastName)}`)
  if (data.personal.birth) lines.push(`birth: ${escapeYaml(data.personal.birth)}`)
  if (data.personal.position) lines.push(`position: ${escapeYaml(data.personal.position)}`)
  if (data.personal.email) lines.push(`email: ${escapeYaml(data.personal.email)}`)
  if (data.personal.mobile) lines.push(`mobile: "${data.personal.mobile}"`)
  if (data.personal.address) lines.push(`address: ${escapeYaml(data.personal.address)}`)
  if (data.personal.homepage) lines.push(`homepage: ${escapeYaml(data.personal.homepage)}`)
  lines.push('---')
  lines.push('')

  // Education section
  if (data.education && data.education.length > 0) {
    lines.push('## Education')
    lines.push('')
    for (const edu of data.education) {
      lines.push(`### ${edu.school}`)
      const dateStr = [edu.startDate, edu.endDate].filter(Boolean).join(' - ')
      const meta = [edu.degree, dateStr].filter(Boolean).join(' | ')
      if (meta) lines.push(`**${meta}**`)
      if (edu.description) lines.push(edu.description)
      if (edu.location) lines.push(edu.location)
      lines.push('')
    }
  }

  // Sections
  for (const section of data.sections) {
    // 免許・資格 uses "- **Category**: names" format
    if (/免許・資格/.test(section.title)) {
      lines.push(`## ${section.title}`)
      lines.push('')
      for (const entry of section.entries) {
        if (entry.title) {
          const desc = entry.description || ''
          lines.push(`- **${entry.title}**: ${desc}`)
        }
      }
      lines.push('')
      continue
    }
    lines.push(`## ${section.title}`)
    lines.push('')
    for (const entry of section.entries) {
      lines.push(`### ${entry.title}`)
      if (entry.subtitle && (entry.startDate || entry.endDate)) {
        const dateStr = [entry.startDate, entry.endDate].filter(Boolean).join(' - ')
        lines.push(`**${entry.subtitle}** | ${dateStr}`)
      } else if (entry.subtitle) {
        const dateStr = [entry.startDate, entry.endDate].filter(Boolean).join(' - ')
        if (dateStr) {
          lines.push(`**${entry.subtitle}** | ${dateStr}`)
        } else {
          lines.push(`*${entry.subtitle}*`)
        }
      } else if (entry.startDate || entry.endDate) {
        lines.push(`**${[entry.startDate, entry.endDate].filter(Boolean).join(' - ')}**`)
      }
      if (entry.description) {
        for (const descLine of entry.description.split('\n')) {
          if (descLine.trim()) lines.push(`- ${descLine.trim()}`)
        }
      }
      lines.push('')
    }
  }

  // Skills
  if (data.skills && data.skills.length > 0) {
    lines.push('## Skills')
    lines.push('')
    const byCategory: Record<string, string[]> = {}
    for (const skill of data.skills) {
      if (!byCategory[skill.category]) byCategory[skill.category] = []
      byCategory[skill.category].push(skill.name)
    }
    for (const [cat, names] of Object.entries(byCategory)) {
      if (cat) lines.push(`- **${cat}**: ${names.join(', ')}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
