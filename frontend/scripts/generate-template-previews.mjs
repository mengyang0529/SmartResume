import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const outputDir = join(root, 'public', 'template-previews')
const workDir = join(outputDir, '.generated')

const sample = {
  personal: {
    firstName: 'Smart',
    lastName: 'Resume',
    position: 'Senior Interdimensional Systems Architect',
    email: 'smart.resume@kakuti.io',
    mobile: '+99 800-1234-5678',
    address: '404 Nebula Drive, Aether City, Zephyrus Province',
    homepage: 'www.smartresume-vault.fake',
  },
  sections: [
    {
      title: 'Education',
      entries: [
        {
          title: 'Caelum University of Synergy',
          subtitle: 'Ph.D. in Multimodal Logic & Synthetics',
          startDate: 'Sept 2015',
          endDate: 'June 2019',
          description: 'Recipient of the "Mobius Strip" Medal for Theoretical Excellence.',
        },
      ],
    },
    {
      title: 'Professional Experience',
      entries: [
        {
          title: 'kakuti Technologies',
          subtitle: 'Lead Systems Architect',
          startDate: 'March 2021',
          endDate: 'Present',
          description: [
            'Spearheaded the design of the "Eternal Flame" framework, boosting data throughput efficiency by 350%.',
            'Engineered an automated bias-correction protocol that successfully stabilized three major logical fluctuations.',
            'Managed a distributed team of 50 virtual entities, achieving a 100% zero-latency delivery rate across disparate timelines.',
          ],
        },
      ],
    },
  ],
  skills: [
    ['Languages', ['Lumina+', 'VoidScript', 'Neo-Python', 'BinaryFlow']],
    ['Frameworks', ['Ethereal Framework', 'Ghost-V', 'DeepCore 9.0']],
    ['Expertise', ['Quantum State Simulation', 'Neural Weaving', 'Logic Provenance']],
  ],
}

const templates = [
  { slug: 'classic', file: 'awesome-cv-classic.typ', accent: '#DC3522' },
  { slug: 'modern', file: 'awesome-cv-modern.typ', accent: '#DC3522' },
  { slug: 'art', file: 'awesome-cv-art.typ', accent: '#FF6138' },
]

mkdirSync(workDir, { recursive: true })

for (const template of templates) {
  const typPath = join(workDir, `${template.slug}.typ`)
  const pngPath = join(workDir, `${template.slug}.png`)
  const webpPath = join(outputDir, `${template.slug}.webp`)

  writeFileSync(typPath, buildTypst(template), 'utf8')
  run('typst', ['compile', typPath, pngPath, '--root', root])
  run('magick', [pngPath, '-resize', '900x1125^', '-gravity', 'north', '-extent', '900x1125', '-quality', '88', webpPath])
}

rmSync(workDir, { recursive: true, force: true })

function buildTypst(template) {
  const p = sample.personal
  const sections = sample.sections.map(section => {
    const title = template.slug === 'art'
      ? `= #text(fill: rgb("${template.accent}"))[${escapeTypstContent(section.title.slice(0, 3))}]#text(fill: black)[${escapeTypstContent(section.title.slice(3))}]`
      : `= ${escapeTypstContent(section.title)}`

    const entries = section.entries.map(entry => {
      const description = Array.isArray(entry.description) ? entry.description : [entry.description]
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

  const skills = sample.skills.map(([category, names]) => {
    return `#resume-skill-item("${escapeTypstString(category)}", (${names.map(name => `"${escapeTypstString(name)}"`).join(', ')}))`
  }).join('\n')

  return `#import "../../templates/awesome-cv/${template.file}": *

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
    process.exit(result.status ?? 1)
  }
}
