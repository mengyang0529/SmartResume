import { ResumeData, TemplateSettings, Project, Language, Experience } from '../types/resume'

export class TypstService {
  /**
   * Escape special Typst characters in content mode
   */
  private escapeTypstContent(text: string | undefined | null): string {
    if (!text) return ''
    return text
      .replace(/\\/g, '\\\\')
      .replace(/#/g, '\\#')
      .replace(/\*/g, '\\*')
      .replace(/_/g, '\\_')
      .replace(/\$/g, '\\$')
      .replace(/@/g, '\\@')
      .replace(/</g, '\\<')
      .replace(/>/g, '\\>')
  }

  /**
   * Escape special Typst characters in string mode
   */
  private escapeTypstString(text: string | undefined | null): string {
    if (!text) return ''
    return text
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
  }

  /**
   * Map color scheme name to hex color
   */
  private getAccentColor(settings: TemplateSettings): string {
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

  /**
   * Map paper size
   */
  private getPaperSize(settings: TemplateSettings): string {
    return settings.paperSize === 'letterpaper' ? 'us-letter' : 'a4'
  }

  /**
   * Generate Typst source code from resume data
   */
  generateResumeTypst(data: ResumeData, settings: TemplateSettings): string {
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

    const accentColor = this.getAccentColor(settings)
    const paperSize = this.getPaperSize(settings)

    // Build author info
    const authorEntries: string[] = []
    authorEntries.push(`    firstname: "${this.escapeTypstString(personal.firstName)}",`)
    authorEntries.push(`    lastname: "${this.escapeTypstString(personal.lastName)}",`)
    
    // modern-cv requires positions to be an array, even if empty
    if (personal.position) {
      authorEntries.push(`    positions: ("${this.escapeTypstString(personal.position)}",),`)
    } else {
      authorEntries.push(`    positions: (),`)
    }
    if (personal.email) {
      authorEntries.push(`    email: "${this.escapeTypstString(personal.email)}",`)
    }
    if (personal.mobile) {
      authorEntries.push(`    phone: "${this.escapeTypstString(personal.mobile)}",`)
    }
    if (personal.address) {
      authorEntries.push(`    address: "${this.escapeTypstString(personal.address)}",`)
    }
    if (personal.homePage) {
      authorEntries.push(`    homepage: "${this.escapeTypstString(personal.homePage)}",`)
    }
    if (personal.linkedin) {
      authorEntries.push(`    linkedin: "${this.escapeTypstString(personal.linkedin)}",`)
    }
    if (personal.gitlab) {
      authorEntries.push(`    gitlab: "${this.escapeTypstString(personal.gitlab)}",`)
    }
    if (personal.twitter) {
      authorEntries.push(`    twitter: "${this.escapeTypstString(personal.twitter)}",`)
    }

    const authorBlock = authorEntries.join('\n')

    // Build profile picture config
    const profilePictureLine = personal.photo
      ? `  profile-picture: image("${this.escapeTypstString(personal.photo.url)}"),`
      : '  profile-picture: none,'

    // Build content sections
    const titles = data.sectionTitles || {}
    const summarySection = summary ? this.buildSummarySection(summary, titles.summary || 'Summary') : ''
    const educationSection = education.length > 0 ? this.buildEducationSection(education, titles.education || 'Education') : ''
    const experienceSection = experience && experience.length > 0 ? this.buildExperienceSection(experience, titles.experience || 'Work Experience') : ''
    const skillsSection = skills.length > 0 ? this.buildSkillsSection(skills, titles.skills || 'Skills') : ''
    
    let projectsSection = ''
    if (data.projects && data.projects.length > 0) {
      for (const section of data.projects) {
        projectsSection += this.buildProjectsSection(section.entries, section.title)
      }
    }
    
    const languagesSection = languages && languages.length > 0 ? this.buildLanguagesSection(languages) : ''
    const honorsSection = honors && honors.length > 0 ? this.buildHonorsSection(honors) : ''
    const certificatesSection = certificates && certificates.length > 0 ? this.buildCertificatesSection(certificates) : ''
    const publicationsSection = publications && publications.length > 0 ? this.buildPublicationsSection(publications) : ''

    // Build quote block if present
    const quoteBlock = personal.quote
      ? `\n#align(center)[#text(style: "italic", size: 10pt)["${this.escapeTypstString(personal.quote.replace(/^["']|["']$/g, '').trim())}"]]\n`
      : ''

    const typst = `#import "awesome-cv.typ": *

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
${educationSection}
${experienceSection}
${skillsSection}
${projectsSection}
${languagesSection}
${honorsSection}
${certificatesSection}
${publicationsSection}
`
    return typst
  }

  private buildSummarySection(summary: string, title: string): string {
    return `= ${title}

#resume-item[
  ${this.escapeTypstContent(summary)}
]
`
  }

  private buildExperienceSection(experiences: Experience[] | undefined, title: string): string {
    let section = `= ${title}\n\n`

    experiences?.forEach((exp: Experience) => {
      const endDate = exp.endDate ? exp.endDate : 'Present'
      const dateStr = `${exp.startDate} -- ${endDate}`

      section += `#resume-entry(
  title: "${this.escapeTypstString(exp.company)}",
  location: "${this.escapeTypstString(exp.location || '')}",
  date: "${this.escapeTypstString(dateStr)}",
  description: "${this.escapeTypstString(exp.position)}",
)\n`

      const items: string[] = []
      if (exp.description) {
        items.push(this.escapeTypstContent(exp.description))
      }
      if (exp.highlights && exp.highlights.length > 0) {
        exp.highlights.forEach(h => items.push(this.escapeTypstContent(h)))
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

  private buildEducationSection(educations: ResumeData['education'], title: string = 'Education'): string {
    let section = `= ${title}\n\n`

    educations.forEach(edu => {
      const endDate = edu.endDate ? edu.endDate : 'Present'
      const dateStr = `${edu.startDate} -- ${endDate}`
      const degreeStr = edu.field ? `${edu.degree} in ${edu.field}` : edu.degree
      const descriptionStr = edu.gpa ? `${degreeStr} (GPA: ${edu.gpa})` : degreeStr

      section += `#resume-entry(
  title: "${this.escapeTypstString(edu.school)}",
  location: "${this.escapeTypstString(edu.location || '')}",
  date: "${this.escapeTypstString(dateStr)}",
  description: "${this.escapeTypstString(descriptionStr)}",
)\n`

      if (edu.description) {
        section += `#resume-item[\n  - ${this.escapeTypstContent(edu.description)}\n]\n\n`
      }
    })

    return section
  }

  private buildSkillsSection(skills: ResumeData['skills'], title: string = 'Skills'): string {
    // Group by category
    const byCategory: Record<string, ResumeData['skills']> = {}
    skills.forEach(skill => {
      if (!byCategory[skill.category]) {
        byCategory[skill.category] = []
      }
      byCategory[skill.category].push(skill)
    })

    let section = `= ${title}\n\n`

    Object.entries(byCategory).forEach(([category, categorySkills]) => {
      const items = categorySkills.map(s => `"${this.escapeTypstString(s.name)}"`).join(', ')
      const itemsArray = categorySkills.length === 1 ? `(${items},)` : `(${items})`
      section += `#resume-skill-item("${this.escapeTypstString(category)}", ${itemsArray})\n`
    })

    section += `\n`
    return section
  }

  private buildProjectsSection(entries: Project[], title: string = 'Projects'): string {
    let section = `= ${title}\n\n`

    const projectList = entries || []
    projectList.forEach((project: Project) => {
      const titleLink = project.url
        ? `  title-link: "${this.escapeTypstString(project.url)}",\n`
        : ''

      section += `#resume-entry(
  title: "${this.escapeTypstString(project.name)}",
${titleLink}  location: "",
  date: "",
  description: "Project",
)\n`

      const items: string[] = []
      if (project.description) {
        items.push(this.escapeTypstContent(project.description))
      }
      if (project.technologies && project.technologies.length > 0) {
        const techStr = project.technologies.map(t => this.escapeTypstString(t)).join(', ')
        items.push(`*Technologies:* ${this.escapeTypstContent(techStr)}`)
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

  private buildLanguagesSection(languages: Language[] | undefined): string {
    let section = `= Languages\n\n`

    const langList = languages || []
    langList.forEach((lang: Language) => {
      section += `#resume-skill-item("${this.escapeTypstString(lang.name)}", ("${this.escapeTypstString(lang.level)}",))\n`
    })

    section += `\n`
    return section
  }

  private buildHonorsSection(honors: string[] | undefined): string {
    let section = `= Honors & Awards\n\n`

    honors?.forEach((honor: string) => {
      section += `#resume-entry(
  title: "${this.escapeTypstString(honor)}",
  location: "",
  date: "",
  description: "",
)\n`
    })

    return section
  }

  private buildCertificatesSection(certificates: string[] | undefined): string {
    let section = `= Certifications\n\n`

    certificates?.forEach(cert => {
      section += `#resume-certification("${this.escapeTypstString(cert)}", "")\n`
    })

    section += `\n`
    return section
  }

  private buildPublicationsSection(publications: string[] | undefined): string {
    let section = `= Publications\n\n`

    publications?.forEach(pub => {
      section += `#resume-entry(
  title: "${this.escapeTypstString(pub)}",
  location: "",
  date: "",
  description: "",
)\n`
    })

    return section
  }
}
