import { useState, useRef, useEffect, type ChangeEvent } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { 
  FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaSpinner, 
  FaSave, FaDownload, FaChevronRight, FaTerminal, FaFingerprint,
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaGithub, FaLayerGroup, FaGraduationCap, FaUser
} from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { ResumeData, TemplateSettings, Entry, ResumeSection, Education, Skill } from '../types/resume'
import { generateResumeTypst } from '../utils/typstGenerator'
import { pdfApi } from '../services/api'
import clsx from 'clsx'

export default function ResumeEditorPage() {
  const { templateId } = useParams()
  
  const defaultResumeData: ResumeData = {
    personal: {
      firstName: "Yang",
      lastName: "Meng",
      position: "Senior Engineer",
      email: "mengyang0529@gmail.com",
      mobile: "(+81) 080-8916-2962",
      address: "3-23-8, Sakai, Musashino City, Tokyo, Japan",
      github: "https://github.com/mengyang0529"
    },
    education: [
      {
        id: "edu-1",
        school: "The University of Tokyo",
        degree: "Doctor Candidate in Bio-Engineering",
        startDate: "Oct. 2013",
        endDate: "Jun. 2015",
        location: "Achieved MEXT Scholarship",
        description: "Researched in early lung cancer detection based on CT images"
      },
      {
        id: "edu-2",
        school: "Petroleum University of China (Beijing)",
        degree: "M.S. in Mechanical Engineering",
        startDate: "Sep. 2009",
        endDate: "Jun. 2012",
        location: "",
        description: ""
      },
      {
        id: "edu-3",
        school: "Harbin Institute of Technology",
        degree: "B.S. in Precision Engineering",
        startDate: "Sep. 2003",
        endDate: "Jun. 2007",
        location: "",
        description: ""
      }
    ],
    sections: [
      {
        id: "sec-experience",
        title: "Work Experience",
        entries: [
          {
            id: "exp-1",
            title: "Honda (Tokyo, Japan)",
            subtitle: "Staff Engineer",
            startDate: "Feb. 2024",
            endDate: "Current",
            description: "Played a key role in the design and development of perception systems for autonomous driving and advanced driver-assistance systems (ADAS).\nMaintained and strengthened supplier relationships, ensuring alignment with technical and business objectives.\nProvided technical and strategic support to outsourced teams, ensuring seamless integration of external resources.\nCollaborated with cross-functional teams to ensured AI systems were safe and compliant (Verification and Validation).\nPlanning and designing a data management platform to enable rapid deployment, validation, and version control of model data."
          },
          {
            id: "exp-2",
            title: "ARAYA (Tokyo, Japan)",
            subtitle: "Senior Engineer | Project Manager",
            startDate: "Nov. 2021",
            endDate: "Feb. 2024",
            description: "Led new AI/Computer Vision project proposals, securing business opportunities and driving innovation.\nManaged multiple AI projects, overseeing project timelines, resource allocation, and risk assessment.\nServed as primary contact for key clients, providing technical consulting and ensuring successful project delivery.\nProvided technical leadership, mentoring engineers and shaping R&D strategies."
          },
          {
            id: "exp-3",
            title: "VRAIN Solutions (Tokyo, Japan)",
            subtitle: "Senior Engineer | R&D Lead",
            startDate: "Aug. 2021",
            endDate: "Oct. 2021",
            description: "Directed R&D efforts in computer vision and deep learning, aligning research objectives with business goals.\nDeveloped innovative solutions, integrating AI algorithms into real-world industrial applications."
          },
          {
            id: "exp-4",
            title: "Ficha Inc. (Tokyo, Japan)",
            subtitle: "Software Engineer | Project Leader",
            startDate: "Oct. 2015",
            endDate: "Aug. 2021",
            description: "Led a 5-person R&D team, managing development roadmaps and delivering AI-driven computer vision solutions.\nProgressed from an engineer to a project manager.\nExperienced in both independent development and collaborative development."
          }
        ]
      },
      {
        id: "sec-automobile",
        title: "Automobile Industry",
        entries: [
          {
            id: "auto-1",
            title: "HONDA (Tokyo, Japan)",
            subtitle: "Advanced ADAS Perception Systems & Compliance",
            startDate: "Staff Engineer | Technical Lead",
            endDate: "",
            description: "Defined multi-dimensional performance KPIs (latency vs. precision) for deep learning models.\nEstablished systematic benchmarking protocols for algorithm refinement.\nManaged V&V workflows for international regulation compliance."
          },
          {
            id: "auto-2",
            title: "Ficha Inc.",
            subtitle: "Real-time Drowsiness Detection System",
            startDate: "Technical Project Lead",
            endDate: "",
            description: "Directed full-lifecycle development from PoC to commercial delivery.\nServed as primary technical liaison for external clients.\nOptimized core vision modules in C/C++ for resource-constrained systems."
          },
          {
            id: "auto-3",
            title: "Ficha Inc.",
            subtitle: "Traffic Sign Recognition System",
            startDate: "Product Owner",
            endDate: "",
            description: "Defined product direction and led feature planning for AI recognition.\nOversaw data annotation and managed dataset/code versioning.\nLed model optimization and system integration."
          }
        ]
      },
      {
        id: "sec-smartcity",
        title: "Smart City & Social Infrastructure Ecosystems",
        entries: [
          {
            id: "sc-1",
            title: "Araya Inc.",
            subtitle: "National Expressway Intelligence & Perception Infrastructure",
            startDate: "PoC Implementation & Management",
            endDate: "",
            description: "Communicated with client to define requirements and technical roadmap.\nParticipated in project development and collected feedback for continuous improvement."
          },
          {
            id: "sc-2",
            title: "Ficha Inc.",
            subtitle: "Urban Safety & High-Precision Speed Analytics",
            startDate: "PoC Phase to Productization",
            endDate: "",
            description: "Developed vision-based traffic surveillance for static scenes.\nImplemented Python toolbox for intrinsic/extrinsic camera calibration.\nDesigned monocular depth estimation with error <0.1m within 20m."
          },
          {
            id: "sc-3",
            title: "Ficha Inc.",
            subtitle: "Taxi Driver Behavior Transformation",
            startDate: "AI Developer",
            endDate: "",
            description: "Developed geometric algorithms and vehicle stop detection using optical flow.\nDesigned traffic violation detection logic; achieved 95% recall and 100% precision.\nSupported successful commercial productization."
          }
        ]
      },
      {
        id: "sec-retail",
        title: "Retail Industry",
        entries: [
          {
            id: "ret-1",
            title: "Araya Inc.",
            subtitle: "Smart Retail & Inventory Intelligence",
            startDate: "Tech Advisor",
            endDate: "",
            description: "Strategically pivoted roadmap from one-stage to two-stage recognition framework.\nArchitected generic detection + fine-grained classification to resolve data scarcity.\nAchieved 99% recognition accuracy in real-world testing."
          },
          {
            id: "ret-2",
            title: "Araya Inc. (Tokyo, Japan)",
            subtitle: "Smart Retail & Sports-Tech Innovation",
            startDate: "AI Solutions Architect",
            endDate: "",
            description: "Independently developed AI-powered gait analysis engine for global footwear brand.\nEngineered biometric recommender system based on pose estimation.\nBuilt full-stack prototype from data acquisition to user-facing logic."
          }
        ]
      },
      {
        id: "sec-agri",
        title: "Agricultural Industry",
        entries: [
          {
            id: "ag-1",
            title: "Araya Inc.",
            subtitle: "Pig Weight Estimation PoC",
            startDate: "Technical Lead",
            endDate: "",
            description: "Used RealSense D455 for depth-based weight estimation.\nProposed and trained ranking-based regression model, achieving 97% accuracy."
          }
        ]
      },
      {
        id: "sec-research",
        title: "Research and Study",
        entries: [
          {
            id: "res-1",
            title: "VLM (Vision-Language Model)",
            subtitle: "Research",
            startDate: "2024",
            endDate: "",
            description: "Fine-tuning models using LoRA with InternVL2 1B.\nResearching existing flowchart datasets."
          },
          {
            id: "res-2",
            title: "Flash Attention Animation",
            subtitle: "Study",
            startDate: "2024",
            endDate: "",
            description: "Created educational animation of Flash Attention using manim."
          }
        ]
      },
      {
        id: "sec-private",
        title: "Private Projects",
        entries: [
          {
            id: "priv-1",
            title: "PPTNinja",
            subtitle: "AI-Driven Office Automation",
            startDate: "https://github.com/mengyang0529/PPTNinja",
            endDate: "",
            description: "Eliminating design overhead to empower singular focus on core content.\nMulti-agent collaboration from idea generation to slide parsing via VLM."
          },
          {
            id: "priv-2",
            title: "hi-school",
            subtitle: "Geospatial Data Visualization",
            startDate: "https://koukou-japan.vercel.app",
            endDate: "",
            description: "Interactive web platform for high schools across Japan.\nIntegrated geographic data visualization to catalyst educational equity."
          },
          {
            id: "priv-3",
            title: "Kakuti",
            subtitle: "Human Augmentation & Cognitive Enhancement",
            startDate: "https://zenn.dev/ianmeng/articles/9ea26b6d0baa20",
            endDate: "",
            description: "Engineered RAG-based ecosystem for high-fidelity multi-language synthesis.\nDeveloped 'Magic Wand' UI for real-time contextual analysis during reading.\nFocusing on 'understanding over automation' via VLM."
          }
        ]
      }
    ],
    skills: [
      { id: "sk-1", category: "Programming Languages", name: "C&C++, Python" },
      { id: "sk-2", category: "Artificial Intelligence", name: "TensorFlow, PyTorch, Huggingface, OpenAI API, ONNX, NCNN&MNN" },
      { id: "sk-3", category: "Other Tools", name: "CMake, OpenCV, Git, Docker, Miniconda" },
      { id: "sk-4", category: "Languages", name: "Chinese, English (Business), Japanese (Business)" }
    ]
  }

  const defaultTemplateSettings: TemplateSettings = {
    colorScheme: 'awesome-red',
    fontSize: '11pt',
    paperSize: 'a4paper',
    sectionColorHighlight: true,
    headerAlignment: 'C',
  }

  const emptyResumeData: ResumeData = {
    personal: {
      firstName: '',
      lastName: '',
      position: '',
      email: '',
      mobile: '',
      address: '',
      github: '',
    },
    education: [],
    sections: [],
    skills: [],
  }

  const [resumeData, setResumeData] = useState<ResumeData>(emptyResumeData)
  const [templateSettings, setTemplateSettings] = useState<TemplateSettings>(defaultTemplateSettings)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [activeTab, setActiveTab] = useState('personal')
  const [isSaved, setIsSaved] = useState(true)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const location = useLocation()
  const navigate = useNavigate()

  const handleChange = () => setIsSaved(false)

  useEffect(() => {
    const openListener = () => openJsonFile()
    window.addEventListener('openResumeJsonFile', openListener)
    return () => window.removeEventListener('openResumeJsonFile', openListener)
  }, [])

  useEffect(() => {
    if ((location.state as any)?.openJsonFile) {
      openJsonFile()
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location, navigate])

  const normalizeResumeData = (data: any): ResumeData => {
    const ensureId = (value: any, prefix: string) => typeof value === 'string' && value ? value : `${prefix}-${crypto.randomUUID()}`

    return {
      personal: {
        firstName: String(data.personal?.firstName || ''),
        lastName: String(data.personal?.lastName || ''),
        position: String(data.personal?.position || ''),
        email: String(data.personal?.email || ''),
        mobile: String(data.personal?.mobile || ''),
        address: String(data.personal?.address || ''),
        github: String(data.personal?.github || ''),
        homePage: data.personal?.homePage ? String(data.personal.homePage) : undefined,
        linkedin: data.personal?.linkedin ? String(data.personal.linkedin) : undefined,
        gitlab: data.personal?.gitlab ? String(data.personal.gitlab) : undefined,
        twitter: data.personal?.twitter ? String(data.personal.twitter) : undefined,
        photo: data.personal?.photo,
        quote: data.personal?.quote ? String(data.personal.quote) : undefined,
      },
      education: Array.isArray(data.education) ? data.education.map((edu: any) => ({
        id: ensureId(edu.id, 'edu'),
        school: String(edu.school || ''),
        degree: String(edu.degree || ''),
        field: edu.field ? String(edu.field) : undefined,
        startDate: String(edu.startDate || ''),
        endDate: edu.endDate ? String(edu.endDate) : undefined,
        description: edu.description ? String(edu.description) : undefined,
        gpa: edu.gpa ? String(edu.gpa) : undefined,
        location: edu.location ? String(edu.location) : undefined,
      })) : [],
      sections: Array.isArray(data.sections) ? data.sections.map((section: any, sectionIndex: number) => ({
        id: ensureId(section.id || `section-${sectionIndex}`, 'sec'),
        title: String(section.title || `Section ${sectionIndex + 1}`),
        entries: Array.isArray(section.entries) ? section.entries.map((entry: any, entryIndex: number) => ({
          id: ensureId(entry.id || `entry-${entryIndex}`, 'entry'),
          title: String(entry.title || ''),
          subtitle: String(entry.subtitle || ''),
          location: entry.location ? String(entry.location) : undefined,
          startDate: String(entry.startDate || ''),
          endDate: entry.endDate ? String(entry.endDate) : undefined,
          description: entry.description ? String(entry.description) : undefined,
          highlights: Array.isArray(entry.highlights) ? entry.highlights.map((item: any) => String(item)) : undefined,
        })) : [],
      })) : [],
      skills: Array.isArray(data.skills) ? data.skills.map((skill: any, skillIndex: number) => ({
        id: ensureId(skill.id || `skill-${skillIndex}`, 'sk'),
        category: String(skill.category || ''),
        name: String(skill.name || ''),
      })) : [],
      summary: typeof data.summary === 'string' ? data.summary : undefined,
    }
  }

  const validateResumeFile = (data: any): data is ResumeData => {
    return (
      data &&
      typeof data === 'object' &&
      data.personal &&
      typeof data.personal === 'object'
    )
  }

  const sanitizeJsonText = (raw: string) => {
    let inString = false
    let escaped = false
    let sanitized = ''

    for (let i = 0; i < raw.length; i += 1) {
      const char = raw[i]

      if (inString) {
        if (escaped) {
          sanitized += char
          escaped = false
          continue
        }

        if (char === '\\') {
          sanitized += char
          escaped = true
          continue
        }

        if (char === '"') {
          sanitized += char
          inString = false
          continue
        }

        if (char === '\r') {
          sanitized += '\\n'
          if (raw[i + 1] === '\n') {
            i += 1
          }
          continue
        }

        if (char === '\n') {
          sanitized += '\\n'
          continue
        }
      } else if (char === '"') {
        inString = true
      }

      sanitized += char
    }

    return sanitized
  }

  const parseJsonWithFallback = (raw: string) => {
    try {
      return JSON.parse(raw)
    } catch (firstError) {
      const sanitized = sanitizeJsonText(raw)
      return JSON.parse(sanitized)
    }
  }

  const handleJsonFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const text = reader.result as string
        const parsed = parseJsonWithFallback(text)
        if (!validateResumeFile(parsed)) {
          console.error('Resume JSON validation failed', parsed)
          toast.error('Invalid resume JSON format. Please include a personal object.')
          return
        }
        setResumeData(normalizeResumeData(parsed))
        setIsSaved(true)
        toast.success('Resume loaded from JSON.')
      } catch (error) {
        console.error('Failed to parse JSON file', error)
        toast.error('Failed to parse JSON file. Please check the JSON syntax.')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const openJsonFile = () => {
    fileInputRef.current?.click()
  }

  const saveToLocalStorage = (data: ResumeData) => {
    localStorage.setItem('current_resume_data', JSON.stringify(data))
    setIsSaved(true)
  }

  const addSection = () => {
    handleChange()
    const newSection: ResumeSection = {
      id: `sec-${crypto.randomUUID()}`,
      title: "New Section",
      entries: []
    }
    setResumeData(prev => ({ ...prev, sections: [...prev.sections, newSection] }))
  }

  const updateSectionTitle = (id: string, title: string) => {
    handleChange()
    setResumeData(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === id ? { ...s, title } : s)
    }))
  }

  const removeSection = (id: string) => {
    handleChange()
    setResumeData(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== id)
    }))
  }

  const addEntry = (sectionId: string) => {
    handleChange()
    const newEntry: Entry = {
      id: crypto.randomUUID(),
      title: "",
      subtitle: "",
      startDate: "",
      endDate: "",
      description: ""
    }
    setResumeData(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === sectionId ? { ...s, entries: [newEntry, ...s.entries] } : s)
    }))
  }

  const updateEntry = (sectionId: string, entryId: string, updates: Partial<Entry>) => {
    handleChange()
    setResumeData(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === sectionId ? {
        ...s,
        entries: s.entries.map(e => e.id === entryId ? { ...e, ...updates } : e)
      } : s)
    }))
  }

  const moveEntry = (sectionId: string, entryId: string, direction: 'up' | 'down') => {
    handleChange()
    setResumeData(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== sectionId) return s
        const entries = [...s.entries]
        const index = entries.findIndex(e => e.id === entryId)
        if (index === -1) return s
        const newIndex = direction === 'up' ? index - 1 : index + 1
        if (newIndex < 0 || newIndex >= entries.length) return s
        const [moved] = entries.splice(index, 1)
        entries.splice(newIndex, 0, moved)
        return { ...s, entries }
      })
    }))
  }

  const removeEntry = (sectionId: string, entryId: string) => {
    handleChange()
    setResumeData(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === sectionId ? {
        ...s,
        entries: s.entries.filter(e => e.id !== entryId)
      } : s)
    }))
  }

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true)
    try {
      const typstSource = generateResumeTypst(resumeData, templateSettings)
      const result = await pdfApi.generateFromTypst(typstSource)
      const cacheKey = result?.cacheKey || result?.cache_key
      if (cacheKey) {
        window.open(pdfApi.downloadPdf(cacheKey), '_blank')
        toast.success('PDF Generated!')
      }
    } catch (error) {
      toast.error('Generation failed')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-gray-100 flex selection:bg-red-500/30">
      {/* Sidebar - Now with updated fixed positioning to account for header */}
      <aside className="w-[280px] bg-[#0A0A0A] border-r border-gray-800/30 fixed top-20 bottom-0 left-0 z-40 flex flex-col">
        <nav className="flex-1 overflow-y-auto px-6 py-10 space-y-2 custom-scrollbar">
          <NavTab active={activeTab === 'personal'} onClick={() => setActiveTab('personal')} num="01" label="Identity" icon={<FaFingerprint />} />
          <NavTab active={activeTab === 'education'} onClick={() => setActiveTab('education')} num="02" label="Education" icon={<FaGraduationCap />} />
          
          <div className="mt-8 flex items-center justify-between px-4 mb-2">
            <SectionDivider label="Modules" />
            <button onClick={addSection} className="text-gray-500 hover:text-red-500 transition-colors"><FaPlus className="text-xs" /></button>
          </div>
          {resumeData.sections.map((sec, i) => (
            <NavTab 
              key={sec.id}
              active={activeTab === sec.id} 
              onClick={() => setActiveTab(sec.id)} 
              num={(i + 3).toString().padStart(2, '0')}
              label={sec.title} 
              icon={<FaLayerGroup />}
            />
          ))}

          <SectionDivider label="Finalize" className="mt-8" />
          <NavTab active={activeTab === 'skills'} onClick={() => setActiveTab('skills')} num="--" label="Capabilities" icon={<FaUser />} />
        </nav>

        {/* Execute Build Button moved here, made more prominent */}
        <div className="p-8 border-t border-gray-800/30 bg-[#080808] space-y-3">
          <button
            onClick={openJsonFile}
            className="w-full bg-[#111111] border border-gray-700 hover:border-red-500 hover:bg-[#181818] text-gray-200 font-black py-4 rounded uppercase tracking-widest text-[10px] flex items-center justify-center space-x-3 transition-all"
          >
            <FaPlus className="text-xs" />
            <span>Create Resume</span>
          </button>
          <button 
            onClick={handleDownloadPdf} 
            disabled={isGeneratingPdf} 
            className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded uppercase tracking-widest text-[10px] flex items-center justify-center space-x-3 transition-all disabled:opacity-50 shadow-[0_10px_30px_rgba(220,38,38,0.2)]"
          >
            {isGeneratingPdf ? <FaSpinner className="animate-spin" /> : <><FaDownload className="text-xs" /> <span>Download PDF</span></>}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleJsonFileUpload}
          />
        </div>
      </aside>

      {/* Main Foundry Area */}
      <main className="flex-1 ml-[280px] p-20 flex justify-center bg-[#050505]">
        <div className="w-full max-w-4xl">
          <AnimatePresence mode="wait">
            {/* Identity Module */}
            {activeTab === 'personal' && (
              <ModuleWrapper key="personal" title="Primary Identity" subtitle="Fundamental credentials for professional interface">
                <div className="grid grid-cols-2 gap-x-12 gap-y-12">
                  <FoundryInput label="First Name" value={resumeData.personal.firstName} onChange={v => { handleChange(); setResumeData(p => ({...p, personal: {...p.personal, firstName: v}}))}} />
                  <FoundryInput label="Last Name" value={resumeData.personal.lastName} onChange={v => { handleChange(); setResumeData(p => ({...p, personal: {...p.personal, lastName: v}}))}} />
                  <div className="col-span-2">
                    <FoundryInput label="System Designation" value={resumeData.personal.position} onChange={v => { handleChange(); setResumeData(p => ({...p, personal: {...p.personal, position: v}}))}} />
                  </div>
                  <FoundryInput label="Communication Layer (Email)" value={resumeData.personal.email} onChange={v => { handleChange(); setResumeData(p => ({...p, personal: {...p.personal, email: v}}))}} icon={<FaEnvelope />} />
                  <FoundryInput label="Voice Node (Mobile)" value={resumeData.personal.mobile} onChange={v => { handleChange(); setResumeData(p => ({...p, personal: {...p.personal, mobile: v}}))}} icon={<FaPhone />} />
                  <div className="col-span-2">
                    <FoundryInput label="Physical Coordinates (Address)" value={resumeData.personal.address} onChange={v => { handleChange(); setResumeData(p => ({...p, personal: {...p.personal, address: v}}))}} icon={<FaMapMarkerAlt />} />
                  </div>
                  <div className="col-span-2">
                    <FoundryInput label="Digital Repository (GitHub)" value={resumeData.personal.github} onChange={v => { handleChange(); setResumeData(p => ({...p, personal: {...p.personal, github: v}}))}} icon={<FaGithub />} />
                  </div>
                </div>
              </ModuleWrapper>
            )}

            {/* Education Module */}
            {activeTab === 'education' && (
              <ModuleWrapper 
                key="education" 
                title="Education" 
                subtitle="Academic milestones & theoretical foundation"
                onAdd={() => {
                   handleChange();
                   setResumeData(p => ({...p, education: [{ id: crypto.randomUUID(), school: "", degree: "", startDate: "", endDate: "" }, ...p.education]}));
                }}
              >
                <div className="space-y-12">
                  {resumeData.education.map((edu) => (
                    <div key={edu.id} className="relative bg-[#0A0A0A] p-10 border border-gray-800/50 group transition-all hover:border-red-600/30">
                      <button onClick={() => {
                        handleChange();
                        setResumeData(p => ({...p, education: p.education.filter(e => e.id !== edu.id)}));
                      }} className="absolute top-4 right-4 text-gray-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><FaTrash className="text-xs" /></button>
                      
                      <div className="grid grid-cols-2 gap-10">
                        <div className="col-span-2"><FoundryInput clean label="Institution" value={edu.school} onChange={v => setResumeData(p => ({...p, education: p.education.map(e => e.id === edu.id ? {...e, school: v} : e)}))} /></div>
                        <FoundryInput clean label="Qualification" value={edu.degree} onChange={v => setResumeData(p => ({...p, education: p.education.map(e => e.id === edu.id ? {...e, degree: v} : e)}))} />
                        <FoundryInput clean label="Honors" value={edu.location} onChange={v => setResumeData(p => ({...p, education: p.education.map(e => e.id === edu.id ? {...e, location: v} : e)}))} />
                        <FoundryInput clean label="Origin" value={edu.startDate} onChange={v => setResumeData(p => ({...p, education: p.education.map(e => e.id === edu.id ? {...e, startDate: v} : e)}))} />
                        <FoundryInput clean label="Completion" value={edu.endDate} onChange={v => setResumeData(p => ({...p, education: p.education.map(e => e.id === edu.id ? {...e, endDate: v} : e)}))} />
                        <div className="col-span-2">
                           <label className="text-[9px] font-black text-gray-700 uppercase tracking-widest mb-3 block">Field Context</label>
                           <textarea className="w-full bg-transparent border border-gray-800/50 p-6 text-sm text-gray-400 focus:border-red-600 focus:ring-0 transition-all min-h-[100px] resize-none leading-relaxed" placeholder="Primary research focus..." value={edu.description} onChange={e => setResumeData(p => ({...p, education: p.education.map(item => item.id === edu.id ? {...item, description: e.target.value} : item)}))} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ModuleWrapper>
            )}

            {/* Dynamic Modules */}
            {resumeData.sections.map(sec => activeTab === sec.id && (
              <ModuleWrapper 
                key={sec.id}
                title={sec.title}
                isTitleEditable
                onTitleChange={(v) => updateSectionTitle(sec.id, v)}
                onAdd={() => addEntry(sec.id)}
              >
                <div className="space-y-12">
                  {sec.entries.map((entry) => (
                    <div key={entry.id} className="relative bg-[#0A0A0A] p-10 border border-gray-800/50 group transition-all hover:border-red-600/30">
                      <div className="absolute top-4 right-4 flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                         <ControlButton onClick={() => moveEntry(sec.id, entry.id, 'up')} icon={<FaArrowUp />} />
                         <ControlButton onClick={() => moveEntry(sec.id, entry.id, 'down')} icon={<FaArrowDown />} />
                         <ControlButton onClick={() => removeEntry(sec.id, entry.id)} icon={<FaTrash />} danger />
                      </div>

                      <div className="grid grid-cols-2 gap-10">
                        <div className="col-span-2"><FoundryInput clean label="Entity / Context" value={entry.title} onChange={v => updateEntry(sec.id, entry.id, { title: v })} /></div>
                        <FoundryInput clean label="Role / Designation" value={entry.subtitle} onChange={v => updateEntry(sec.id, entry.id, { subtitle: v })} />
                        <FoundryInput clean label="Timeline" value={entry.startDate} onChange={v => updateEntry(sec.id, entry.id, { startDate: v })} />
                        <div className="col-span-2">
                           <label className="text-[9px] font-black text-gray-700 uppercase tracking-widest mb-3 block">Execution Details</label>
                           <textarea className="w-full bg-transparent border border-gray-800/50 p-6 text-sm text-gray-400 focus:border-red-600 focus:ring-0 transition-all min-h-[180px] leading-relaxed resize-none" placeholder="Impact and achievements..." value={entry.description} onChange={e => updateEntry(sec.id, entry.id, { description: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ModuleWrapper>
            ))}

            {/* Capabilities Module */}
            {activeTab === 'skills' && (
              <ModuleWrapper 
                key="skills" 
                title="Capabilities" 
                subtitle="Technical inventory & domain expertise"
                onAdd={() => {
                   handleChange();
                   setResumeData(p => ({...p, skills: [{ id: crypto.randomUUID(), category: "", name: "" }, ...p.skills]}));
                }}
              >
                <div className="grid grid-cols-2 gap-10">
                  {resumeData.skills.map(skill => (
                    <div key={skill.id} className="bg-[#0A0A0A] p-8 border border-gray-800/50 relative group hover:border-red-600/30 transition-all">
                      <button onClick={() => {
                        handleChange();
                        setResumeData(p => ({...p, skills: p.skills.filter(s => s.id !== skill.id)}));
                      }} className="absolute top-4 right-4 text-gray-700 hover:text-red-500 opacity-0 group-hover:opacity-100"><FaTrash className="text-xs" /></button>
                      <FoundryInput clean label="Domain" value={skill.category} onChange={v => setResumeData(p => ({...p, skills: p.skills.map(s => s.id === skill.id ? {...s, category: v} : s)}))} />
                      <div className="mt-8">
                         <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 block">Protocols / Tools</label>
                         <textarea className="w-full bg-transparent border border-gray-800/50 p-4 text-sm font-mono text-red-500 focus:border-red-600 focus:ring-0 min-h-[80px] resize-none" value={skill.name} onChange={e => setResumeData(p => ({...p, skills: p.skills.map(s => s.id === skill.id ? {...s, name: e.target.value} : s)}))} />
                      </div>
                    </div>
                  ))}
                </div>
              </ModuleWrapper>
            )}
          </AnimatePresence>
        </div>

        {/* Global Commit FAB - Floating on right bottom */}
        {!isSaved && (
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed bottom-12 right-12 z-50">
            <button 
              onClick={() => saveToLocalStorage(resumeData)} 
              className="bg-red-600 text-white px-10 py-5 rounded shadow-[0_15px_40px_rgba(220,38,38,0.4)] hover:bg-red-500 transition-all flex items-center space-x-4 active:scale-95 group border border-red-400/20"
            >
              <FaSave className="text-xl" />
              <span className="font-black uppercase tracking-[0.2em] text-xs">Save Changes</span>
            </button>
          </motion.div>
        )}
      </main>
    </div>
  )
}

function SectionDivider({ label, className }: any) {
  return (
    <div className={clsx("flex items-center space-x-4 px-4 py-4", className)}>
      <div className="h-[1px] flex-1 bg-gray-800/50"></div>
      <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">{label}</span>
      <div className="h-[1px] w-4 bg-gray-800/50"></div>
    </div>
  )
}

function NavTab({ active, onClick, num, label, icon }: any) {
  return (
    <button onClick={onClick} className={clsx(
      "w-full group flex items-center px-4 py-5 rounded transition-all duration-300 relative",
      active ? "bg-[#111111] border-l-4 border-red-600" : "hover:bg-gray-900/50"
    )}>
      <span className={clsx("text-[10px] font-mono mr-4 transition-colors", active ? "text-red-500" : "text-gray-700")}>{num}</span>
      <div className={clsx("mr-3 text-sm transition-colors", active ? "text-red-500" : "text-gray-600 group-hover:text-gray-300")}>{icon}</div>
      <span className={clsx("text-[11px] font-black uppercase tracking-widest truncate transition-colors", active ? "text-white" : "text-gray-500 group-hover:text-gray-300")}>{label}</span>
      {active && <motion.div layoutId="tabActive" className="absolute right-4 text-red-600"><FaChevronRight className="text-[10px]" /></motion.div>}
    </button>
  )
}

function ModuleWrapper({ title, subtitle, children, isTitleEditable, onTitleChange, onAdd }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="pb-32">
      <header className="mb-16 flex items-end justify-between border-b border-gray-800/50 pb-8">
        <div className="flex-1 mr-8">
          {isTitleEditable ? (
            <input 
              className="bg-transparent border-none text-5xl font-black uppercase tracking-tighter text-white p-0 focus:ring-0 w-full mb-4 caret-red-600" 
              value={title} 
              onChange={(e) => onTitleChange(e.target.value)} 
            />
          ) : (
            <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-4">{title}</h1>
          )}
          <p className="text-gray-600 font-mono text-xs uppercase tracking-widest">{subtitle || 'Deployment module configuration'}</p>
        </div>
        <div className="flex space-x-3">
          {onAdd && <button onClick={onAdd} className="px-8 py-3 bg-white text-black hover:bg-red-600 hover:text-white transition-all text-[10px] font-black uppercase shadow-xl">Add New Entry</button>}
        </div>
      </header>
      {children}
    </motion.div>
  )
}

function FoundryInput({ label, value, onChange, icon, clean }: any) {
  return (
    <div className="flex flex-col space-y-4 group/input">
      <div className="flex items-center space-x-2">
        <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest group-focus-within/input:text-red-500 transition-colors">{label}</label>
        {icon && <span className="text-[10px] text-gray-800">{icon}</span>}
      </div>
      <input 
        className={clsx(
          "w-full bg-transparent p-0 text-xl font-medium text-gray-200 focus:ring-0 placeholder:text-gray-900 transition-all",
          !clean ? "border-b border-gray-800 focus:border-red-600" : "border-none"
        )}
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)} 
      />
    </div>
  )
}

function ControlButton({ icon, onClick, danger }: any) {
  return (
    <button 
      onClick={onClick} 
      className={clsx(
        "w-8 h-8 flex items-center justify-center border transition-all",
        danger ? "border-gray-800 text-gray-700 hover:bg-red-600 hover:text-white hover:border-red-600" : "border-gray-800 text-gray-700 hover:border-gray-400 hover:text-white"
      )}
    >
      <span className="text-[10px]">{icon}</span>
    </button>
  )
}
