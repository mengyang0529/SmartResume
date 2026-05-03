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

    // Skip standalone separators or common markdown horizontal rules (3 or more chars)
    const hrMatch = trimmed.match(/^([-*_])\1{2,}\s*$/) || trimmed.match(/^-\s+([-*_])\1{2,}\s*$/)
    if (hrMatch) continue

    // --- Skills section terminator ---
    if (trimmed === '## Skills') {
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

    // H2 = new section (maps to Editor H1)
    const h2Match = trimmed.match(/^##\s+(.+)/)
    if (h2Match) {
      flushEntry()
      flushSection()
      const title = h2Match[1].trim()
      currentSection = { id: genId('sec'), title, entries: [], blocks: [] }
      currentSection.blocks!.push({ id: genId('blk'), type: 'h1', content: title })
      continue
    }

    // H3 = new entry (maps to Editor H2 / Company)
    const h3Match = trimmed.match(/^###\s+(.+)/)
    if (h3Match && currentSection) {
      flushEntry()
      const content = h3Match[1].trim()
      let title = content
      let rightContent = ''
      const pipeIdx = content.indexOf('|')
      if (pipeIdx !== -1) {
        title = content.slice(0, pipeIdx).trim()
        rightContent = content.slice(pipeIdx + 1).trim()
      }

      currentEntry = { title, subtitle: '', startDate: '', endDate: '', description: '' }
      currentEntryLines = []
      currentSection.blocks!.push({ id: genId('blk'), type: 'h2', content: title, rightContent })
      continue
    }

    // H4 = entry subtitle (maps to Editor H3 / Project or Role)
    const h4Match = trimmed.match(/^####\s+(.+)/)
    if (h4Match && currentSection) {
      const content = h4Match[1].trim()
      let subtitle = content
      let rightContent = ''
      
      const pipeIdx = content.indexOf('|')
      if (pipeIdx !== -1) {
        subtitle = content.slice(0, pipeIdx).trim()
        rightContent = content.slice(pipeIdx + 1).trim()
      }

      // Check for merging into H2 (Treating as Role for Shokumu Keirekisho)
      const lastBlock = currentSection.blocks![currentSection.blocks!.length - 1];
      const isWorkHistory = /職務経歴|職歴|職務経験|Work|Experience/i.test(currentSection.title);
      
      if (isWorkHistory && lastBlock && lastBlock.type === 'h2' && !lastBlock.rightContent) {
        const existing = lastBlock.rightContent || '';
        const fullRight = rightContent ? `${rightContent} | ${subtitle}` : subtitle;
        lastBlock.rightContent = existing ? `${existing} | ${fullRight}` : fullRight;
        // Also set currentEntry fields so the generator sees correct data
        currentEntry.subtitle = subtitle;
        if (rightContent) {
          const dateSep = rightContent.indexOf(' - ');
          if (dateSep > 0) {
            currentEntry.startDate = rightContent.slice(0, dateSep).trim();
            currentEntry.endDate = rightContent.slice(dateSep + 3).trim();
          } else {
            currentEntry.startDate = rightContent;
          }
        }
      } else {
        if (currentEntry) {
          if (currentEntry.subtitle) {
            if (isWorkHistory) {
              // In work history, subtitle is already set by a bold line (role).
              // Treat this H4 as a project-name heading — add to description instead.
              currentEntryLines.push(`**${content}**`);
              currentSection.blocks!.push({ id: genId('blk'), type: 'paragraph', content, bold: true });
              continue;
            }
            const savedTitle = currentEntry.title
            flushEntry()
            currentEntry = { title: savedTitle, subtitle: '', startDate: '', endDate: '', description: '' }
          }
          currentEntry.subtitle = subtitle
          if (rightContent) {
            const dateSep = rightContent.indexOf(' - ')
            if (dateSep > 0) {
              currentEntry.startDate = rightContent.slice(0, dateSep).trim()
              currentEntry.endDate = rightContent.slice(dateSep + 3).trim()
            } else {
              currentEntry.startDate = rightContent
            }
          }
        }
        currentSection.blocks!.push({ id: genId('blk'), type: 'h3', content: subtitle, rightContent })
      }
      continue
    }

    // Bold line support (Legacy / Alternate Role)
    // ONLY treat as header/role if it contains a pipe '|'
    const boldMatch = trimmed.match(/^\*\*(.+?)\*\*(\s*\|\s*(.+))/)
    if (boldMatch && currentEntry && currentSection) {
      const subtitle = boldMatch[1].trim()
      const rightContent = boldMatch[3] ? boldMatch[3].trim() : ''
      
      const lastBlock = currentSection.blocks![currentSection.blocks!.length - 1];
      const isWorkHistory = /職務経歴|職歴|職務経験|Work|Experience/i.test(currentSection.title);

      if (isWorkHistory && lastBlock && lastBlock.type === 'h2' && !lastBlock.rightContent) {
        const existing = lastBlock.rightContent || '';
        const fullRight = rightContent ? `${rightContent} | ${subtitle}` : subtitle;
        lastBlock.rightContent = existing ? `${existing} | ${fullRight}` : fullRight;
        // Also set currentEntry fields so the generator sees correct data
        currentEntry.subtitle = subtitle;
        if (rightContent) {
          const dateSep = rightContent.indexOf(' - ');
          if (dateSep > 0) {
            currentEntry.startDate = rightContent.slice(0, dateSep).trim();
            currentEntry.endDate = rightContent.slice(dateSep + 3).trim();
          } else {
            currentEntry.startDate = rightContent;
          }
        }
        // Also push an H3 block so the editor round-trip preserves subtitle/dates
        const dateStr = [currentEntry.startDate, currentEntry.endDate].filter(Boolean).join(' -- ');
        currentSection.blocks!.push({ id: genId('blk'), type: 'h3', content: subtitle, rightContent: dateStr });
      } else {
        if (currentEntry.subtitle) {
          const savedTitle = currentEntry.title
          flushEntry()
          currentEntry = { title: savedTitle, subtitle, startDate: '', endDate: '', description: '' }
        } else {
          currentEntry.subtitle = subtitle
        }

        if (rightContent) {
          const dateSep = rightContent.indexOf(' - ')
          if (dateSep > 0) {
            currentEntry.startDate = rightContent.slice(0, dateSep).trim()
            currentEntry.endDate = rightContent.slice(dateSep + 3).trim()
          } else {
            currentEntry.startDate = rightContent
          }
        }
        currentSection.blocks!.push({ id: genId('blk'), type: 'h3', content: subtitle, rightContent })
      }
      continue
    }

    // Content lines
    if (trimmed && currentSection) {
      if (!currentEntry) {
        currentEntry = { title: '', subtitle: '', startDate: '', endDate: '', description: '' }
      }
      currentEntryLines.push(trimmed)
      
      const type = trimmed.startsWith('- ') ? 'bullet' : 'paragraph'
      const content = trimmed.startsWith('- ') ? trimmed.slice(2).trim() : trimmed
      
      let finalContent = content
      let bold = false
      const bMatch = content.match(/^\*\*(.+)\*\*$/)
      if (bMatch) {
        finalContent = bMatch[1]
        bold = true
      }
      
      currentSection.blocks!.push({ id: genId('blk'), type, content: finalContent, bold })
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
    if (currentSection && (currentSection.entries.length > 0 || currentSection.blocks?.length)) {
      sections.push(currentSection)
    }
    currentSection = null
  }

  const summary = sections.find(s => /職務要約|志望の動機|自己PR/i.test(s.title))?.entries?.[0]?.description || ''

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

  if (data.education && data.education.length > 0) {
    lines.push('## Education')
    lines.push('')
    for (const edu of data.education) {
      lines.push(`### ${edu.school}`)
      const dateStr = [edu.startDate, edu.endDate].filter(Boolean).join(' - ')
      if (edu.degree || dateStr) {
        lines.push(`#### ${[edu.degree, dateStr].filter(Boolean).join(' | ')}`)
      }
      if (edu.description) lines.push(edu.description)
      if (edu.location) lines.push(edu.location)
      lines.push('')
    }
  }

  for (const section of data.sections) {
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
      const dateStr = [entry.startDate, entry.endDate].filter(Boolean).join(' - ')
      if (entry.subtitle || dateStr) {
        lines.push(`#### ${[entry.subtitle, dateStr].filter(Boolean).join(' | ')}`)
      }
      if (entry.description) {
        for (const descLine of entry.description.split('\n')) {
          if (descLine.trim()) lines.push(`- ${descLine.trim()}`)
        }
      }
      lines.push('')
    }
  }

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
