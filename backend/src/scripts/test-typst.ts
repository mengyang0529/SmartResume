import { TypstService } from '../services/typst.service'
import { ResumeData, TemplateSettings } from '../types/resume'

// Sample resume data
const sampleResume: ResumeData = {
  personal: {
    firstName: 'John',
    lastName: 'Doe',
    position: 'Senior Software Engineer',
    address: 'San Francisco, CA',
    mobile: '+1 (123) 456-7890',
    email: 'john.doe@example.com',
    homePage: 'johndoe.dev',
    linkedin: 'johndoe',
    quote: 'Passionate about building scalable software systems.'
  },
  education: [
    {
      id: 'edu1',
      school: 'Stanford University',
      degree: 'Master of Science in Computer Science',
      field: 'Artificial Intelligence',
      startDate: '2018-09',
      endDate: '2020-06',
      gpa: '3.9/4.0',
      location: 'Stanford, CA'
    },
    {
      id: 'edu2',
      school: 'MIT',
      degree: 'Bachelor of Science in Computer Science',
      startDate: '2014-09',
      endDate: '2018-06',
      gpa: '3.8/4.0',
      location: 'Cambridge, MA'
    }
  ],
  experience: [
    {
      id: 'exp1',
      position: 'Senior Software Engineer',
      company: 'Tech Corp Inc.',
      location: 'San Francisco, CA',
      startDate: '2020-07',
      endDate: '2023-12',
      description: 'Led development of cloud-native microservices architecture.',
      highlights: [
        'Reduced API response time by 40% through optimization',
        'Implemented CI/CD pipeline reducing deployment time by 70%',
        'Mentored 3 junior engineers'
      ]
    },
    {
      id: 'exp2',
      position: 'Software Engineer',
      company: 'Startup XYZ',
      location: 'New York, NY',
      startDate: '2018-07',
      endDate: '2020-06',
      description: 'Full-stack development using React and Node.js.'
    }
  ],
  skills: [
    {
      id: 'skill1',
      category: 'Programming Languages',
      name: 'TypeScript, Python, Go'
    },
    {
      id: 'skill2',
      category: 'Frameworks',
      name: 'React, Node.js, Express'
    },
    {
      id: 'skill3',
      category: 'Cloud',
      name: 'AWS, Docker, Kubernetes'
    }
  ],
  projects: [
    {
      id: 'proj1',
      name: 'Open Source Dashboard',
      description: 'Real-time monitoring dashboard for DevOps teams.',
      technologies: ['React', 'TypeScript', 'WebSocket', 'D3.js']
    }
  ],
  languages: [
    {
      id: 'lang1',
      name: 'English',
      level: 'Native'
    },
    {
      id: 'lang2',
      name: 'Spanish',
      level: 'Intermediate'
    }
  ],
  summary: 'Experienced software engineer with 5+ years in building scalable web applications and cloud infrastructure. Passionate about clean code, DevOps practices, and mentoring junior developers.',
  honors: ['Google Developer Expert 2022', 'AWS Community Builder'],
  certificates: ['AWS Solutions Architect Professional', 'Kubernetes Administrator']
}

const settings: TemplateSettings = {
  colorScheme: 'awesome-red',
  fontSize: '11pt',
  paperSize: 'a4paper',
  sectionColorHighlight: true,
  headerAlignment: 'C'
}

function runTest() {
  console.log('Testing Typst generation...\n')

  const typstService = new TypstService()

  try {
    const typst = typstService.generateResumeTypst(sampleResume, settings)

    // Save to file for inspection
    const fs = require('fs')
    const path = require('path')

    const outputPath = path.join(__dirname, '../../test-output')
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true })
    }

    const typstFile = path.join(outputPath, 'generated-resume.typ')
    fs.writeFileSync(typstFile, typst)

    console.log(`✅ Typst generated successfully!`)
    console.log(`📁 Output saved to: ${typstFile}`)
    console.log(`📏 Length: ${typst.length} characters`)

    // Show first 20 lines
    const lines = typst.split('\n').slice(0, 20).join('\n')
    console.log('\nFirst 20 lines:\n')
    console.log(lines)
    console.log('\n...\n')

  } catch (error) {
    console.error('❌ Error generating Typst:', error)
    process.exit(1)
  }
}

runTest()
