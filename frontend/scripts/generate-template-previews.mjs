import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const outputDir = join(root, 'public', 'template-previews')
const workDir = join(root, '.tmp-template-previews')

rmSync(workDir, { recursive: true, force: true })
mkdirSync(workDir, { recursive: true })
mkdirSync(outputDir, { recursive: true })

// ── YAML frontmatter parser ──────────────────────────────────────
function parseFrontmatter(filePath) {
  const md = readFileSync(filePath, 'utf8')
  const match = md.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}
  const data = {}
  for (const line of match[1].split('\n')) {
    const m = line.match(/^(\w[\w-]*):\s*(.*)$/)
    if (m) {
      let value = m[2].trim()
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      data[m[1]] = value
    }
  }
  return data
}

// ── Typst string escaping helpers ────────────────────────────────
function escStr(value) {
  return String(value ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')
}

function escContent(value) {
  return String(value ?? '').replace(/\\/g, '\\\\').replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/#/g, '\\#').replace(/@/g, '\\@')
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' })
  if (result.status !== 0) {
    throw new Error(`${command} exited with status ${result.status ?? 1}`)
  }
}

// ── Template definitions ─────────────────────────────────────────
const templates = [
  { slug: 'classic', file: 'awesome-cv-classic.typ', accent: '#DC3522', markdown: 'sample-resume.md' },
  { slug: 'modern', file: 'awesome-cv-modern.typ', accent: '#DC3522', markdown: 'sample-resume.md' },
  { slug: 'art', file: 'awesome-cv-art.typ', accent: '#FF6138', markdown: 'sample-resume.md' },
  { slug: 'rirekisho', markdown: 'sample-rirekisho.md' },
  { slug: 'shokumukeirekisho', markdown: 'sample-shokumukeirekisho.md' },
]

// ── Build Typst source for awesome-cv templates ──────────────────
function buildAwesomeCvTypst(template, personal) {
  const sections = parseAwesomeCvSections(template)

  return `#import "../public/templates/awesome-cv/${template.file}": *

#show: resume.with(
  author: (
    firstname: "${escStr(personal.firstName)}",
    lastname: "${escStr(personal.lastName)}",
    positions: ("${escStr(personal.position)}",),
    email: "${escStr(personal.email)}",
    phone: "${escStr(personal.mobile)}",
    address: "${escStr(personal.address)}",
    homepage: "${escStr(personal.homepage)}",
  ),
  profile-picture: none,
  date: datetime.today().display(),
  paper-size: "a4",
  accent-color: "${template.accent}",
  colored-headers: true,
  language: "en",
  font: ("Noto Sans CJK SC", "Noto Sans CJK JP", "Source Sans 3"),
)

${sections}
`
}

function parseAwesomeCvSections(template) {
  const md = readFileSync(join(root, 'src', 'data', 'sample-resume.md'), 'utf8')
  const body = md.replace(/^---[\s\S]*?---\n*/, '')
  const lines = body.split('\n')

  const sections = []
  let currentSection = null
  let currentEntry = null

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)/)
    const h3 = line.match(/^###\s+(.+)/)
    const bold = line.match(/^\*\*(.+)\*\*\s*\|\s*(.+?)\s*-\s*(.+)/)
    const bullet = line.match(/^-\s+(.+)/)

    if (h2) {
      if (currentEntry && currentSection) {
        currentSection.entries.push(currentEntry)
        currentEntry = null
      }
      if (currentSection) sections.push(currentSection)
      currentSection = { title: h2[1].trim(), entries: [] }
    } else if (h3 && currentSection) {
      if (currentEntry) currentSection.entries.push(currentEntry)
      currentEntry = { title: h3[1].trim(), subtitle: '', startDate: '', endDate: '', description: '' }
    } else if (bold && currentEntry) {
      currentEntry.subtitle = bold[1].trim()
      currentEntry.startDate = bold[2].trim()
      currentEntry.endDate = bold[3].trim()
    } else if (bullet && currentEntry) {
      const desc = bullet[1].trim()
      currentEntry.description += (currentEntry.description ? '\n' : '') + desc
    }
  }
  if (currentEntry && currentSection) currentSection.entries.push(currentEntry)
  if (currentSection) sections.push(currentSection)

  // Build Typst output
  const isArt = template.slug === 'art'
  let output = ''

  for (const section of sections) {
    if (section.title === 'Skills') continue

    if (isArt) {
      const title = section.title
      const prefix = title.slice(0, 3)
      const rest = title.slice(3)
      output += `= #text(fill: rgb("${template.accent}"))[${escContent(prefix)}]#text(fill: black)[${escContent(rest)}]\n\n`
    } else {
      output += `= ${escContent(section.title)}\n\n`
    }

    for (const entry of section.entries) {
      output += `#resume-entry(
  title: "${escStr(entry.title)}",
  location: "",
  date: "${escStr(entry.startDate)} -- ${escStr(entry.endDate)}",
  description: "${escStr(entry.subtitle)}",
)
#resume-item[\n`
      const descLines = entry.description.split('\n').filter(Boolean)
      for (const dl of descLines) {
        output += `  - ${escContent(dl)}\n`
      }
      output += `]\n\n`
    }
  }

  // Skills section
  const skillsByCategory = parseSkills(md)
  output += isArt
    ? `= #text(fill: rgb("${template.accent}"))[Ski]#text(fill: black)[lls]\n\n`
    : '= Skills\n\n'
  for (const [cat, names] of skillsByCategory) {
    output += `#resume-skill-item("${escStr(cat)}", (${names.map(n => `"${escStr(n)}"`).join(', ')}))\n`
  }

  return output
}

function parseSkills(md) {
  const body = md.replace(/^---[\s\S]*?---\n*/, '')
  const skillsMatch = body.match(/## Skills\n\n([\s\S]*?)$/)
  if (!skillsMatch) return new Map()
  const skillsText = skillsMatch[1]
  const byCategory = new Map()
  for (const line of skillsText.split('\n')) {
    const m = line.match(/^-\s+\*\*(.+)\*\*:\s*(.+)/)
    if (m) {
      const names = m[2].split(',').map(n => n.trim()).filter(Boolean)
      byCategory.set(m[1], names)
    }
  }
  return byCategory
}

// ── Build Typst source for rirekisho ─────────────────────────────
function buildRirekishoTypst(personal) {
  const md = readFileSync(join(root, 'src', 'data', 'sample-rirekisho.md'), 'utf8')
  const body = md.replace(/^---[\s\S]*?---\n*/, '')
  const lines = body.split('\n')

  // Parse sections
  const sections = []
  let currentSection = null
  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)/)
    if (h2) {
      if (currentSection) sections.push(currentSection)
      currentSection = { title: h2[1].trim(), lines: [] }
    } else if (currentSection) {
      currentSection.lines.push(line)
    }
  }
  if (currentSection) sections.push(currentSection)

  let typst = `#import "../public/templates/rirekisho/rirekisho.typ": *

#show: resume.with(
  author: (
    firstname: "${escStr(personal.firstName)}",
    lastname: "${escStr(personal.lastName)}",
`

  if (personal.furiganaFirstName) typst += `    furigana-first: "${escStr(personal.furiganaFirstName)}",\n`
  if (personal.furiganaLastName) typst += `    furigana-last: "${escStr(personal.furiganaLastName)}",\n`
  if (personal.birth) typst += `    birth: "${escStr(personal.birth)}",\n`
  if (personal.address) typst += `    address: "${escStr(personal.address)}",\n`
  if (personal.mobile) typst += `    phone: "${escStr(personal.mobile)}",\n`
  typst += `    email: "${escStr(personal.email)}",
  ),
  language: "ja",
  font: ("Noto Sans CJK JP", "Noto Sans CJK SC"),
)

`

  // ── Header table (personal info + photo) ──────────────────────
  typst += `// Header section
#table(
  columns: (2cm, 1fr, 4cm),
  stroke: 0.5pt + black,
  rows: (auto, auto, auto, auto),
  [#align(center)[*氏名*]],
  [#align(left)[
    #grid(
      columns: (auto, auto),
      row-gutter: 2pt,
      text(size: 9pt, weight: "regular")[${escContent(personal.furiganaLastName || '')}],
      text(size: 9pt, weight: "regular")[${escContent(personal.furiganaFirstName || '')}],
      text(size: 14pt, weight: "bold")[${escContent(personal.lastName)}],
      text(size: 14pt, weight: "bold")[${escContent(personal.firstName)}],
    )
  ]],
  table.cell(rowspan: 4)[#align(center + horizon)[
    #block(height: 4.5cm, stroke: 0.5pt + black, width: 100%, inset: 4pt)[
      #text(fill: luma(160), size: 8pt)[写真]
      #linebreak()
      #text(size: 7pt)[4cm×3cm]
    ]
  ]],
  [#align(center)[*生年月日*]],
  [#text(size: 9pt)[${escContent(personal.birth || '')}]],
  [#align(center)[*現住所*]],
  [
    #text(size: 9pt)[
      ${escContent(personal.address || '（現住所）')}
      #linebreak()
      TEL: ${escContent(personal.mobile || '')}
      #linebreak()
      Email: ${escContent(personal.email)}
    ]
  ],
  table.cell(colspan: 2)[#text(size: 8pt)[連絡先に○をつけてください（　　現住所　　・　　連絡先　　）]],
)
`

  // ── Education & Work History ──────────────────────────────────
  const eduWorkSection = sections.find(s => /学歴|職歴/.test(s.title))
  typst += `// Education & Work History
#table(
  columns: (2.5cm, 1fr),
  stroke: 0.5pt + black,
  [#align(center)[*年　月*]], [#align(center)[*学歴・職歴*]],
`
  if (eduWorkSection) {
    const entries = parseRirekiEntries(eduWorkSection.lines)
    for (const e of entries) {
      typst += `  [${escContent(e.date || '')}], [${escContent(e.content)}],\n`
    }
  }
  typst += `)\n\n`

  // ── Certifications ────────────────────────────────────────────
  const certSection = sections.find(s => /免許|資格/.test(s.title))
  typst += `// Certifications
#table(
  columns: (2.5cm, 1fr),
  stroke: 0.5pt + black,
  [#align(center)[*年　月*]], [#align(center)[*免許・資格*]],
`
  if (certSection) {
    const entries = parseCertEntries(certSection.lines)
    for (const e of entries) {
      typst += `  [], [${escContent(e.content)}],\n`
    }
  }
  typst += `)\n\n`

  // ── Motivation (志望の動機) ────────────────────────────────────
  const motivationSection = sections.find(s => /志望|自己PR|趣味/.test(s.title))
  const motivationText = motivationSection
    ? motivationSection.lines.filter(l => l.trim()).join('\n').replace(/^- /gm, '').trim()
    : ''

  typst += `// Motivation
#table(
  columns: (1fr),
  stroke: 0.5pt + black,
  table.cell(colspan: 1)[#align(center)[*志望の動機、自己PR、趣味など*]],
  [#text(size: 9pt)[${escContent(motivationText)}]],
)
`
  // ── Requests (本人希望記入欄) ──────────────────────────────────
  const requestsSection = sections.find(s => /本人希望/.test(s.title))
  const requestsText = requestsSection
    ? requestsSection.lines.filter(l => l.trim()).join('\n').replace(/^- /gm, '').trim()
    : ''

  typst += `// Requests
#table(
  columns: (1fr),
  stroke: 0.5pt + black,
  table.cell(colspan: 1)[#align(center)[*本人希望記入欄*]],
  [#text(size: 9pt)[${escContent(requestsText)}]],
)
`
  return typst
}

function parseRirekiEntries(lines) {
  const entries = []
  let current = null
  for (const line of lines) {
    const h3 = line.match(/^###\s+(.+)/)
    const bold = line.match(/^\*\*(.+)\*\*\s*\|\s*(.+?)\s*-\s*(.+)/)
    if (h3) {
      if (current) entries.push(current)
      current = { date: '', content: h3[1].trim() }
    } else if (bold && current) {
      current.content += ` ${bold[1]}`
      current.date = bold[2] || ''
    }
  }
  if (current) entries.push(current)
  return entries
}

// Parse certification entries: "- **Title**: Description"
function parseCertEntries(lines) {
  const entries = []
  for (const line of lines) {
    const m = line.match(/^-\s+\*\*(.+)\*\*:\s*(.*)/)
    if (m) {
      entries.push({ date: '', content: `${m[1].trim()}: ${m[2].trim()}` })
    }
  }
  return entries
}

// ── Build Typst source for shokumukeirekisho ────────────────────
function buildShokumuKeirekishoTypst(personal) {
  const md = readFileSync(join(root, 'src', 'data', 'sample-shokumukeirekisho.md'), 'utf8')
  const body = md.replace(/^---[\s\S]*?---\n*/, '')
  const lines = body.split('\n')

  // Parse work entries under 職務経歴
  const workEntries = []
  let current = null
  let inWork = false
  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)/)
    const h3 = line.match(/^###\s+(.+)/)
    const bold = line.match(/^\*\*(.+)\*\*\s*\|\s*(.+?)\s*-\s*(.+)/)
    const bullet = line.match(/^-\s+(.+)/)

    if (h2 && h2[1].trim() === 'Skills') break
    if (h2 && /職務経歴/.test(h2[1])) { inWork = true; continue }
    if (!inWork) continue

    if (h3) {
      if (current) workEntries.push(current)
      current = { title: h3[1].trim(), subtitle: '', startDate: '', endDate: '', bullets: [] }
    } else if (bold && current) {
      current.subtitle = bold[1].trim()
      current.startDate = bold[2].trim()
      current.endDate = bold[3].trim()
    } else if (bullet && current) {
      const text = bullet[1].trim()
      if (!/使用技術[:：]/.test(text)) {
        current.bullets.push(text)
      }
    }
  }
  if (current) workEntries.push(current)

  // Parse skills
  const skillsByCategory = new Map()
  const skillsMatch = body.match(/## Skills\n\n([\s\S]*?)$/)
  if (skillsMatch) {
    for (const line of skillsMatch[1].split('\n')) {
      const m = line.match(/^-\s+\*\*(.+)\*\*:\s*(.+)/)
      if (m) {
        skillsByCategory.set(m[1], m[2].split(',').map(n => n.trim()).filter(Boolean))
      }
    }
  }

  let typst = `#import "../public/templates/shokumukeirekisho/shokumukeirekisho.typ": *

#show: resume.with(
  author: (
    firstname: "${escStr(personal.firstName)}",
    lastname: "${escStr(personal.lastName)}",
    email: "${escStr(personal.email)}",
    phone: "${escStr(personal.mobile)}",
  ),
  language: "ja",
  font: ("Noto Sans CJK JP", "Noto Sans CJK SC"),
)

`

  // ── Basic Info ──
  typst += `// ── Basic Info ──
#section-title[基本情報]
#grid(
  columns: (auto, 1fr),
  gutter: 4pt,
  [#text(size: 9pt, weight: "bold")[氏名]], [#text(size: 9pt)[${escContent(personal.lastName + ' ' + personal.firstName)}]],
  [#text(size: 9pt, weight: "bold")[連絡先]], [#text(size: 9pt)[TEL: ${escContent(personal.mobile || '')}  Email: ${escContent(personal.email)}]],
)
`

  // ── Work Experience ──
  if (workEntries.length > 0) {
    typst += `
// ── Work Experience ──
#section-title[職務経歴]
`
    for (const entry of workEntries) {
      const period = `${entry.startDate} ～ ${entry.endDate || '現在'}`
      typst += `#exp-header("${escStr(entry.title)}", "${escStr(period)}")\n`
      if (entry.subtitle) {
        typst += `#exp-row("役割", "${escStr(entry.subtitle)}")\n`
      }
      if (entry.bullets.length > 0) {
        typst += `#block-separator\n#bullet-items(\n`
        for (const b of entry.bullets) {
          typst += `  [${escContent(b)}],\n`
        }
        typst += `)\n`
      }
      typst += '\n'
    }
  }

  // ── Skills ──
  if (skillsByCategory.size > 0) {
    typst += `// ── Skills ──
#section-title[活かせるスキル・知識]
`
    for (const [cat, names] of skillsByCategory) {
      typst += `#skill-category("${escStr(cat)}", "${escStr(names.join('、'))}")\n`
    }
    typst += '\n'
  }

  return typst
}

// ── Main ─────────────────────────────────────────────────────────
try {
  for (const template of templates) {
    console.log(`\n--- Generating ${template.slug} ---`)
    const outputWebp = join(outputDir, `${template.slug}.webp`)
    const typPath = join(workDir, `${template.slug}.typ`)
    const pngPath = join(workDir, `${template.slug}.png`)

    let typstSource
    if (template.slug === 'rirekisho') {
      const personal = parseFrontmatter(join(root, 'src', 'data', template.markdown))
      typstSource = buildRirekishoTypst(personal)
    } else if (template.slug === 'shokumukeirekisho') {
      const personal = parseFrontmatter(join(root, 'src', 'data', template.markdown))
      typstSource = buildShokumuKeirekishoTypst(personal)
    } else {
      const personal = parseFrontmatter(join(root, 'src', 'data', template.markdown))
      typstSource = buildAwesomeCvTypst(template, personal)
    }

    writeFileSync(typPath, typstSource, 'utf8')
    run('typst', ['compile', typPath, pngPath, '--root', root])
    run('magick', [pngPath, '-resize', '900x1125^', '-gravity', 'north', '-extent', '900x1125', '-quality', '88', outputWebp])
    console.log(`  -> ${outputWebp}`)
  }

  console.log('\nAll template previews generated!')
} catch (e) {
  console.error(e.message)
  // Keep temp files for debugging
} finally {
  // rmSync(workDir, { recursive: true, force: true })
}
