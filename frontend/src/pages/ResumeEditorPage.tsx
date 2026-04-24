import { useState, useRef, useEffect, useCallback, type ChangeEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  FaPlus, FaTrash, FaSpinner,
  FaDownload, FaChevronRight, FaFingerprint,
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaGithub, FaLayerGroup, FaEye, FaUpload, FaWrench,
  FaHistory, FaFileDownload,
} from 'react-icons/fa'
import { motion } from 'framer-motion'
import localforage from 'localforage'
import { ResumeData, TemplateSettings, ResumeSection } from '../types/resume'
import type { RichTextBlock } from '../types/richText'
import { generateResumeTypst } from '../utils/typstGenerator'
import { modulesToBlocks, blocksToModules } from '../utils/resumeTransforms'
import { RichTextEditor } from '../components/RichTextEditor'
import { useTypstCompiler } from '../hooks/useTypstCompiler'
import HistoryPanel from '../components/HistoryPanel'
import { historyService } from '../services/historyService'
import { importExportService } from '../services/importExport'
import clsx from 'clsx'
import { SAMPLE_RESUME_DATA } from '../data/sampleResume'

const generateId = (prefix = 'id') => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 11)}`
}

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
  const [activeTab, setActiveTab] = useState('personal')
  const [moduleBlocks, setModuleBlocks] = useState<RichTextBlock[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [isSample, setIsSample] = useState(false)

  const { pdfBlobUrl, isCompiling, error: compileError, compile: triggerCompile } = useTypstCompiler({ debounceMs: 400 })

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const lastCompileSource = useRef('')
  const location = useLocation()
  const navigate = useNavigate()

  const handleChange = useCallback(() => {
    setIsSample(false)
  }, [])

  const generateTypstNow = useCallback((data: ResumeData) => {
    const source = generateResumeTypst(data, templateSettings)
    if (source !== lastCompileSource.current) {
      lastCompileSource.current = source
      triggerCompile(source)
    }
  }, [templateSettings, triggerCompile])

  // Load saved data on mount, fall back to sample
  useEffect(() => {
    localforage.getItem<ResumeData>('current_resume_data').then(saved => {
      if (saved) {
        setResumeData(saved)
        if (saved.sections.length > 0) {
          setModuleBlocks(modulesToBlocks(saved.sections))
        }
      } else {
        const data = SAMPLE_RESUME_DATA
        setResumeData(data)
        if (data.sections.length > 0) {
          setModuleBlocks(modulesToBlocks(data.sections))
        }
        setIsSample(true)
      }
    })
  }, [])

  // Trigger compilation when data changes (after initial load)
  useEffect(() => {
    if (resumeData.personal.firstName || resumeData.sections.length > 0) {
      generateTypstNow(resumeData)
    }
  }, [resumeData, generateTypstNow])

  useEffect(() => {
    if (moduleBlocks.length === 0 && resumeData.sections.length > 0) {
      setModuleBlocks(modulesToBlocks(resumeData.sections))
    }
  }, [resumeData.sections])

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

  const sanitizeJsonText = (raw: string) => {
    let inString = false
    let escaped = false
    let sanitized = ''
    for (let i = 0; i < raw.length; i += 1) {
      const char = raw[i]
      if (inString) {
        if (escaped) { sanitized += char; escaped = false; continue }
        if (char === '\\') { sanitized += char; escaped = true; continue }
        if (char === '"') { sanitized += char; inString = false; continue }
        if (char === '\r') { sanitized += '\\n'; if (raw[i + 1] === '\n') i += 1; continue }
        if (char === '\n') { sanitized += '\\n'; continue }
      } else if (char === '"') { inString = true }
      sanitized += char
    }
    return sanitized
  }

  const parseJsonWithFallback = (raw: string) => {
    try { return JSON.parse(raw) } catch (e) { return JSON.parse(sanitizeJsonText(raw)) }
  }

  const validateResumeFile = (data: any): data is ResumeData => {
    return data && typeof data === 'object' && data.personal && typeof data.personal === 'object'
  }

  const normalizeResumeData = (data: any): ResumeData => {
    const ensureId = (value: any, prefix: string) => typeof value === 'string' && value ? value : generateId(prefix)

    let sections: ResumeSection[] = Array.isArray(data.sections) ? data.sections.map((section: any, sectionIndex: number) => ({
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
      })) : [],
    })) : []

    if (Array.isArray(data.education) && data.education.length > 0 && !sections.some(s => s.title.toLowerCase() === 'education')) {
      const eduSection: ResumeSection = {
        id: generateId('sec-edu'),
        title: 'Education',
        entries: data.education.map((edu: any) => ({
          id: ensureId(edu.id, 'entry-edu'),
          title: String(edu.school || ''),
          subtitle: String(edu.degree || ''),
          location: edu.location ? String(edu.location) : undefined,
          startDate: String(edu.startDate || ''),
          endDate: edu.endDate ? String(edu.endDate) : undefined,
          description: edu.description ? String(edu.description) : undefined,
        }))
      }
      sections = [eduSection, ...sections]
    }

    return {
      personal: {
        firstName: String(data.personal?.firstName || ''),
        lastName: String(data.personal?.lastName || ''),
        position: String(data.personal?.position || ''),
        email: String(data.personal?.email || ''),
        mobile: String(data.personal?.mobile || ''),
        address: String(data.personal?.address || ''),
        github: String(data.personal?.github || ''),
      },
      education: [],
      sections,
      skills: Array.isArray(data.skills) ? data.skills.map((skill: any, skillIndex: number) => ({
        id: ensureId(skill.id || `skill-${skillIndex}`, 'sk'),
        category: String(skill.category || ''),
        name: String(skill.name || ''),
      })) : [],
    }
  }

  const handleJsonFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = parseJsonWithFallback(reader.result as string)
        if (!validateResumeFile(parsed)) { return }
        const normalized = normalizeResumeData(parsed)
        setResumeData(normalized)
        setModuleBlocks(modulesToBlocks(normalized.sections))
        setIsSample(false)
      } catch (e) { /* ignore parse errors */ }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const openJsonFile = () => fileInputRef.current?.click()

  const saveToLocal = async (data: ResumeData) => {
    await localforage.setItem('current_resume_data', data)
    historyService.saveSnapshot(data)
  }

  // Auto-save whenever resume data changes
  useEffect(() => {
    if (resumeData === emptyResumeData) return
    const timer = setTimeout(() => {
      saveToLocal(resumeData)
    }, 800)
    return () => clearTimeout(timer)
  }, [resumeData])

  const addSection = () => {
    handleChange()
    const newId = generateId('block')
    setModuleBlocks(prev => [...prev, { id: newId, type: 'h1', content: 'New Section' }])
    setActiveTab('modules')
    setTimeout(() => scrollToSection('modules'), 50)
  }

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(`section-${sectionId}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    const sectionIds = ['section-personal', 'section-modules', 'section-skills']
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible) setActiveTab(visible.target.id.replace('section-', ''))
    }, { threshold: [0, 0.1, 0.5], rootMargin: '-70px 0px -40% 0px' })
    sectionIds.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el) })
    return () => observer.disconnect()
  }, [])

  const handleDownloadPdf = () => {
    if (pdfBlobUrl) {
      const a = document.createElement('a')
      a.href = pdfBlobUrl
      const name = `${resumeData.personal.firstName || 'resume'}_${resumeData.personal.lastName || 'export'}.pdf`
      a.download = name
      a.click()
    }
  }

  const handlePreviewPdf = () => {
    if (pdfBlobUrl) {
      window.open(pdfBlobUrl, '_blank')
    }
  }

  const handleExportJson = () => {
    importExportService.downloadJson(resumeData, `${resumeData.personal.firstName || 'resume'}-backup.json`)
  }

  const handleHistoryRestore = (data: ResumeData) => {
    setResumeData(data)
    if (data.sections.length > 0) {
      setModuleBlocks(modulesToBlocks(data.sections))
    }
    setIsSample(false)
  }

  return (
    <div className="min-h-screen bg-[#1e1e22] font-sans text-gray-400 flex selection:bg-red-500/30">
      <aside className="w-[280px] bg-[#3a3a44] border-r border-gray-700/30 fixed top-14 bottom-0 left-0 z-40 flex flex-col">
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1 custom-scrollbar">
          <NavTab active={activeTab === 'personal'} onClick={() => scrollToSection('personal')} num="01" label="Identity" icon={<FaFingerprint />} />
          <div className="mt-6 flex items-center justify-between px-4 mb-2"><SectionDivider label="Modules" /><button onClick={addSection} className="text-gray-500 hover:text-red-500 transition-colors"><FaPlus className="text-xs" /></button></div>
          <NavTab active={activeTab === 'modules'} onClick={() => scrollToSection('modules')} num="02" label="Modules" icon={<FaLayerGroup />} />
          <SectionDivider label="Finalize" className="mt-6" />
          <NavTab active={activeTab === 'skills'} onClick={() => scrollToSection('skills')} num="--" label="Skills" icon={<FaWrench />} />
          <SectionDivider label="Data" className="mt-6" />
          <button onClick={() => setShowHistory(true)} className="w-full flex items-center px-4 py-5 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-300 transition-colors">
            <FaHistory className="mr-3 text-sm" />
            Time Machine
          </button>
        </nav>
      </aside>

      <main className="flex-1 ml-[280px] p-4 flex flex-col items-center bg-[#1e1e22]">
        <div className="w-full max-w-4xl flex items-center justify-between mb-8 bg-[#26262c] p-3 border border-gray-700/30 rounded-lg shadow-2xl sticky top-20 z-30">
          <div className="flex items-center space-x-4">
             <button onClick={openJsonFile} className="px-4 py-2 bg-[#3a3a44] border border-gray-700 hover:border-red-500 hover:bg-[#464650] text-gray-300 font-bold rounded flex items-center space-x-3 transition-all text-xs uppercase tracking-widest">
              <FaUpload className="text-xs" /> <span>Import JSON</span>
            </button>
            <input ref={fileInputRef} type="file" accept="application/json,.json" className="hidden" onChange={handleJsonFileUpload} />
            <button onClick={handleExportJson} className="px-4 py-2 bg-[#3a3a44] border border-gray-700 hover:border-emerald-500 hover:bg-[#464650] text-gray-300 font-bold rounded flex items-center space-x-3 transition-all text-xs uppercase tracking-widest">
              <FaFileDownload className="text-xs" /> <span>Export JSON</span>
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={handlePreviewPdf} disabled={isCompiling || !pdfBlobUrl} className="px-5 py-2 bg-[#3a3a44] border border-gray-700 hover:border-blue-500 hover:bg-[#464650] text-gray-300 font-bold rounded flex items-center space-x-3 transition-all text-xs uppercase tracking-widest disabled:opacity-50">
              {isCompiling ? <FaSpinner className="animate-spin" /> : <><FaEye className="text-xs" /> <span>Preview</span></>}
            </button>
            <button onClick={handleDownloadPdf} disabled={isCompiling || !pdfBlobUrl} className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded flex items-center space-x-3 transition-all text-xs uppercase tracking-widest disabled:opacity-50 shadow-[0_10px_30px_rgba(220,38,38,0.2)]">
              {isCompiling ? <FaSpinner className="animate-spin" /> : <><FaDownload className="text-xs" /> <span>Download PDF</span></>}
            </button>
          </div>
        </div>

        {compileError && (
          <div className="w-full max-w-4xl mb-4 p-4 bg-red-900/20 border border-red-800/30 rounded text-red-400 text-[11px] font-mono">
            Compilation warning: {compileError}
          </div>
        )}

        <div className={clsx("w-full max-w-4xl space-y-16 pb-20", isSample && "opacity-60")}>
          <section id="section-personal">
            <ModuleWrapper>
              <div className="grid grid-cols-1 gap-y-3 mt-8">
                <div className="grid grid-cols-2 gap-x-4">
                  <FoundryInput label="First Name" value={resumeData.personal.firstName} onChange={(v: string) => { handleChange(); setResumeData(prev => ({ ...prev, personal: { ...prev.personal, firstName: v } })); }} />
                  <FoundryInput label="Last Name" value={resumeData.personal.lastName} onChange={(v: string) => { handleChange(); setResumeData(prev => ({ ...prev, personal: { ...prev.personal, lastName: v } })); }} />
                </div>
                <FoundryInput label="System Designation" value={resumeData.personal.position} onChange={(v: string) => { handleChange(); setResumeData(prev => ({ ...prev, personal: { ...prev.personal, position: v } })); }} />
                <FoundryInput label="Communication Layer (Email)" value={resumeData.personal.email} onChange={(v: string) => { handleChange(); setResumeData(prev => ({ ...prev, personal: { ...prev.personal, email: v } })); }} icon={<FaEnvelope />} />
                <FoundryInput label="Voice Node (Mobile)" value={resumeData.personal.mobile} onChange={(v: string) => { handleChange(); setResumeData(prev => ({ ...prev, personal: { ...prev.personal, mobile: v } })); }} icon={<FaPhone />} />
                <FoundryInput label="Physical Coordinates (Address)" value={resumeData.personal.address} onChange={(v: string) => { handleChange(); setResumeData(prev => ({ ...prev, personal: { ...prev.personal, address: v } })); }} icon={<FaMapMarkerAlt />} />
                <FoundryInput label="Digital Repository (GitHub)" value={resumeData.personal.github} onChange={(v: string) => { handleChange(); setResumeData(prev => ({ ...prev, personal: { ...prev.personal, github: v } })); }} icon={<FaGithub />} />
              </div>
            </ModuleWrapper>
          </section>

          <section id="section-modules">
            <ModuleWrapper>
              <RichTextEditor
                blocks={moduleBlocks}
                onChange={(blocks) => {
                  handleChange()
                  setModuleBlocks(blocks)
                  const sections = blocksToModules(blocks)
                  setResumeData(prev => ({ ...prev, sections }))
                }}
              />
            </ModuleWrapper>
          </section>

          <section id="section-skills">
            <ModuleWrapper>
              <div className="grid grid-cols-2 gap-10 mt-8">
                {resumeData.skills.map(skill => (
                  <div key={skill.id} className="bg-[#3a3a44] p-8 border border-gray-700/50 relative group hover:border-red-600/30 transition-all">
                    <button onClick={() => { handleChange(); setResumeData(p => ({...p, skills: p.skills.filter(s => s.id !== skill.id)})); }} className="absolute top-4 right-4 text-gray-700 hover:text-red-500 opacity-0 group-hover:opacity-100"><FaTrash className="text-xs" /></button>
                    <FoundryInput clean label="Domain" value={skill.category} onChange={(v: string) => { handleChange(); setResumeData(p => ({...p, skills: p.skills.map(s => s.id === skill.id ? {...s, category: v} : s)})); }} />
                    <div className="mt-8"><label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-3 block">Protocols / Tools</label><textarea className="w-full bg-transparent border border-gray-700/50 p-4 text-sm font-mono text-red-500 focus:border-red-600 focus:ring-0 min-h-[80px] resize-none" value={skill.name} onChange={e => { handleChange(); setResumeData(p => ({...p, skills: p.skills.map(s => s.id === skill.id ? {...s, name: e.target.value} : s)})); }} /></div>
                  </div>
                ))}
                <button onClick={() => { handleChange(); setResumeData(p => ({...p, skills: [...p.skills, { id: generateId('sk'), category: "", name: "" }]})); }} className="col-span-2 py-8 border border-dashed border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-500 uppercase font-black tracking-widest text-[10px]">+ Add New Skill</button>
              </div>
            </ModuleWrapper>
          </section>
        </div>

        </main>

        <HistoryPanel
        open={showHistory}
        onClose={() => setShowHistory(false)}
        onRestore={handleHistoryRestore}
      />
    </div>
  )
}

function SectionDivider({ label, className }: any) {
  return <div className={clsx("flex items-center space-x-4 px-4 py-4", className)}><div className="h-[1px] flex-1 bg-gray-800/50"></div><span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span><div className="h-[1px] w-4 bg-gray-800/50"></div></div>
}

function NavTab({ active, onClick, num, label, icon, onDelete }: any) {
  return (
    <div className={clsx("w-full group flex items-center rounded transition-all duration-300 relative pr-2", active ? "bg-[#3a3a44] border-l-4 border-red-600" : "hover:bg-white/5")}>
      <button onClick={onClick} className="flex-1 flex items-center px-4 py-5 min-w-0">
        <span className={clsx("text-[10px] font-mono mr-4 transition-colors shrink-0", active ? "text-red-500" : "text-gray-700")}>{num}</span>
        <div className={clsx("mr-3 text-sm transition-colors shrink-0", active ? "text-red-500" : "text-gray-600 group-hover:text-gray-400")}>{icon}</div>
        <span className={clsx("text-[11px] font-black uppercase tracking-widest truncate transition-colors text-left", active ? "text-gray-400" : "text-gray-500 group-hover:text-gray-400")}>{label}</span>
      </button>
      {onDelete && <button onClick={onDelete} className={clsx("px-2 py-5 text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0", active && "mr-6")}><FaTrash className="text-xs" /></button>}
      {active && <motion.div layoutId="tabActive" className="absolute right-4 text-red-600"><FaChevronRight className="text-[10px]" /></motion.div>}
    </div>
  )
}

function ModuleWrapper({ children }: any) { return <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="pb-4">{children}</motion.div> }

function FoundryInput({ label, value, onChange, icon, clean }: any) {
  return (
    <div className="flex flex-col space-y-1 group/input">
      <div className="flex items-center space-x-2"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-focus-within/input:text-red-500 transition-colors">{label}</label>{icon && <span className="text-[10px] text-gray-600">{icon}</span>}</div>
      <input className={clsx("w-full bg-transparent py-2 text-sm font-medium text-gray-400 focus:ring-0 placeholder:text-gray-900 transition-all", !clean ? "border-b border-gray-700 focus:border-red-600" : "border-none")} value={value || ''} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}
