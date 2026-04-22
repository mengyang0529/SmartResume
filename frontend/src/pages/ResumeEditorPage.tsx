import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { 
  FaEdit, FaDownload, FaPlus, FaTrash, FaArrowUp, FaArrowDown,
  FaUser, FaGraduationCap, FaBriefcase, FaTools, FaSpinner, 
  FaSave, FaChevronRight, FaPalette, FaCog, FaCheckCircle
} from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { ResumeData, TemplateSettings, Experience, Education, Skill } from '../types/resume'
import { generateResumeTypst } from '../utils/typstGenerator'
import { pdfApi } from '../services/api'
import clsx from 'clsx'

const SECTIONS = [
  { id: 'personal', label: 'Personal', icon: <FaUser /> },
  { id: 'summary', label: 'Summary', icon: <FaEdit /> },
  { id: 'experience', label: 'Experience', icon: <FaBriefcase /> },
  { id: 'education', label: 'Education', icon: <FaGraduationCap /> },
  { id: 'skills', label: 'Skills', icon: <FaTools /> },
]

export default function ResumeEditorPage() {
  const { templateId } = useParams()
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData)
  const [templateSettings, setTemplateSettings] = useState<TemplateSettings>(defaultTemplateSettings)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [activeSection, setActiveSection] = useState('personal')
  const [isSaved, setIsSaved] = useState(true)
  
  const sectionRefs = {
    personal: useRef<HTMLDivElement>(null),
    summary: useRef<HTMLDivElement>(null),
    experience: useRef<HTMLDivElement>(null),
    education: useRef<HTMLDivElement>(null),
    skills: useRef<HTMLDivElement>(null),
  }

  // Load template data
  useEffect(() => {
    const savedData = localStorage.getItem('current_resume_data')
    const savedSettings = localStorage.getItem('current_template_settings')
    
    if (savedData) {
      try {
        setResumeData(JSON.parse(savedData))
      } catch (e) {
        console.error('Failed to parse saved resume data', e)
      }
    }
    
    if (savedSettings) {
      try {
        setTemplateSettings(JSON.parse(savedSettings))
      } catch (e) {
        console.error('Failed to parse saved template settings', e)
      }
    }
  }, [templateId])

  const saveToLocalStorage = (data: ResumeData, settings: TemplateSettings) => {
    localStorage.setItem('current_resume_data', JSON.stringify(data))
    localStorage.setItem('current_template_settings', JSON.stringify(settings))
    setIsSaved(true)
  }

  const handleChange = () => setIsSaved(false)

  const handlePersonalInfoChange = (field: keyof typeof resumeData.personal, value: string) => {
    handleChange()
    setResumeData(prev => ({
      ...prev,
      personal: { ...prev.personal, [field]: value }
    }))
  }

  const handleTemplateSettingChange = (field: keyof TemplateSettings, value: any) => {
    handleChange()
    setTemplateSettings(prev => ({ ...prev, [field]: value }))
  }

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    const ref = sectionRefs[sectionId as keyof typeof sectionRefs]
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Generic array update helpers
  const addItem = <T extends { id: string }>(field: keyof ResumeData, newItem: T) => {
    handleChange()
    setResumeData(prev => {
      const currentArray = (prev[field] as T[]) || []
      return { ...prev, [field]: [...currentArray, newItem] }
    })
  }

  const updateItem = <T extends { id: string }>(field: keyof ResumeData, id: string, updates: Partial<T>) => {
    handleChange()
    setResumeData(prev => {
      const currentArray = (prev[field] as T[]) || []
      return {
        ...prev,
        [field]: currentArray.map(item => item.id === id ? { ...item, ...updates } : item)
      }
    })
  }

  const removeItem = (field: keyof ResumeData, id: string) => {
    handleChange()
    setResumeData(prev => {
      const currentArray = (prev[field] as any[]) || []
      return { ...prev, [field]: currentArray.filter(item => item.id !== id) }
    })
  }

  const moveItem = (field: keyof ResumeData, id: string, direction: 'up' | 'down') => {
    handleChange()
    setResumeData(prev => {
      const currentArray = [...((prev[field] as any[]) || [])]
      const index = currentArray.findIndex(item => item.id === id)
      if (index === -1) return prev
      if (direction === 'up' && index === 0) return prev
      if (direction === 'down' && index === currentArray.length - 1) return prev

      const targetIndex = direction === 'up' ? index - 1 : index + 1
      const [movedItem] = currentArray.splice(index, 1)
      currentArray.splice(targetIndex, 0, movedItem)

      return { ...prev, [field]: currentArray }
    })
  }

  const handleGeneratePDF = async () => {
    setIsGeneratingPdf(true)
    const typst = generateResumeTypst(resumeData, templateSettings)
    
    try {
      const result = await pdfApi.generateFromTypst(typst)
      if (result.cacheKey) {
        window.open(pdfApi.downloadPdf(result.cacheKey), '_blank')
        toast.success('PDF generated successfully!')
        saveToLocalStorage(resumeData, templateSettings)
      }
    } catch (error) {
      console.error('Failed to generate PDF', error)
      toast.error('Failed to generate PDF. Please try again.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">SmartResume Editor</h1>
              <div className="flex items-center space-x-2 text-sm">
                <span className={clsx(
                  "flex items-center space-x-1",
                  isSaved ? "text-green-600" : "text-amber-500"
                )}>
                  {isSaved ? <FaCheckCircle /> : <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
                  <span>{isSaved ? 'All changes saved' : 'Unsaved changes'}</span>
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => {
                saveToLocalStorage(resumeData, templateSettings)
                toast.success('Progress saved')
              }}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span className="flex items-center">
                <FaSave className="mr-2" />
                Save
              </span>
            </button>
            <button 
              onClick={handleGeneratePDF}
              disabled={isGeneratingPdf}
              className="bg-[#0395DE] hover:bg-[#027bb8] text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-all shadow-lg shadow-blue-500/20 flex items-center disabled:opacity-50"
            >
              {isGeneratingPdf ? <FaSpinner className="mr-2 animate-spin" /> : <FaDownload className="mr-2" />}
              Generate PDF
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-12 gap-8">
        {/* Left Nav Rail */}
        <aside className="col-span-2">
          <nav className="sticky top-28 space-y-1">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={clsx(
                  "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-sm font-medium",
                  activeSection === section.id 
                    ? "bg-white text-[#0395DE] shadow-sm border border-gray-100" 
                    : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                )}
              >
                <div className="flex items-center space-x-3">
                  <span className={clsx(
                    "text-lg",
                    activeSection === section.id ? "text-[#0395DE]" : "text-gray-400"
                  )}>
                    {section.icon}
                  </span>
                  <span>{section.label}</span>
                </div>
                {activeSection === section.id && <FaChevronRight className="text-[10px]" />}
              </button>
            ))}
          </nav>
        </aside>

        {/* Center Content Area */}
        <div className="col-span-7 space-y-10 pb-32">
          {/* Personal Info Card */}
          <section ref={sectionRefs.personal} id="personal">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-[#0395DE]">
                  <FaUser />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Personal Information</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <InputField 
                  label="First Name" 
                  value={resumeData.personal.firstName} 
                  onChange={(v) => handlePersonalInfoChange('firstName', v)} 
                  placeholder="e.g. John"
                />
                <InputField 
                  label="Last Name" 
                  value={resumeData.personal.lastName} 
                  onChange={(v) => handlePersonalInfoChange('lastName', v)} 
                  placeholder="e.g. Doe"
                />
                <div className="md:col-span-2">
                  <InputField 
                    label="Professional Position" 
                    value={resumeData.personal.position} 
                    onChange={(v) => handlePersonalInfoChange('position', v)} 
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>
                <InputField 
                  label="Email" 
                  type="email" 
                  value={resumeData.personal.email} 
                  onChange={(v) => handlePersonalInfoChange('email', v)} 
                  placeholder="john@example.com"
                />
                <InputField 
                  label="Mobile" 
                  value={resumeData.personal.mobile || ''} 
                  onChange={(v) => handlePersonalInfoChange('mobile', v)} 
                  placeholder="+1 234 567 890"
                />
                <div className="md:col-span-2">
                  <InputField 
                    label="Address" 
                    value={resumeData.personal.address || ''} 
                    onChange={(v) => handlePersonalInfoChange('address', v)} 
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Summary Card */}
          <section ref={sectionRefs.summary} id="summary">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <FaEdit />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Professional Summary</h2>
              </div>
              <textarea
                className="w-full bg-[#F8FAFC] border-none rounded-2xl p-4 min-h-[160px] text-gray-800 focus:ring-2 focus:ring-[#0395DE] transition-all"
                placeholder="Briefly describe your professional background and key strengths..."
                value={resumeData.summary || ''}
                onChange={(e) => {
                  handleChange()
                  setResumeData(prev => ({ ...prev, summary: e.target.value }))
                }}
              />
            </div>
          </section>

          {/* Experience Card */}
          <section ref={sectionRefs.experience} id="experience">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <FaBriefcase />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Work Experience</h2>
                </div>
                <button
                  onClick={() => addItem<Experience>('experience', {
                    id: crypto.randomUUID(),
                    company: '',
                    position: '',
                    startDate: '',
                    endDate: '',
                    description: '',
                    highlights: []
                  })}
                  className="flex items-center space-x-2 text-[#0395DE] font-semibold text-sm hover:opacity-80 transition-opacity"
                >
                  <FaPlus className="text-[10px]" />
                  <span>Add Experience</span>
                </button>
              </div>
              
              <div className="space-y-6">
                <AnimatePresence>
                  {resumeData.experience.map((exp, index) => (
                    <motion.div 
                      key={exp.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-6 bg-[#F8FAFC] rounded-2xl relative group"
                    >
                      <div className="absolute right-4 top-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ActionButton icon={<FaArrowUp />} onClick={() => moveItem('experience', exp.id, 'up')} />
                        <ActionButton icon={<FaArrowDown />} onClick={() => moveItem('experience', exp.id, 'down')} />
                        <ActionButton icon={<FaTrash />} onClick={() => removeItem('experience', exp.id)} variant="danger" />
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                          <InputField 
                            label="Company" 
                            value={exp.company} 
                            onChange={(v) => updateItem<Experience>('experience', exp.id, { company: v })} 
                          />
                        </div>
                        <InputField 
                          label="Position" 
                          value={exp.position} 
                          onChange={(v) => updateItem<Experience>('experience', exp.id, { position: v })} 
                        />
                        <InputField 
                          label="Location" 
                          value={exp.location || ''} 
                          onChange={(v) => updateItem<Experience>('experience', exp.id, { location: v })} 
                        />
                        <InputField 
                          label="Start Date" 
                          placeholder="e.g. Jan 2020"
                          value={exp.startDate} 
                          onChange={(v) => updateItem<Experience>('experience', exp.id, { startDate: v })} 
                        />
                        <InputField 
                          label="End Date" 
                          placeholder="e.g. Present"
                          value={exp.endDate || ''} 
                          onChange={(v) => updateItem<Experience>('experience', exp.id, { endDate: v })} 
                        />
                        <div className="md:col-span-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Description</label>
                          <textarea
                            className="w-full bg-white border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#0395DE] transition-all min-h-[100px]"
                            value={exp.description || ''}
                            onChange={(e) => updateItem<Experience>('experience', exp.id, { description: e.target.value })}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* Education Card */}
          <section ref={sectionRefs.education} id="education">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <FaGraduationCap />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Education</h2>
                </div>
                <button
                  onClick={() => addItem<Education>('education', {
                    id: crypto.randomUUID(),
                    school: '',
                    degree: '',
                    field: '',
                    startDate: '',
                    endDate: '',
                  })}
                  className="flex items-center space-x-2 text-[#0395DE] font-semibold text-sm hover:opacity-80 transition-opacity"
                >
                  <FaPlus className="text-[10px]" />
                  <span>Add Education</span>
                </button>
              </div>
              
              <div className="space-y-6">
                <AnimatePresence>
                  {resumeData.education.map((edu) => (
                    <motion.div 
                      key={edu.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-6 bg-[#F8FAFC] rounded-2xl relative group"
                    >
                      <div className="absolute right-4 top-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ActionButton icon={<FaArrowUp />} onClick={() => moveItem('education', edu.id, 'up')} />
                        <ActionButton icon={<FaArrowDown />} onClick={() => moveItem('education', edu.id, 'down')} />
                        <ActionButton icon={<FaTrash />} onClick={() => removeItem('education', edu.id)} variant="danger" />
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                          <InputField 
                            label="School / University" 
                            value={edu.school} 
                            onChange={(v) => updateItem<Education>('education', edu.id, { school: v })} 
                          />
                        </div>
                        <InputField 
                          label="Degree" 
                          value={edu.degree} 
                          onChange={(v) => updateItem<Education>('education', edu.id, { degree: v })} 
                        />
                        <InputField 
                          label="Field of Study" 
                          value={edu.field || ''} 
                          onChange={(v) => updateItem<Education>('education', edu.id, { field: v })} 
                        />
                        <InputField 
                          label="Start Date" 
                          value={edu.startDate} 
                          onChange={(v) => updateItem<Education>('education', edu.id, { startDate: v })} 
                        />
                        <InputField 
                          label="End Date" 
                          value={edu.endDate || ''} 
                          onChange={(v) => updateItem<Education>('education', edu.id, { endDate: v })} 
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* Skills Card */}
          <section ref={sectionRefs.skills} id="skills">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <FaTools />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Skills</h2>
                </div>
                <button
                  onClick={() => addItem<Skill>('skills', {
                    id: crypto.randomUUID(),
                    category: '',
                    name: '',
                  })}
                  className="flex items-center space-x-2 text-[#0395DE] font-semibold text-sm hover:opacity-80 transition-opacity"
                >
                  <FaPlus className="text-[10px]" />
                  <span>Add Category</span>
                </button>
              </div>
              
              <div className="grid md:grid-cols-1 gap-4">
                <AnimatePresence>
                  {resumeData.skills.map((skill) => (
                    <motion.div 
                      key={skill.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center space-x-4 bg-[#F8FAFC] p-4 rounded-2xl group"
                    >
                      <div className="flex-1">
                        <input
                          type="text"
                          className="w-full bg-transparent border-none text-sm font-bold text-[#0395DE] placeholder:text-gray-300 focus:ring-0"
                          placeholder="Category (e.g. Languages)"
                          value={skill.category}
                          onChange={(e) => updateItem<Skill>('skills', skill.id, { category: e.target.value })}
                        />
                      </div>
                      <div className="flex-[2]">
                        <input
                          type="text"
                          className="w-full bg-transparent border-none text-sm text-gray-700 placeholder:text-gray-300 focus:ring-0"
                          placeholder="Skills (e.g. Java, Python)"
                          value={skill.name}
                          onChange={(e) => updateItem<Skill>('skills', skill.id, { name: e.target.value })}
                        />
                      </div>
                      <button 
                        onClick={() => removeItem('skills', skill.id)} 
                        className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <FaTrash />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </section>
        </div>

        {/* Right Sidebar - Settings */}
        <aside className="col-span-3">
          <div className="sticky top-28 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-2 mb-6 text-gray-900">
                <FaPalette className="text-[#0395DE]" />
                <h3 className="font-bold tracking-tight">Design Theme</h3>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Color Accent</label>
                  <select
                    className="w-full bg-[#F8FAFC] border-none rounded-xl text-sm p-3 focus:ring-2 focus:ring-[#0395DE] transition-all"
                    value={templateSettings.colorScheme}
                    onChange={(e) => handleTemplateSettingChange('colorScheme', e.target.value)}
                  >
                    <option value="awesome-skyblue">Tech Blue</option>
                    <option value="awesome-emerald">Emerald Green</option>
                    <option value="awesome-pink">Modern Pink</option>
                    <option value="awesome-red">Classic Red</option>
                    <option value="awesome-orange">Energy Orange</option>
                    <option value="awesome-nephritis">Soft Green</option>
                    <option value="awesome-concrete">Professional Grey</option>
                    <option value="awesome-darknight">Midnight Navy</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Typography Size</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['10pt', '11pt', '12pt'].map(size => (
                      <button
                        key={size}
                        onClick={() => handleTemplateSettingChange('fontSize', size)}
                        className={clsx(
                          "py-2 rounded-xl text-xs font-bold border transition-all",
                          templateSettings.fontSize === size 
                            ? "bg-[#0395DE] text-white border-[#0395DE] shadow-md shadow-blue-500/20" 
                            : "bg-white text-gray-500 border-gray-100 hover:border-gray-200"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={templateSettings.sectionColorHighlight}
                        onChange={(e) => handleTemplateSettingChange('sectionColorHighlight', e.target.checked)}
                      />
                      <div className={clsx(
                        "w-10 h-6 rounded-full transition-colors",
                        templateSettings.sectionColorHighlight ? "bg-[#0395DE]" : "bg-gray-200"
                      )} />
                      <div className={clsx(
                        "absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform",
                        templateSettings.sectionColorHighlight ? "translate-x-4" : ""
                      )} />
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Section Highlights</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-2 mb-6 text-gray-900">
                <FaCog className="text-[#0395DE]" />
                <h3 className="font-bold tracking-tight">Paper & Layout</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Format</label>
                  <select
                    className="w-full bg-[#F8FAFC] border-none rounded-xl text-sm p-3 focus:ring-2 focus:ring-[#0395DE] transition-all"
                    value={templateSettings.paperSize}
                    onChange={(e) => handleTemplateSettingChange('paperSize', e.target.value as any)}
                  >
                    <option value="a4paper">A4 Standard</option>
                    <option value="letterpaper">US Letter</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Header Alignment</label>
                  <div className="flex bg-[#F8FAFC] p-1 rounded-xl">
                    {['L', 'C', 'R'].map(align => (
                      <button
                        key={align}
                        onClick={() => handleTemplateSettingChange('headerAlignment', align)}
                        className={clsx(
                          "flex-1 py-1.5 rounded-lg text-xs font-bold transition-all",
                          templateSettings.headerAlignment === align 
                            ? "bg-white text-gray-900 shadow-sm" 
                            : "text-gray-400 hover:text-gray-600"
                        )}
                      >
                        {align === 'L' ? 'Left' : align === 'C' ? 'Center' : 'Right'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}

// Sub-components for better readability
function InputField({ label, value, onChange, placeholder = '', type = 'text' }: any) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">{label}</label>
      <input
        type={type}
        className="w-full bg-[#F8FAFC] border-none rounded-xl p-3 text-sm text-gray-800 placeholder:text-gray-300 focus:ring-2 focus:ring-[#0395DE] transition-all"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

function ActionButton({ icon, onClick, variant = 'default' }: any) {
  return (
    <button 
      onClick={onClick} 
      className={clsx(
        "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
        variant === 'danger' 
          ? "bg-red-50 text-red-400 hover:bg-red-500 hover:text-white" 
          : "bg-white text-gray-400 hover:text-[#0395DE] shadow-sm"
      )}
    >
      <span className="text-[10px]">{icon}</span>
    </button>
  )
}

// Default state constants
const defaultResumeData: ResumeData = {
  personal: {
    firstName: '',
    lastName: '',
    position: '',
    email: '',
  },
  education: [],
  experience: [],
  skills: [],
}

const defaultTemplateSettings: TemplateSettings = {
  colorScheme: 'awesome-skyblue',
  fontSize: '11pt',
  paperSize: 'a4paper',
  sectionColorHighlight: true,
  headerAlignment: 'C',
}
