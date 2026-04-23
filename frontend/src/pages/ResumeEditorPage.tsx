import { useState, useRef, useEffect, type ChangeEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { 
  FaPlus, FaTrash, FaSpinner, 
  FaSave, FaDownload, FaChevronRight, FaFingerprint,
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaGithub, FaLayerGroup, FaGraduationCap, FaUser
} from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { ResumeData, TemplateSettings, ResumeSection } from '../types/resume'
import type { RichTextBlock } from '../types/richText'
import { generateResumeTypst } from '../utils/typstGenerator'
import { pdfApi } from '../services/api'
import { educationToBlocks, blocksToEducation, sectionToBlocks, blocksToSection } from '../utils/resumeTransforms'
import { RichTextEditor } from '../components/RichTextEditor'
import clsx from 'clsx'

export default function ResumeEditorPage() {
  
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
  const [templateSettings] = useState<TemplateSettings>(defaultTemplateSettings)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [activeTab, setActiveTab] = useState('personal')
  const [isSaved, setIsSaved] = useState(true)
  const [editorBlocks, setEditorBlocks] = useState<Record<string, RichTextBlock[]>>({})
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
        blocks: Array.isArray(edu.blocks) ? edu.blocks : undefined,
      })) : [],
      sections: Array.isArray(data.sections) ? data.sections.map((section: any, sectionIndex: number) => ({
        id: ensureId(section.id || `section-${sectionIndex}`, 'sec'),
        title: String(section.title || `Section ${sectionIndex + 1}`),
        blocks: Array.isArray(section.blocks) ? section.blocks : undefined,
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
        setEditorBlocks({})
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
    const newSectionId = `sec-${crypto.randomUUID()}`
    const newSection: ResumeSection = {
      id: newSectionId,
      title: "New Section",
      entries: []
    }
    setResumeData(prev => ({ ...prev, sections: [...prev.sections, newSection] }))
    setEditorBlocks(prev => ({
      ...prev,
      [newSectionId]: [{ id: `block-${crypto.randomUUID()}`, type: 'h1' as const, content: 'New Section' }]
    }))
    setActiveTab(newSectionId)
  }

  const updateSectionTitle = (id: string, title: string) => {
    handleChange()
    setResumeData(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === id ? { ...s, title } : s)
    }))
    setEditorBlocks(prev => {
      const blocks = prev[id]
      if (!blocks) return prev
      return {
        ...prev,
        [id]: blocks.map(b => b.type === 'h1' ? { ...b, content: title } : b)
      }
    })
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
    <div className="min-h-screen bg-[#1e1e22] font-sans text-gray-400 flex selection:bg-red-500/30">
      {/* Sidebar - Now with updated fixed positioning to account for header */}
      <aside className="w-[280px] bg-[#3a3a44] border-r border-gray-700/30 fixed top-20 bottom-0 left-0 z-40 flex flex-col">
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
        <div className="p-8 border-t border-gray-700/30 bg-[#3a3a44] space-y-3">
          <button
            onClick={openJsonFile}
            className="w-full bg-[#3a3a44] border border-gray-700 hover:border-red-500 hover:bg-[#464650] text-gray-400 font-black py-4 rounded uppercase tracking-widest text-[10px] flex items-center justify-center space-x-3 transition-all"
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
      <main className="flex-1 ml-[280px] p-20 flex justify-center bg-[#1e1e22]">
        <div className="w-full max-w-4xl">
          <AnimatePresence mode="wait">
            {/* Identity Module */}
            {activeTab === 'personal' && (
              <ModuleWrapper key="personal">
                <div className="grid grid-cols-2 gap-x-12 gap-y-12 mt-8">
                  <FoundryInput label="First Name" value={resumeData.personal.firstName} onChange={(v: string) => { handleChange(); setResumeData(p => ({...p, personal: {...p.personal, firstName: v}}))}} />
                  <FoundryInput label="Last Name" value={resumeData.personal.lastName} onChange={(v: string) => { handleChange(); setResumeData(p => ({...p, personal: {...p.personal, lastName: v}}))}} />
                  <div className="col-span-2">
                    <FoundryInput label="System Designation" value={resumeData.personal.position} onChange={(v: string) => { handleChange(); setResumeData(p => ({...p, personal: {...p.personal, position: v}}))}} />
                  </div>
                  <FoundryInput label="Communication Layer (Email)" value={resumeData.personal.email} onChange={(v: string) => { handleChange(); setResumeData(p => ({...p, personal: {...p.personal, email: v}}))}} icon={<FaEnvelope />} />
                  <FoundryInput label="Voice Node (Mobile)" value={resumeData.personal.mobile} onChange={(v: string) => { handleChange(); setResumeData(p => ({...p, personal: {...p.personal, mobile: v}}))}} icon={<FaPhone />} />
                  <div className="col-span-2">
                    <FoundryInput label="Physical Coordinates (Address)" value={resumeData.personal.address} onChange={(v: string) => { handleChange(); setResumeData(p => ({...p, personal: {...p.personal, address: v}}))}} icon={<FaMapMarkerAlt />} />
                  </div>
                  <div className="col-span-2">
                    <FoundryInput label="Digital Repository (GitHub)" value={resumeData.personal.github} onChange={(v: string) => { handleChange(); setResumeData(p => ({...p, personal: {...p.personal, github: v}}))}} icon={<FaGithub />} />
                  </div>
                </div>
              </ModuleWrapper>
            )}

            {/* Education Module */}
            {activeTab === 'education' && (
              <ModuleWrapper key="education">
                <RichTextEditor
                  blocks={editorBlocks['education'] || educationToBlocks(resumeData.education)}
                  onChange={(blocks) => {
                    handleChange();
                    setEditorBlocks(prev => ({...prev, education: blocks}));
                    setResumeData(prev => ({...prev, education: blocksToEducation(blocks)}));
                  }}
                />
              </ModuleWrapper>
            )}

            {/* Dynamic Modules */}
            {resumeData.sections.map(sec => activeTab === sec.id && (
              <ModuleWrapper key={sec.id}>
                <RichTextEditor
                  blocks={editorBlocks[sec.id] || sectionToBlocks(sec)}
                  onChange={(blocks) => {
                    handleChange();
                    setEditorBlocks(prev => ({...prev, [sec.id]: blocks}));
                    setResumeData(prev => ({
                      ...prev,
                      sections: prev.sections.map(s => s.id === sec.id ? blocksToSection(blocks, sec.id) : s)
                    }));
                  }}
                />
              </ModuleWrapper>
            ))}

            {/* Capabilities Module */}
            {activeTab === 'skills' && (
              <ModuleWrapper key="skills">
                <div className="grid grid-cols-2 gap-10 mt-8">
                  {resumeData.skills.map(skill => (
                    <div key={skill.id} className="bg-[#3a3a44] p-8 border border-gray-700/50 relative group hover:border-red-600/30 transition-all">
                      <button onClick={() => {
                        handleChange();
                        setResumeData(p => ({...p, skills: p.skills.filter(s => s.id !== skill.id)}));
                      }} className="absolute top-4 right-4 text-gray-700 hover:text-red-500 opacity-0 group-hover:opacity-100"><FaTrash className="text-xs" /></button>
                      <FoundryInput clean label="Domain" value={skill.category} onChange={(v: string) => setResumeData(p => ({...p, skills: p.skills.map(s => s.id === skill.id ? {...s, category: v} : s)}))} />
                      <div className="mt-8">
                         <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 block">Protocols / Tools</label>
                         <textarea className="w-full bg-transparent border border-gray-700/50 p-4 text-sm font-mono text-red-500 focus:border-red-600 focus:ring-0 min-h-[80px] resize-none" value={skill.name} onChange={e => setResumeData(p => ({...p, skills: p.skills.map(s => s.id === skill.id ? {...s, name: e.target.value} : s)}))} />
                      </div>
                    </div>
                  ))}
                  <button onClick={() => {
                     handleChange();
                     setResumeData(p => ({...p, skills: [...p.skills, { id: crypto.randomUUID(), category: "", name: "" }]}));
                  }} className="col-span-2 py-8 border border-dashed border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-500 uppercase font-black tracking-widest text-[10px]">+ Add New Capability</button>
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
      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
      <div className="h-[1px] w-4 bg-gray-800/50"></div>
    </div>
  )
}

function NavTab({ active, onClick, num, label, icon }: any) {
  return (
    <button onClick={onClick} className={clsx(
      "w-full group flex items-center px-4 py-5 rounded transition-all duration-300 relative",
      active ? "bg-[#3a3a44] border-l-4 border-red-600" : "hover:bg-white/5"
    )}>
      <span className={clsx("text-[10px] font-mono mr-4 transition-colors", active ? "text-red-500" : "text-gray-700")}>{num}</span>
      <div className={clsx("mr-3 text-sm transition-colors", active ? "text-red-500" : "text-gray-600 group-hover:text-gray-400")}>{icon}</div>
      <span className={clsx("text-[11px] font-black uppercase tracking-widest truncate transition-colors", active ? "text-gray-400" : "text-gray-500 group-hover:text-gray-400")}>{label}</span>
      {active && <motion.div layoutId="tabActive" className="absolute right-4 text-red-600"><FaChevronRight className="text-[10px]" /></motion.div>}
    </button>
  )
}

function ModuleWrapper({ children }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="pb-32">
      {children}
    </motion.div>
  )
}

function FoundryInput({ label, value, onChange, icon, clean }: any) {
  return (
    <div className="flex flex-col space-y-4 group/input">
      <div className="flex items-center space-x-2">
        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-focus-within/input:text-red-500 transition-colors">{label}</label>
        {icon && <span className="text-[10px] text-gray-600">{icon}</span>}
      </div>
      <input 
        className={clsx(
          "w-full bg-transparent p-0 text-xl font-medium text-gray-400 focus:ring-0 placeholder:text-gray-900 transition-all",
          !clean ? "border-b border-gray-700 focus:border-red-600" : "border-none"
        )}
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)} 
      />
    </div>
  )
}


