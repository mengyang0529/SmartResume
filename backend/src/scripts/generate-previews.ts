import fs from 'fs'
import path from 'path'
import axios from 'axios'
import { LatexService } from '../services/latex.service'
import { ResumeData, TemplateSettings } from '../types/resume'

const latexService = new LatexService()
// Updated to match the actual latex-service port and endpoints
const LATEX_SERVICE_URL = 'http://localhost:5050'
const OUTPUT_DIR = path.join(__dirname, '../../../frontend/public/previews')

// Sample data for preview (Smart Resume)
const previewData: ResumeData = {
  personal: {
    firstName: 'Smart',
    lastName: 'Resume',
    position: 'Senior Software Architect',
    email: 'hello@smart-resume.ai',
    mobile: '+1 234 567 8900',
    address: '123 Innovation Drive, Silicon Valley, CA',
  },
  summary: 'Innovative software architect with over 10 years of experience in building scalable web applications and AI-powered tools. Expert in TypeScript, React, Node.js, and LaTeX automation.',
  experience: [
    {
      id: '1',
      company: 'Future Systems Inc.',
      position: 'Lead Software Architect',
      location: 'San Francisco, CA',
      startDate: '2020-01',
      description: 'Leading the development of a next-generation resume builder. Managed a team of 15 engineers and improved system performance by 40%.',
      highlights: [
        'Architected and implemented a high-performance resume generation engine',
        'Led a team of 15 engineers through 5 successful product launches',
        'Reduced infrastructure costs by 35% through containerization and serverless optimization'
      ]
    },
    {
      id: '2',
      company: 'Tech Solutions Ltd.',
      position: 'Senior Full Stack Developer',
      location: 'New York, NY',
      startDate: '2016-06',
      endDate: '2019-12',
      description: 'Developed and maintained various client projects using React and Node.js.',
      highlights: [
        'Developed real-time collaboration features using WebSockets',
        'Implemented automated CI/CD pipelines reducing deployment time by 50%',
        'Mentored 5 junior developers and established coding standards'
      ]
    },
  ],
  education: [
    {
      id: '1',
      school: 'Massachusetts Institute of Technology (MIT)',
      degree: 'Master of Science',
      field: 'Computer Science',
      startDate: '2014-09',
      endDate: '2016-05',
    },
    {
      id: '2',
      school: 'Stanford University',
      degree: 'Bachelor of Science',
      field: 'Software Engineering',
      startDate: '2010-09',
      endDate: '2014-06',
    },
  ],
  skills: [
    { id: '1', category: 'Languages', name: 'TypeScript, JavaScript, Python, Go, C++' },
    { id: '2', category: 'Frameworks', name: 'React, Next.js, Express, FastAPI, Tailwind CSS' },
    { id: '3', category: 'Tools', name: 'Docker, Kubernetes, AWS, Git, LaTeX, PostgreSQL' },
  ],
}

const templates = [
  { name: 'classic-professional', label: 'Classic Professional' },
  { name: 'modern-tech', label: 'Modern Tech' },
  { name: 'academic-cv', label: 'Academic CV' },
  { name: 'creative-portfolio', label: 'Creative Portfolio' },
  { name: 'executive-level', label: 'Executive Level' },
  { name: 'cover-letter-design', label: 'Cover Letter' },
]

async function generatePreview(templateName: string) {
  console.log(`Generating preview for: ${templateName}...`)
  
  const settings: TemplateSettings = {
    fontSize: '11pt',
    paperSize: 'a4paper',
    colorScheme: 'awesome-skyblue',
    headerAlignment: 'C',
    sectionColorHighlight: true,
    className: templateName
  }

  // Adjust settings for specific templates
  if (templateName === 'academic-cv') {
    settings.colorScheme = 'black'
    settings.sectionColorHighlight = false
  } else if (templateName === 'modern-tech') {
    settings.colorScheme = 'awesome-skyblue'
  }

  const latex = latexService.generateResumeLatex(previewData, settings)
  
  // Save LaTeX for debugging
  const debugTexPath = path.join(__dirname, `../../../debug_${templateName}.tex`)
  fs.writeFileSync(debugTexPath, latex)
  console.log(`Saved debug LaTeX to: ${debugTexPath}`)
  
  try {
    // 1. Request compilation
    const compileResponse = await axios.post(`${LATEX_SERVICE_URL}/compile`, {
      latex
    })

    if (compileResponse.data.status !== 'success') {
      throw new Error(`Compilation failed: ${compileResponse.data.error}`)
    }

    const cacheKey = compileResponse.data.cache_key
    console.log(`Compiled ${templateName}, cache_key: ${cacheKey}. Downloading...`)

    // 2. Download the resulting PDF
    const downloadResponse = await axios.get(`${LATEX_SERVICE_URL}/download/${cacheKey}`, {
      responseType: 'arraybuffer'
    })

    const outputPath = path.join(OUTPUT_DIR, `${templateName}.pdf`)
    fs.writeFileSync(outputPath, downloadResponse.data)
    console.log(`Successfully generated and saved: ${outputPath}`)
  } catch (error: any) {
    console.error(`Error generating preview for ${templateName}:`, error.message)
    if (error.response && error.response.data) {
        try {
            const errorData = JSON.parse(error.response.data.toString())
            console.error('Service error details:', errorData)
        } catch (e) {}
    }
  }
}

async function run() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  for (const template of templates) {
    await generatePreview(template.name)
  }
}

run().catch(console.error)
