import { useState, useRef, useEffect, useCallback, useMemo, type ChangeEvent } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  FaPlus, FaSpinner,
  FaDownload, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLayerGroup, FaUpload, FaWrench,
  FaHistory, FaFileDownload, FaUser, FaBars, FaCamera, FaThLarge,
} from 'react-icons/fa'
import { motion } from 'framer-motion'
import localforage from 'localforage'
import { ResumeData, TemplateSettings, ResumeSection, Skill } from '../types/resume'
import type { RichTextBlock } from '../types/richText'
import { generateResumeTypst, getAccentColor } from '../utils/typstGenerator'
import { modulesToBlocks, blocksToModules } from '../utils/resumeTransforms'
import { RichTextEditor } from '../components/RichTextEditor'
import { useTypstCompiler } from '../hooks/useTypstCompiler'
import HistoryPanel from '../components/HistoryPanel'
import { historyService } from '../services/historyService'
import { importExportService } from '../services/importExport'
import clsx from 'clsx'
import { SAMPLE_RESUME_DATA } from '../data/sampleResume'
import { DEFAULT_TEMPLATE, findTemplateBySlug, RESUME_TEMPLATES } from '../data/templates'

const generateId = (prefix = 'id') => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 11)}`
}

function skillsToBlocks(skills: Skill[]): RichTextBlock[] {
  const byCategory: Record<string, string[]> = {}
  skills.forEach(s => {
    if (!byCategory[s.category]) byCategory[s.category] = []
    byCategory[s.category].push(s.name)
  })
  const blocks: RichTextBlock[] = []
  Object.entries(byCategory).forEach(([cat, names]) => {
    if (cat) blocks.push({ id: generateId('blk'), type: 'h2', content: cat })
    names.forEach(name => {
      if (name.trim()) blocks.push({ id: generateId('blk'), type: 'h3', content: name.trim() })
    })
  })
  return blocks
}

function blocksToSkills(blocks: RichTextBlock[]): Skill[] {
  const skills: Skill[] = []
  let currentCategory = ''
  blocks.forEach((block, i) => {
    if (block.type === 'h2') {
      currentCategory = block.content
    } else if (block.type === 'h3' || block.type === 'bullet' || block.type === 'paragraph') {
      if (block.content.trim()) {
        skills.push({ id: `sk-${i}`, category: currentCategory, name: block.content.trim() })
      }
    }
  })
  return skills
}

const EMPTY_RESUME_DATA: ResumeData = {
  personal: {
    firstName: '',
    lastName: '',
    position: '',
    email: '',
    mobile: '',
    address: '',
    homepage: '',
  },
  education: [],
  sections: [],
  skills: [],
}

export default function ResumeEditorPage() {
  const templates = RESUME_TEMPLATES
  const { templateId } = useParams()
  const initialTemplate = findTemplateBySlug(templateId)

  const [resumeData, setResumeData] = useState<ResumeData>(EMPTY_RESUME_DATA)
  const [templateSettings, setTemplateSettings] = useState<TemplateSettings>((initialTemplate ?? DEFAULT_TEMPLATE).settings)
  const [moduleBlocks, setModuleBlocks] = useState<RichTextBlock[]>([])
  const [skillsBlocks, setSkillsBlocks] = useState<RichTextBlock[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [isSample, setIsSample] = useState(false)
  const [showNav, setShowNav] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const pdfUrlRef = useRef<string | null>(null)
  const compilingTemplateRef = useRef(1)

  const onCompileResult = useCallback((pdfBytes: ArrayBuffer, compileId?: number) => {
    if (compileId && compileId !== compilingTemplateRef.current) return
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current)
    pdfUrlRef.current = url
    setPdfUrl(url)
  }, [])

  const { isCompiling, error: compileError, compile: triggerCompile, setPhoto, removePhoto } = useTypstCompiler({ debounceMs: 400, onCompileResult })

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const photoInputRef = useRef<HTMLInputElement | null>(null)
  const lastCompileSource = useRef('')
  const location = useLocation()
  const navigate = useNavigate()
  const handleChange = useCallback(() => {
    setIsSample(false)
  }, [])

  useEffect(() => {
    const selectedTemplate = findTemplateBySlug(templateId)
    if (!selectedTemplate) {
      navigate('/templates', { replace: true })
      return
    }
    setTemplateSettings(selectedTemplate.settings)
  }, [templateId, navigate])

  const handlePhotoClick = () => {
    photoInputRef.current?.click()
  }

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    handleChange()
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setPhoto(dataUrl)
      setResumeData(prev => ({
        ...prev,
        personal: {
          ...prev.personal,
          photo: { url: dataUrl, shape: 'circle' },
        },
      }))
    }
    reader.readAsDataURL(file)
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  const handlePhotoRemove = () => {
    removePhoto()
    setResumeData(prev => ({
      ...prev,
      personal: {
        ...prev.personal,
        photo: undefined,
      },
    }))
  }

  const generateTypstNow = useCallback((data: ResumeData, skillsBlocks?: RichTextBlock[]) => {
    const source = generateResumeTypst(data, templateSettings, skillsBlocks)
    if (source !== lastCompileSource.current) {
      lastCompileSource.current = source
      const tpl = templates.find(t => t.settings.template === templateSettings.template)
      const templateId = tpl?.id ?? 1
      compilingTemplateRef.current = templateId
      triggerCompile(source, templateId)
    }
  }, [templateSettings, triggerCompile, templates])

  useEffect(() => {
    return () => {
      if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current)
    }
  }, [])

  // Load saved data on mount, fall back to sample
  useEffect(() => {
    localforage.getItem<ResumeData>('current_resume_data').then(saved => {
      if (saved) {
        setResumeData(saved)
        if (saved.sections.length > 0) {
          setModuleBlocks(modulesToBlocks(saved.sections))
        }
        if (saved.skillsBlocks && saved.skillsBlocks.length > 0) {
          setSkillsBlocks(saved.skillsBlocks)
        } else if (saved.skills && saved.skills.length > 0) {
          setSkillsBlocks(skillsToBlocks(saved.skills))
        }
      } else {
        const data = SAMPLE_RESUME_DATA
        setResumeData(data)
        if (data.sections.length > 0) {
          setModuleBlocks(modulesToBlocks(data.sections))
        }
        if (data.skills && data.skills.length > 0) {
          setSkillsBlocks(skillsToBlocks(data.skills))
        }
        setIsSample(true)
      }
    })
  }, [])

  // Sync photo to worker when it changes (runs before compile effect for FIFO ordering)
  useEffect(() => {
    const photo = resumeData.personal.photo
    if (photo?.url) {
      setPhoto(photo.url)
    } else {
      removePhoto()
    }
  }, [resumeData.personal.photo?.url, setPhoto, removePhoto])

  // Trigger compilation when data changes (after initial load)
  useEffect(() => {
    if (resumeData.personal.firstName || resumeData.sections.length > 0) {
      generateTypstNow(resumeData, skillsBlocks)
    }
  }, [resumeData, skillsBlocks, generateTypstNow])

  useEffect(() => {
    if (moduleBlocks.length === 0 && resumeData.sections.length > 0) {
      setModuleBlocks(modulesToBlocks(resumeData.sections))
    }
  }, [resumeData.sections])

  useEffect(() => {
    if (skillsBlocks.length === 0 && resumeData.skills.length > 0) {
      setSkillsBlocks(skillsToBlocks(resumeData.skills))
    }
  }, [resumeData.skills])

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

  const accentColor = useMemo(() => getAccentColor(templateSettings), [templateSettings])

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
        homepage: String(data.personal?.homepage || ''),
        photo: data.personal?.photo ? {
          url: String(data.personal.photo.url || ''),
          shape: (data.personal.photo.shape === 'circle' || data.personal.photo.shape === 'rectangle') ? data.personal.photo.shape : 'circle',
        } : undefined,
      },
      education: [],
      sections,
      skills: Array.isArray(data.skills) ? data.skills.map((skill: any, skillIndex: number) => ({
        id: ensureId(skill.id || `skill-${skillIndex}`, 'sk'),
        category: String(skill.category || ''),
        name: String(skill.name || ''),
      })) : [],
      skillsBlocks: Array.isArray(data.skillsBlocks) ? data.skillsBlocks : undefined,
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
        setSkillsBlocks(normalized.skillsBlocks && normalized.skillsBlocks.length > 0 ? normalized.skillsBlocks : skillsToBlocks(normalized.skills))
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

  // Auto-save whenever resume data or skills blocks change
  useEffect(() => {
    if (resumeData === EMPTY_RESUME_DATA) return
    const timer = setTimeout(() => {
      saveToLocal({ ...resumeData, skillsBlocks })
    }, 800)
    return () => clearTimeout(timer)
  }, [resumeData, skillsBlocks])

  const addSection = () => {
    handleChange()
    const newId = generateId('block')
    setModuleBlocks(prev => [...prev, { id: newId, type: 'h1', content: 'New Section' }])
    setTimeout(() => scrollToSection('modules'), 50)
  }

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(`section-${sectionId}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const scrollToBlock = (blockId: string) => {
    scrollToSection('modules')
    setTimeout(() => {
      const el = document.querySelector(`[data-block-id="${blockId}"]`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }

  const sectionTitles = useMemo(
    () => moduleBlocks.filter(b => b.type === 'h1').map(b => ({ id: b.id, title: b.content || 'Untitled' })),
    [moduleBlocks]
  )

  const handleExportJson = () => {
    const exportData = { ...resumeData, skillsBlocks }
    importExportService.downloadJson(exportData, `${resumeData.personal.firstName || 'resume'}-backup.json`)
  }

  const currentTemplate = useMemo(
    () => templates.find(t => t.settings.template === templateSettings.template) ?? DEFAULT_TEMPLATE,
    [templateSettings.template, templates]
  )

  const handleDownloadPdf = () => {
    if (!pdfUrl) return
    const a = document.createElement('a')
    a.href = pdfUrl
    a.download = `${resumeData.personal.firstName || 'resume'}_${resumeData.personal.lastName || 'export'}.pdf`
    a.click()
  }

  const handleHistoryRestore = (data: ResumeData) => {
    setResumeData(data)
    if (data.sections.length > 0) {
      setModuleBlocks(modulesToBlocks(data.sections))
    }
    if (data.skillsBlocks && data.skillsBlocks.length > 0) {
      setSkillsBlocks(data.skillsBlocks)
    } else if (data.skills && data.skills.length > 0) {
      setSkillsBlocks(skillsToBlocks(data.skills))
    }
    setIsSample(false)
  }

  const navItems = useMemo(() => {
    const items: { id: string; label: string; icon: any; onClick: () => void }[] = [
      { id: 'personal', label: 'Personal Info', icon: <FaUser />, onClick: () => { scrollToSection('personal'); setShowNav(false) } },
    ]
    sectionTitles.forEach(sec => {
      items.push({
        id: sec.id,
        label: sec.title,
        icon: <FaLayerGroup />,
        onClick: () => { scrollToBlock(sec.id); setShowNav(false) },
      })
    })
    items.push(
      { id: 'skills', label: 'Skills', icon: <FaWrench />, onClick: () => { scrollToSection('skills'); setShowNav(false) } },
    )
    return items
  }, [sectionTitles])

  // Close nav on click outside
  useEffect(() => {
    if (!showNav) return
    const handler = () => setShowNav(false)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [showNav])

  return (
    <div className="min-h-[calc(100vh-55px)] lg:h-[calc(100vh-55px)] bg-[#f0efed] flex flex-col selection:bg-[rgba(0,117,222,0.15)]">
      {/* Toolbar */}
      <div className="shrink-0 bg-white border-b border-[rgba(0,0,0,0.1)] px-4 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {/* Nav hamburger */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowNav(!showNav) }}
                className="px-2.5 py-1.5 rounded-md text-sm text-warm-500 hover:bg-[rgba(0,0,0,0.05)] hover:text-[rgba(0,0,0,0.95)] transition-all flex items-center gap-1.5"
              >
                <FaBars className="text-xs" />
                <span className="hidden sm:inline text-xs">Sections</span>
              </button>
              {showNav && (
                  <div
                    className="absolute top-full left-0 mt-1 w-52 bg-white border border-[rgba(0,0,0,0.1)] rounded-lg shadow-deep py-1 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-3 py-1.5 text-xs font-medium text-warm-400">
                      <button onClick={addSection} className="w-full flex items-center justify-between hover:text-[#0075de] transition-colors">
                        <span>Add section</span>
                        <FaPlus className="text-[10px]" />
                      </button>
                    </div>
                    <div className="h-px bg-[rgba(0,0,0,0.06)] mx-3 my-1" />
                    {navItems.map(item => (
                      <button
                        key={item.id}
                        onClick={item.onClick}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-warm-500 hover:bg-[rgba(0,0,0,0.04)] hover:text-[rgba(0,0,0,0.95)] transition-colors"
                      >
                        <span className="text-warm-300 text-xs">{item.icon}</span>
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span className="w-px h-5 bg-[rgba(0,0,0,0.1)]" />

              <button
                onClick={openJsonFile}
                className="px-2.5 py-1.5 rounded-md text-sm text-warm-500 hover:bg-[rgba(0,0,0,0.05)] hover:text-[rgba(0,0,0,0.95)] transition-all flex items-center gap-1.5"
              >
                <FaUpload className="text-xs" />
                <span className="hidden sm:inline text-xs">Import</span>
              </button>
              <input ref={fileInputRef} type="file" accept="application/json,.json" className="hidden" onChange={handleJsonFileUpload} />
              <button
                onClick={handleExportJson}
                className="px-2.5 py-1.5 rounded-md text-sm text-warm-500 hover:bg-[rgba(0,0,0,0.05)] hover:text-[rgba(0,0,0,0.95)] transition-all flex items-center gap-1.5"
              >
                <FaFileDownload className="text-xs" />
                <span className="hidden sm:inline text-xs">Export</span>
              </button>

              <span className="w-px h-5 bg-[rgba(0,0,0,0.1)]" />

              <button
                onClick={() => setShowHistory(true)}
                className="px-2.5 py-1.5 rounded-md text-sm text-warm-500 hover:bg-[rgba(0,0,0,0.05)] hover:text-[rgba(0,0,0,0.95)] transition-all flex items-center gap-1.5"
              >
                <FaHistory className="text-xs" />
                <span className="hidden sm:inline text-xs">History</span>
              </button>

              <span className="w-px h-5 bg-[rgba(0,0,0,0.1)]" />

              <button
                onClick={() => navigate('/templates')}
                className="px-2.5 py-1.5 rounded-md text-sm text-warm-500 hover:bg-[rgba(0,0,0,0.05)] hover:text-[rgba(0,0,0,0.95)] transition-all flex items-center gap-1.5"
              >
                <FaThLarge className="text-xs" />
                <span className="hidden sm:inline text-xs">Change Template</span>
              </button>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs text-warm-400">Template</span>
              <span className="text-xs font-semibold text-[rgba(0,0,0,0.95)]">{currentTemplate.name}</span>
            </div>

          </div>
        </div>
      </div>

      {/* Main content: editor + current preview */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left: Editor */}
          <div className="flex-1 overflow-y-auto">
            {compileError && (
              <div className="px-4 pt-4">
                <div className="p-3 rounded-lg bg-[rgba(221,91,0,0.06)] border border-[rgba(221,91,0,0.15)] text-warm-600 text-xs">
                  {compileError}
                </div>
              </div>
            )}

            <div className={clsx("px-3 sm:px-4 py-4 sm:py-6 space-y-6 pb-8 lg:pb-24", isSample && "opacity-60")}>
              <section id="section-personal">
                <SectionCard title="Personal Information">
                  <div className="flex flex-col sm:flex-row gap-6 mt-4">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                      <NotionInput label="First Name" value={resumeData.personal.firstName} onChange={(v) => { handleChange(); setResumeData(prev => ({ ...prev, personal: { ...prev.personal, firstName: v } })) }} />
                      <NotionInput label="Last Name" value={resumeData.personal.lastName} onChange={(v) => { handleChange(); setResumeData(prev => ({ ...prev, personal: { ...prev.personal, lastName: v } })) }} />
                      <NotionInput label="Position / Title" value={resumeData.personal.position} onChange={(v) => { handleChange(); setResumeData(prev => ({ ...prev, personal: { ...prev.personal, position: v } })) }} />
                      <NotionInput label="Phone" value={resumeData.personal.mobile} onChange={(v) => { handleChange(); setResumeData(prev => ({ ...prev, personal: { ...prev.personal, mobile: v } })) }} icon={<FaPhone />} />
                      <NotionInput label="Homepage" value={resumeData.personal.homepage ?? ''} onChange={(v) => { handleChange(); setResumeData(prev => ({ ...prev, personal: { ...prev.personal, homepage: v } })) }} icon={<FaUser />} />
                      <NotionInput label="Email" value={resumeData.personal.email} onChange={(v) => { handleChange(); setResumeData(prev => ({ ...prev, personal: { ...prev.personal, email: v } })) }} icon={<FaEnvelope />} />
                      <div className="sm:col-span-2">
                        <NotionInput label="Address" value={resumeData.personal.address} onChange={(v) => { handleChange(); setResumeData(prev => ({ ...prev, personal: { ...prev.personal, address: v } })) }} icon={<FaMapMarkerAlt />} />
                      </div>
                    </div>
                    {/* Photo upload area */}
                    <div className="w-full sm:w-[130px] flex-shrink-0 flex flex-col items-center justify-start pt-1">
                      <div
                        className="w-[130px] h-[150px] rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-warm-400 hover:bg-warm-50 transition-colors overflow-hidden relative group"
                        onClick={handlePhotoClick}
                      >
                        {resumeData.personal.photo?.url ? (
                          <>
                            <img src={resumeData.personal.photo.url} alt="Profile" className="w-full h-full object-contain" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <FaCamera className="text-white text-xl" />
                            </div>
                          </>
                        ) : (
                          <FaCamera className="text-gray-300 text-2xl" />
                        )}
                      </div>
                      {resumeData.personal.photo?.url ? (
                        <button onClick={handlePhotoRemove} className="text-xs text-warm-500 mt-1.5 hover:text-red-500 transition-colors">
                          Remove
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-400 mt-1.5">Photo</span>
                      )}
                      <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    </div>
                  </div>
                </SectionCard>
              </section>

              <section id="section-modules">
                <SectionCard title="Resume Modules" subtitle="Add and arrange your resume sections with the rich text editor">
                  <div className="mt-4">
                    <RichTextEditor
                      blocks={moduleBlocks}
                      onChange={(blocks) => {
                        handleChange()
                        setModuleBlocks(blocks)
                        const sections = blocksToModules(blocks)
                        setResumeData(prev => ({ ...prev, sections }))
                      }}
                      headingColor={accentColor}
                    />
                  </div>
                </SectionCard>
              </section>

              <section id="section-skills">
                <SectionCard title="Expertise" subtitle="Use H2 for category names and H3/bullet for individual skills">
                  <div className="mt-4">
                    <RichTextEditor
                      blocks={skillsBlocks}
                      onChange={(blocks) => {
                        handleChange()
                        setSkillsBlocks(blocks)
                        setResumeData(p => ({ ...p, skills: blocksToSkills(blocks) }))
                      }}
                      headingColor={accentColor}
                    />
                  </div>
                </SectionCard>
              </section>
            </div>
          </div>

          {/* Right: Current PDF preview */}
          <div className="min-h-[300px] sm:min-h-[520px] lg:min-h-0 lg:h-auto lg:w-[760px] xl:w-[860px] border-t lg:border-t-0 lg:border-l border-[rgba(0,0,0,0.1)] bg-white flex flex-col">
            <div className="shrink-0 px-5 py-3 border-b border-[rgba(0,0,0,0.1)] flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-[rgba(0,0,0,0.95)]">{currentTemplate.name} Preview</h3>
                <p className="text-xs text-warm-500 mt-0.5">Current template PDF preview</p>
              </div>
              <button
                onClick={handleDownloadPdf}
                disabled={isCompiling || !pdfUrl}
                className="text-xs font-medium px-3 py-1.5 rounded-md bg-[#0075de] text-white hover:bg-[#005bab] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none"
              >
                {isCompiling ? <FaSpinner className="animate-spin" /> : <FaDownload className="text-[10px]" />}
                PDF
              </button>
            </div>
            <div className="flex-1 p-4 bg-[#f0efed]">
              {pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  className="w-full h-full rounded-standard shadow-sm border border-[rgba(0,0,0,0.1)] bg-white"
                  title={`${currentTemplate.name} PDF Preview`}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-warm-400 text-sm">
                  {isCompiling ? 'Compiling...' : 'Generating preview...'}
                </div>
              )}
            </div>
          </div>
        </div>

      <HistoryPanel open={showHistory} onClose={() => setShowHistory(false)} onRestore={handleHistoryRestore} />
    </div>
  )
}

/* ===== Sub-Components ===== */

function SectionCard({ title, subtitle, children }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-[rgba(0,0,0,0.1)] p-6 shadow-sm">
      <div className="mb-0.5">
        <h2 className="text-lg font-semibold text-[rgba(0,0,0,0.95)] tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-warm-500 mt-1 leading-relaxed">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  )
}

function NotionInput({ label, value, onChange, icon, clean }: { label?: string; value?: string; onChange: (v: string) => void; icon?: React.ReactNode; clean?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5 group/input">
      {label && (
        <label className="text-xs font-medium text-warm-500 group-focus-within/input:text-[#0075de] transition-colors flex items-center gap-1.5">
          {label}
          {icon && <span className="text-warm-300">{icon}</span>}
        </label>
      )}
      {clean ? (
        <input
          className="w-full bg-transparent py-1.5 text-sm text-[rgba(0,0,0,0.95)] border-b border-[rgba(0,0,0,0.1)] focus:border-[#0075de] focus:outline-none transition-colors placeholder:text-warm-300"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={label || ''}
        />
      ) : (
        <input
          className="input text-sm py-[7px]"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={label || ''}
        />
      )}
    </div>
  )
}
