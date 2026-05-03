import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import localforage from 'localforage'
import type { ResumeData, TemplateSettings } from '../types/resume'
import type { RichTextBlock } from '../types/richText'
import { generateResumeTypst, getAccentColor } from '../utils/typstGenerators'
import { modulesToBlocks } from '../utils/resumeTransforms'
import { useTypstCompiler } from './useTypstCompiler'
import { historyService } from '../services/historyService'
import { SAMPLE_RESUME_DATA, RIREKISHO_SAMPLE_DATA } from '../data/sampleResume'
import { DEFAULT_TEMPLATE, findTemplateBySlug, RESUME_TEMPLATES } from '../data/templates'
import { parseMarkdownResume, generateMarkdownResume } from '../utils/markdownImporter'
import { generateId, skillsToBlocks, educationToBlocks, separateRirekiSections, EMPTY_RESUME_DATA } from '../utils/resumeEditorUtils'
import { FaUser, FaLayerGroup, FaWrench } from 'react-icons/fa'

export function useResumeEditor() {
  const templates = RESUME_TEMPLATES
  const { templateId } = useParams()
  const initialTemplate = findTemplateBySlug(templateId)

  const [resumeData, setResumeData] = useState<ResumeData>(EMPTY_RESUME_DATA)
  const [templateSettings, setTemplateSettings] = useState<TemplateSettings>(
    (initialTemplate ?? DEFAULT_TEMPLATE).settings
  )
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

  const { isCompiling, error: compileError, compile: triggerCompile, setPhoto, removePhoto } = useTypstCompiler({
    debounceMs: 400,
    onCompileResult,
  })

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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const templateIdVal = tpl?.id ?? 1
      compilingTemplateRef.current = templateIdVal
      triggerCompile(source, templateIdVal)
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
        const { regularSections, extraBlocks } = separateRirekiSections(saved.sections)
        if (regularSections.length > 0) {
          const blocks = modulesToBlocks(regularSections)
          const hasEduSection = regularSections.some(s => /education|学歴/i.test(s.title))
          if (saved.education?.length > 0 && !hasEduSection) {
            setModuleBlocks([...educationToBlocks(saved.education), ...blocks])
          } else {
            setModuleBlocks(blocks)
          }
        }
        if (saved.skillsBlocks && saved.skillsBlocks.length > 0) {
          setSkillsBlocks([...saved.skillsBlocks, ...extraBlocks])
        } else if (saved.skills && saved.skills.length > 0) {
          setSkillsBlocks([...skillsToBlocks(saved.skills), ...extraBlocks])
        } else if (extraBlocks.length > 0) {
          setSkillsBlocks(extraBlocks)
        }
        setResumeData({ ...saved, sections: regularSections })
      } else {
        const data = templateSettings.template === 'rirekisho' ? RIREKISHO_SAMPLE_DATA : SAMPLE_RESUME_DATA
        const { regularSections: regSec, extraBlocks: extBlk } = separateRirekiSections(data.sections)
        if (regSec.length > 0) {
          const blocks = modulesToBlocks(regSec)
          const hasEduSection = regSec.some(s => /education|学歴/i.test(s.title))
          if (data.education?.length > 0 && !hasEduSection) {
            setModuleBlocks([...educationToBlocks(data.education), ...blocks])
          } else {
            setModuleBlocks(blocks)
          }
        }
        if (data.skillsBlocks && data.skillsBlocks.length > 0) {
          setSkillsBlocks([...data.skillsBlocks, ...extBlk])
        } else if (data.skills && data.skills.length > 0) {
          setSkillsBlocks([...skillsToBlocks(data.skills), ...extBlk])
        } else if (extBlk.length > 0) {
          setSkillsBlocks(extBlk)
        }
        setResumeData({ ...data, sections: regSec })
        setIsSample(true)
      }
    })
  }, [])

  // Sync photo to worker
  useEffect(() => {
    const photo = resumeData.personal.photo
    if (photo?.url) {
      setPhoto(photo.url)
    } else {
      removePhoto()
    }
  }, [resumeData.personal.photo?.url, setPhoto, removePhoto])

  // Auto-compile whenever resume data or template changes
  // (initial compilation is the first invocation of this effect)
  useEffect(() => {
    if (!resumeData.personal.firstName && resumeData.sections.length === 0) return
    generateTypstNow(resumeData, skillsBlocks)
  }, [resumeData, skillsBlocks, templateSettings.template, generateTypstNow])

  const handleRefreshPreview = useCallback(() => {
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
    const openListener = () => openImportFile()
    window.addEventListener('openResumeJsonFile', openListener)
    return () => window.removeEventListener('openResumeJsonFile', openListener)
  }, [])

  useEffect(() => {
    if ((location.state as any)?.openImportFile) {
      openImportFile()
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location, navigate])

  const accentColor = useMemo(() => getAccentColor(templateSettings), [templateSettings])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const raw = reader.result as string
        const parsed = parseMarkdownResume(raw)
        const { regularSections, extraBlocks } = separateRirekiSections(parsed.sections)
        if (regularSections.length > 0) {
          const blocks = modulesToBlocks(regularSections)
          const hasEduSection = regularSections.some(s => /education|学歴/i.test(s.title))
          if (parsed.education?.length > 0 && !hasEduSection) {
            setModuleBlocks([...educationToBlocks(parsed.education), ...blocks])
          } else {
            setModuleBlocks(blocks)
          }
        }
        const baseSkills = parsed.skillsBlocks && parsed.skillsBlocks.length > 0 ? parsed.skillsBlocks : skillsToBlocks(parsed.skills)
        setSkillsBlocks([...baseSkills, ...extraBlocks])
        setResumeData({ ...parsed, sections: regularSections })
        setIsSample(false)
      } catch (e) { /* ignore parse errors */ }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const openImportFile = () => fileInputRef.current?.click()

  const saveToLocal = async (data: ResumeData) => {
    await localforage.setItem('current_resume_data', data)
    historyService.saveSnapshot(data)
  }

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

  const handleExportMarkdown = () => {
    const md = generateMarkdownResume({ ...resumeData, skillsBlocks })
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${resumeData.personal.firstName || 'resume'}-backup.md`
    a.click()
    URL.revokeObjectURL(url)
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
    const { regularSections, extraBlocks } = separateRirekiSections(data.sections)
    if (regularSections.length > 0) {
      const blocks = modulesToBlocks(regularSections)
      const hasEduSection = regularSections.some(s => /education|学歴/i.test(s.title))
      if (data.education?.length > 0 && !hasEduSection) {
        setModuleBlocks([...educationToBlocks(data.education), ...blocks])
      } else {
        setModuleBlocks(blocks)
      }
    }
    if (data.skillsBlocks && data.skillsBlocks.length > 0) {
      setSkillsBlocks([...data.skillsBlocks, ...extraBlocks])
    } else if (data.skills && data.skills.length > 0) {
      setSkillsBlocks([...skillsToBlocks(data.skills), ...extraBlocks])
    } else if (extraBlocks.length > 0) {
      setSkillsBlocks(extraBlocks)
    }
    setResumeData({ ...data, sections: regularSections })
    setIsSample(false)
  }

  const navItems = useMemo(() => {
    const items: { id: string; label: string; icon: React.ReactNode; onClick: () => void }[] = [
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

  useEffect(() => {
    if (!showNav) return
    const handler = () => setShowNav(false)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [showNav])

  return {
    resumeData,
    setResumeData,
    templateSettings,
    setTemplateSettings,
    moduleBlocks,
    setModuleBlocks,
    skillsBlocks,
    setSkillsBlocks,
    showHistory,
    setShowHistory,
    isSample,
    setIsSample,
    showNav,
    setShowNav,
    pdfUrl,
    compileError,
    isCompiling,
    accentColor,
    sectionTitles,
    currentTemplate,
    navItems,
    handleChange,
    photoInputRef,
    fileInputRef,
    handlePhotoClick,
    handlePhotoUpload,
    handlePhotoRemove,
    handleRefreshPreview,
    handleFileUpload,
    openImportFile,
    handleExportMarkdown,
    handleDownloadPdf,
    handleHistoryRestore,
    addSection,
  }
}
