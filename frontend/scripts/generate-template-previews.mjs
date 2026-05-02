import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const outputDir = join(root, 'public', 'template-previews')
const workDir = join(root, '.tmp-template-previews')

const sample = JSON.parse(readFileSync(join(root, 'src', 'data', 'sampleResume.json'), 'utf8'))

const templates = [
  { slug: 'classic', file: 'awesome-cv-classic.typ', accent: '#DC3522' },
  { slug: 'modern', file: 'awesome-cv-modern.typ', accent: '#DC3522' },
  { slug: 'art', file: 'awesome-cv-art.typ', accent: '#FF6138' },
]

rmSync(workDir, { recursive: true, force: true })
mkdirSync(workDir, { recursive: true })

try {
  for (const template of templates) {
    const typPath = join(workDir, `${template.slug}.typ`)
    const pngPath = join(workDir, `${template.slug}.png`)
    const webpPath = join(outputDir, `${template.slug}.webp`)

    writeFileSync(typPath, buildTypst(template), 'utf8')
    run('typst', ['compile', typPath, pngPath, '--root', root])
    run('magick', [pngPath, '-resize', '900x1125^', '-gravity', 'north', '-extent', '900x1125', '-quality', '88', webpPath])
  }
} finally {
  rmSync(workDir, { recursive: true, force: true })
}

function buildTypst(template) {
  const p = sample.personal
  const sections = sample.sections.map(section => {
    const title = template.slug === 'art'
      ? `= #text(fill: rgb("${template.accent}"))[${escapeTypstContent(section.title.slice(0, 3))}]#text(fill: black)[${escapeTypstContent(section.title.slice(3))}]`
      : `= ${escapeTypstContent(section.title)}`

    const entries = section.entries.map(entry => {
      const description = String(entry.description ?? '').split('\n').filter(Boolean)
      return `#resume-entry(
  title: "${escapeTypstString(entry.title)}",
  location: "",
  date: "${escapeTypstString(entry.startDate)} -- ${escapeTypstString(entry.endDate)}",
  description: "${escapeTypstString(entry.subtitle)}",
)
#resume-item[
${description.map(line => `  - ${escapeTypstContent(line)}`).join('\n')}
]`
    }).join('\n\n')

    return `${title}\n\n${entries}`
  }).join('\n\n')

  const skillsByCategory = new Map()
  for (const skill of sample.skills) {
    const names = String(skill.name ?? '').split(',').map(name => name.trim()).filter(Boolean)
    skillsByCategory.set(skill.category, [...(skillsByCategory.get(skill.category) ?? []), ...names])
  }

  const skills = Array.from(skillsByCategory.entries()).map(([category, names]) => {
    return `#resume-skill-item("${escapeTypstString(category)}", (${names.map(name => `"${escapeTypstString(name)}"`).join(', ')}))`
  }).join('\n')

  return `#import "../public/templates/awesome-cv/${template.file}": *

#show: resume.with(
  author: (
    firstname: "${escapeTypstString(p.firstName)}",
    lastname: "${escapeTypstString(p.lastName)}",
    positions: ("${escapeTypstString(p.position)}",),
    email: "${escapeTypstString(p.email)}",
    phone: "${escapeTypstString(p.mobile)}",
    address: "${escapeTypstString(p.address)}",
    homepage: "${escapeTypstString(p.homepage)}",
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

${template.slug === 'art' ? `= #text(fill: rgb("${template.accent}"))[Ski]#text(fill: black)[lls]` : '= Skills'}

${skills}
`
}

function escapeTypstString(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
}

function escapeTypstContent(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/#/g, '\\#')
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' })
  if (result.status !== 0) {
    throw new Error(`${command} exited with status ${result.status ?? 1}`)
  }
}
