import { ResumeData, TemplateSettings } from '../types/resume'

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

  // 1. Fixed Education
  if (education && education.length > 0) {
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

  // 2. Dynamic Sections (Work, ADAS, Projects, etc.)
  sections.forEach(sec => {
    if (sec.entries && sec.entries.length > 0) {
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

  // 3. Fixed Skills
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

function escapeTypstContent(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/#/g, '\\#').replace(/\*/g, '\\*').replace(/_/g, '\\_').replace(/</g, '\\<').replace(/>/g, '\\>')
}

function escapeTypstString(text: string): string {
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
