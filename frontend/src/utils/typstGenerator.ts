import { ResumeData, TemplateSettings } from '../types/resume'

/**
 * Generate Typst source code from resume data
 * Ported from backend/src/services/typst.service.ts
 */
export function generateResumeTypst(data: ResumeData, settings: TemplateSettings): string {
  const {
    personal,
    education,
    experience,
    skills,
    projects = [],
    languages = [],
    summary,
    honors = [],
    certificates = [],
    publications = []
  } = data

  const accentColor = getAccentColor(settings)
  const paperSize = getPaperSize(settings)

  // Build author info
  const authorEntries: string[] = []
  authorEntries.push(`    firstname: "${escapeTypstString(personal.firstName)}",`)
  authorEntries.push(`    lastname: "${escapeTypstString(personal.lastName)}",`)

  // modern-cv requires positions to be an array, even if empty
  if (personal.position) {
    authorEntries.push(`    positions: ("${escapeTypstString(personal.position)}",),`)
  } else {
    authorEntries.push(`    positions: (),`)
  }
  if (personal.email) {
    authorEntries.push(`    email: "${escapeTypstString(personal.email)}",`)
  }
  if (personal.mobile) {
    authorEntries.push(`    phone: "${escapeTypstString(personal.mobile)}",`)
  }
  if (personal.address) {
    authorEntries.push(`    address: "${escapeTypstString(personal.address)}",`)
  }
  if (personal.homePage) {
    authorEntries.push(`    homepage: "${escapeTypstString(personal.homePage)}",`)
  }
  if (personal.linkedin) {
    authorEntries.push(`    linkedin: "${escapeTypstString(personal.linkedin)}",`)
  }
  if (personal.gitlab) {
    authorEntries.push(`    gitlab: "${escapeTypstString(personal.gitlab)}",`)
  }
  if (personal.twitter) {
    authorEntries.push(`    twitter: "${escapeTypstString(personal.twitter)}",`)
  }

  const authorBlock = authorEntries.join('\n')

  // Build profile picture config
  const profilePictureLine = personal.photo
    ? `  profile-picture: image("${escapeTypstString(personal.photo.url)}"),`
    : '  profile-picture: none,'

  // Build content sections
  const summarySection = summary ? buildSummarySection(summary) : ''
  const experienceSection = experience.length > 0 ? buildExperienceSection(experience) : ''
  const educationSection = education.length > 0 ? buildEducationSection(education) : ''
  const skillsSection = skills.length > 0 ? buildSkillsSection(skills) : ''
  const projectsSection = projects.length > 0 ? buildProjectsSection(projects) : ''
  const languagesSection = languages.length > 0 ? buildLanguagesSection(languages) : ''
  const honorsSection = honors.length > 0 ? buildHonorsSection(honors) : ''
  const certificatesSection = certificates.length > 0 ? buildCertificatesSection(certificates) : ''
  const publicationsSection = publications.length > 0 ? buildPublicationsSection(publications) : ''

  // Build quote block if present
  const quoteBlock = personal.quote
    ? `\n#align(center)[#text(style: "italic", size: 10pt)["${escapeTypstString(personal.quote.replace(/^["']|["']$/g, '').trim())}"]]\n`
    : ''

  return `#import "@preview/modern-cv:0.10.0": *

#show: resume.with(
  author: (
${authorBlock}
  ),
${profilePictureLine}
  date: datetime.today().display(),
  paper-size: "${paperSize}",
  accent-color: "${accentColor}",
  colored-headers: ${settings.sectionColorHighlight},
  language: "en",
  font: ("Source Sans 3", "Source Sans Pro", "LXGW Neo XiHei"),
)
${quoteBlock}
${summarySection}
${experienceSection}
${educationSection}
${skillsSection}
${projectsSection}
${languagesSection}
${honorsSection}
${certificatesSection}
${publicationsSection}
`
}

function escapeTypstContent(text: string | undefined | null): string {
  if (!text) return ''
  return text
    .replace(/\\/g, '\\\\')
    .replace(/#/g, '\\#')
    .replace(/\*/g, '\\*')
    .replace(/_/g, '\\_')
    .replace(/\$/g, '\\$')
    .replace(/@/g, '\\@')
}

function escapeTypstString(text: string | undefined | null): string {
  if (!text) return ''
  return text
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
}

function getAccentColor(settings: TemplateSettings): string {
  if (settings.customColor) {
    return settings.customColor
  }

  const colorMap: Record<string, string> = {
    'awesome-emerald': '#00A388',
    'awesome-skyblue': '#0395DE',
    'awesome-red': '#DC3522',
    'awesome-pink': '#EF4089',
    'awesome-orange': '#FF6138',
    'awesome-nephritis': '#27AE60',
    'awesome-concrete': '#95A5A6',
    'awesome-darknight': '#131A28',
  }

  return colorMap[settings.colorScheme] || '#DC3522'
}

function getPaperSize(settings: TemplateSettings): string {
  return settings.paperSize === 'letterpaper' ? 'us-letter' : 'a4'
}

function buildSummarySection(summary: string): string {
  return `= Summary

#resume-item[
  ${escapeTypstContent(summary)}
]
`
}

function buildExperienceSection(experiences: ResumeData['experience']): string {
  let section = `= Experience\n\n`

  experiences.forEach(exp => {
    const endDate = exp.endDate ? exp.endDate : 'Present'
    const dateStr = `${exp.startDate} -- ${endDate}`

    section += `#resume-entry(
  title: "${escapeTypstString(exp.company)}",
  location: "${escapeTypstString(exp.location || '')}",
  date: "${escapeTypstString(dateStr)}",
  description: "${escapeTypstString(exp.position)}",
)\n`

    const items: string[] = []
    if (exp.description) {
      items.push(escapeTypstContent(exp.description))
    }
    if (exp.highlights && exp.highlights.length > 0) {
      exp.highlights.forEach(h => items.push(escapeTypstContent(h)))
    }

    if (items.length > 0) {
      section += `#resume-item[\n`
      items.forEach(item => {
        section += `  - ${item}\n`
      })
      section += `]\n\n`
    }
  })

  return section
}

function buildEducationSection(educations: ResumeData['education']): string {
  let section = `= Education\n\n`

  educations.forEach(edu => {
    const endDate = edu.endDate ? edu.endDate : 'Present'
    const dateStr = `${edu.startDate} -- ${endDate}`
    const degreeStr = edu.field ? `${edu.degree} in ${edu.field}` : edu.degree
    const descriptionStr = edu.gpa ? `${degreeStr} (GPA: ${edu.gpa})` : degreeStr

    section += `#resume-entry(
  title: "${escapeTypstString(edu.school)}",
  location: "${escapeTypstString(edu.location || '')}",
  date: "${escapeTypstString(dateStr)}",
  description: "${escapeTypstString(descriptionStr)}",
)\n`

    if (edu.description) {
      section += `#resume-item[\n  - ${escapeTypstContent(edu.description)}\n]\n\n`
    }
  })

  return section
}

function buildSkillsSection(skills: ResumeData['skills']): string {
  const byCategory: Record<string, ResumeData['skills']> = {}
  skills.forEach(skill => {
    if (!byCategory[skill.category]) {
      byCategory[skill.category] = []
    }
    byCategory[skill.category].push(skill)
  })

  let section = `= Skills\n\n`

  Object.entries(byCategory).forEach(([category, categorySkills]) => {
    const items = categorySkills.map(s => `"${escapeTypstString(s.name)}"`).join(', ')
    const itemsArray = categorySkills.length === 1 ? `(${items},)` : `(${items})`
    section += `#resume-skill-item("${escapeTypstString(category)}", ${itemsArray})\n`
  })

  section += `\n`
  return section
}

function buildProjectsSection(projects: ResumeData['projects']): string {
  let section = `= Projects\n\n`

  const projectList = projects || []
  projectList.forEach((project) => {
    const titleLink = project.url
      ? `  title-link: "${escapeTypstString(project.url)}",\n`
      : ''

    section += `#resume-entry(
  title: "${escapeTypstString(project.name)}",
${titleLink}  location: "",
  date: "",
  description: "Project",
)\n`

    const items: string[] = []
    if (project.description) {
      items.push(escapeTypstContent(project.description))
    }
    if (project.technologies && project.technologies.length > 0) {
      const techStr = project.technologies.map((t: string) => escapeTypstString(t)).join(', ')
      items.push(`*Technologies:* ${escapeTypstContent(techStr)}`)
    }

    if (items.length > 0) {
      section += `#resume-item[\n`
      items.forEach(item => {
        section += `  - ${item}\n`
      })
      section += `]\n\n`
    }
  })

  return section
}

function buildLanguagesSection(languages: ResumeData['languages']): string {
  let section = `= Languages\n\n`

  const langList = languages || []
  langList.forEach((lang) => {
    section += `#resume-skill-item("${escapeTypstString(lang.name)}", ("${escapeTypstString(lang.level)}",))\n`
  })

  section += `\n`
  return section
}

function buildHonorsSection(honors: string[]): string {
  let section = `= Honors & Awards\n\n`

  honors.forEach(honor => {
    section += `#resume-entry(
  title: "${escapeTypstString(honor)}",
  location: "",
  date: "",
  description: "",
)\n`
  })

  return section
}

function buildCertificatesSection(certificates: string[]): string {
  let section = `= Certifications\n\n`

  certificates.forEach(cert => {
    section += `#resume-certification("${escapeTypstString(cert)}", "")\n`
  })

  section += `\n`
  return section
}

function buildPublicationsSection(publications: string[]): string {
  let section = `= Publications\n\n`

  publications.forEach(pub => {
    section += `#resume-entry(
  title: "${escapeTypstString(pub)}",
  location: "",
  date: "",
  description: "",
)\n`
  })

  return section
}
