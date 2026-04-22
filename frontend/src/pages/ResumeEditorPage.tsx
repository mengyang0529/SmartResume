import { useState, useCallback, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { FaSave, FaDownload, FaCode, FaEye, FaUndo, FaPlus, FaTrash, FaSpinner } from 'react-icons/fa'
import toast from 'react-hot-toast'
import {
  ResumeData,
  defaultResumeData,
  PersonalInfo,
  TemplateSettings,
  defaultTemplateSettings,
  Education,
  Experience,
  Skill,
  Project,
  Language,
} from '../types/resume'
import { generateResumeLatex } from '../utils/latexGenerator'
import { pdfApi } from '../services/api'

export default function ResumeEditorPage() {
  const { templateId } = useParams()
  const [activeTab, setActiveTab] = useState('form')
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData)
  const [templateSettings, setTemplateSettings] = useState<TemplateSettings>(defaultTemplateSettings)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  // Load template data if templateId is provided
  useEffect(() => {
    if (templateId) {
      // In a real app, fetch template from API
      toast.success(`Loaded template: ${templateId}`)
    }
  }, [templateId])

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('resume_draft')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setResumeData(parsed)
      } catch {
        // ignore parse error
      }
    }
    const savedSettings = localStorage.getItem('template_settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setTemplateSettings(parsed)
      } catch {
        // ignore
      }
    }
  }, [])

  const saveToLocalStorage = useCallback((data: ResumeData, settings: TemplateSettings) => {
    localStorage.setItem('resume_draft', JSON.stringify(data))
    localStorage.setItem('template_settings', JSON.stringify(settings))
  }, [])

  const handlePersonalInfoChange = (field: keyof PersonalInfo, value: string) => {
    setResumeData(prev => {
      const next = {
        ...prev,
        personal: {
          ...prev.personal,
          [field]: value
        }
      }
      saveToLocalStorage(next, templateSettings)
      return next
    })
  }

  const handleSummaryChange = (value: string) => {
    setResumeData(prev => {
      const next = { ...prev, summary: value }
      saveToLocalStorage(next, templateSettings)
      return next
    })
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      setResumeData(defaultResumeData)
      setTemplateSettings(defaultTemplateSettings)
      localStorage.removeItem('resume_draft')
      localStorage.removeItem('template_settings')
      toast.success('Form reset successfully')
    }
  }

  const handleSaveDraft = () => {
    saveToLocalStorage(resumeData, templateSettings)
    toast.success('Draft saved locally')
  }

  const handleGeneratePDF = async () => {
    if (!resumeData.personal.firstName || !resumeData.personal.lastName) {
      toast.error('Please fill in at least your first and last name')
      return
    }

    setIsGeneratingPdf(true)
    try {
      const latex = generateResumeLatex(resumeData, templateSettings)
      const result = await pdfApi.generateFromLaTeX(latex)
      
      if (result.cacheKey) {
        toast.success('PDF generated successfully!')
        // Open download in new tab
        window.open(pdfApi.downloadPdf(result.cacheKey), '_blank')
      } else {
        toast.error('PDF generation returned no cache key')
      }
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error('Failed to generate PDF. Please try again.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const handleTemplateSettingChange = (field: keyof TemplateSettings, value: any) => {
    setTemplateSettings(prev => {
      const next = { ...prev, [field]: value }
      saveToLocalStorage(resumeData, next)
      return next
    })
  }

  // Education handlers
  const handleAddEducation = () => {
    const newEducation: Education = {
      id: crypto.randomUUID(),
      school: '',
      degree: '',
      startDate: new Date().toISOString().slice(0, 7),
      endDate: '',
      location: '',
    }
    setResumeData(prev => {
      const next = { ...prev, education: [...prev.education, newEducation] }
      saveToLocalStorage(next, templateSettings)
      return next
    })
  }

  const handleUpdateEducation = (id: string, field: keyof Education, value: string) => {
    setResumeData(prev => {
      const next = {
        ...prev,
        education: prev.education.map(edu =>
          edu.id === id ? { ...edu, [field]: value } : edu
        )
      }
      saveToLocalStorage(next, templateSettings)
      return next
    })
  }

  const handleRemoveEducation = (id: string) => {
    setResumeData(prev => {
      const next = { ...prev, education: prev.education.filter(edu => edu.id !== id) }
      saveToLocalStorage(next, templateSettings)
      return next
    })
  }

  // Experience handlers
  const handleAddExperience = () => {
    const newExperience: Experience = {
      id: crypto.randomUUID(),
      position: '',
      company: '',
      startDate: new Date().toISOString().slice(0, 7),
      endDate: '',
    }
    setResumeData(prev => {
      const next = { ...prev, experience: [...prev.experience, newExperience] }
      saveToLocalStorage(next, templateSettings)
      return next
    })
  }

  const handleUpdateExperience = (id: string, field: keyof Experience, value: string | string[]) => {
    setResumeData(prev => {
      const next = {
        ...prev,
        experience: prev.experience.map(exp =>
          exp.id === id ? { ...exp, [field]: value } : exp
        )
      }
      saveToLocalStorage(next, templateSettings)
      return next
    })
  }

  const handleRemoveExperience = (id: string) => {
    setResumeData(prev => {
      const next = { ...prev, experience: prev.experience.filter(exp => exp.id !== id) }
      saveToLocalStorage(next, templateSettings)
      return next
    })
  }

  // Skills handlers
  const handleAddSkill = () => {
    const newSkill: Skill = {
      id: crypto.randomUUID(),
      category: 'Technical',
      name: '',
    }
    setResumeData(prev => {
      const next = { ...prev, skills: [...prev.skills, newSkill] }
      saveToLocalStorage(next, templateSettings)
      return next
    })
  }

  const handleUpdateSkill = (id: string, field: keyof Skill, value: string) => {
    setResumeData(prev => {
      const next = {
        ...prev,
        skills: prev.skills.map(skill =>
          skill.id === id ? { ...skill, [field]: value } : skill
        )
      }
      saveToLocalStorage(next, templateSettings)
      return next
    })
  }

  const handleRemoveSkill = (id: string) => {
    setResumeData(prev => {
      const next = { ...prev, skills: prev.skills.filter(skill => skill.id !== id) }
      saveToLocalStorage(next, templateSettings)
      return next
    })
  }

  // Projects handlers
  const handleAddProject = () => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      technologies: [],
    }
    setResumeData(prev => {
      const next = { ...prev, projects: [...(prev.projects || []), newProject] }
      saveToLocalStorage(next, templateSettings)
      return next
    })
  }

  const handleUpdateProject = (id: string, field: keyof Project, value: string | string[]) => {
    setResumeData(prev => {
      const next = {
        ...prev,
        projects: (prev.projects || []).map(project =>
          project.id === id ? { ...project, [field]: value } : project
        )
      }
      saveToLocalStorage(next, templateSettings)
      return next
    })
  }

  const handleRemoveProject = (id: string) => {
    setResumeData(prev => {
      const next = { ...prev, projects: (prev.projects || []).filter(project => project.id !== id) }
      saveToLocalStorage(next, templateSettings)
      return next
    })
  }

  // Languages handlers
  const handleAddLanguage = () => {
    const newLanguage: Language = {
      id: crypto.randomUUID(),
      name: '',
      level: 'Intermediate',
    }
    setResumeData(prev => {
      const next = { ...prev, languages: [...(prev.languages || []), newLanguage] }
      saveToLocalStorage(next, templateSettings)
      return next
    })
  }

  const handleUpdateLanguage = (id: string, field: keyof Language, value: string) => {
    setResumeData(prev => {
      const next = {
        ...prev,
        languages: (prev.languages || []).map(lang =>
          lang.id === id ? { ...lang, [field]: value } : lang
        )
      }
      saveToLocalStorage(next, templateSettings)
      return next
    })
  }

  const handleRemoveLanguage = (id: string) => {
    setResumeData(prev => {
      const next = { ...prev, languages: (prev.languages || []).filter(lang => lang.id !== id) }
      saveToLocalStorage(next, templateSettings)
      return next
    })
  }

  // Honors handlers
  const handleAddHonor = () => {
    setResumeData(prev => {
      const next = { ...prev, honors: [...(prev.honors || []), ''] }
      saveToLocalStorage(next, templateSettings)
      return next
    })
  }

  const handleUpdateHonor = (index: number, value: string) => {
    setResumeData(prev => {
      const honors = [...(prev.honors || [])]
      honors[index] = value
      const next = { ...prev, honors }
      saveToLocalStorage(next, templateSettings)
      return next
    })
  }

  const handleRemoveHonor = (index: number) => {
    setResumeData(prev => {
      const honors = [...(prev.honors || [])]
      honors.splice(index, 1)
      const next = { ...prev, honors }
      saveToLocalStorage(next, templateSettings)
      return next
    })
  }

  // Certificates handlers
  const handleAddCertificate = () => {
    setResumeData(prev => {
      const next = { ...prev, certificates: [...(prev.certificates || []), ''] }
      saveToLocalStorage(next, templateSettings)
      return next
    })
  }

  const handleUpdateCertificate = (index: number, value: string) => {
    setResumeData(prev => {
      const certificates = [...(prev.certificates || [])]
      certificates[index] = value
      const next = { ...prev, certificates }
      saveToLocalStorage(next, templateSettings)
      return next
    })
  }

  const handleRemoveCertificate = (index: number) => {
    setResumeData(prev => {
      const certificates = [...(prev.certificates || [])]
      certificates.splice(index, 1)
      const next = { ...prev, certificates }
      saveToLocalStorage(next, templateSettings)
      return next
    })
  }

  const generatedLatex = generateResumeLatex(resumeData, templateSettings)

  return (
    <div className="container-padded py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resume Editor</h1>
          <p className="text-gray-600">Create and customize your professional resume</p>
        </div>
        <div className="flex space-x-3">
          <button type="button" onClick={handleReset} className="btn-secondary">
            <FaUndo className="mr-2" />
            Reset
          </button>
          <button type="button" onClick={handleSaveDraft} className="btn-primary">
            <FaSave className="mr-2" />
            Save Draft
          </button>
        </div>
      </div>

      {/* Editor Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-1">
          {[
            { id: 'form', label: 'Form', icon: <FaEye /> },
            { id: 'preview', label: 'Preview', icon: <FaEye /> },
            { id: 'latex', label: 'LaTeX', icon: <FaCode /> },
          ].map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`px-4 py-3 font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-white border-t border-l border-r border-gray-200 text-primary-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center space-x-2">
                {tab.icon}
                <span className="capitalize">{tab.label}</span>
              </span>
            </button>
          ))}
        </nav>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Editor Panel */}
        <div id="panel-form" role="tabpanel" aria-labelledby="tab-form" className={`lg:col-span-2 ${activeTab !== 'form' ? 'hidden' : ''}`}>
          <div className="space-y-8">
            {/* Personal Information */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Personal Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="John"
                    value={resumeData.personal.firstName}
                    onChange={(e) => handlePersonalInfoChange('firstName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Last Name *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Doe"
                    value={resumeData.personal.lastName}
                    onChange={(e) => handlePersonalInfoChange('lastName', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Position/Title *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Senior Software Engineer"
                    value={resumeData.personal.position}
                    onChange={(e) => handlePersonalInfoChange('position', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Email Address *</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="john@example.com"
                    value={resumeData.personal.email}
                    onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input
                    type="tel"
                    className="input"
                    placeholder="+1 (123) 456-7890"
                    value={resumeData.personal.mobile || ''}
                    onChange={(e) => handlePersonalInfoChange('mobile', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Location</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="San Francisco, CA"
                    value={resumeData.personal.address || ''}
                    onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">LinkedIn URL</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="https://linkedin.com/in/johndoe"
                    value={resumeData.personal.linkedin || ''}
                    onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Homepage URL</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="https://johndoe.com"
                    value={resumeData.personal.homePage || ''}
                    onChange={(e) => handlePersonalInfoChange('homePage', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Twitter Handle</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="johndoe"
                    value={resumeData.personal.twitter || ''}
                    onChange={(e) => handlePersonalInfoChange('twitter', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Professional Summary</label>
                  <textarea
                    className="input min-h-[120px] resize-y"
                    placeholder="Experienced software engineer with 5+ years..."
                    value={resumeData.summary || ''}
                    onChange={(e) => handleSummaryChange(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Education</h2>
                <button type="button" onClick={handleAddEducation} className="btn-secondary text-sm">
                  <FaPlus className="mr-1" /> Add Education
                </button>
              </div>
              <div className="space-y-4">
                {resumeData.education.length === 0 ? (
                  <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <p className="text-gray-500">No education entries yet</p>
                    <p className="text-sm text-gray-400 mt-1">Click &quot;Add Education&quot; to add your first education entry</p>
                  </div>
                ) : (
                  resumeData.education.map((edu) => (
                    <div key={edu.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold">Education Entry</h3>
                        <button
                          type="button"
                          onClick={() => handleRemoveEducation(edu.id)}
                          className="text-red-500 hover:text-red-700 text-sm flex items-center"
                        >
                          <FaTrash className="mr-1" /> Remove
                        </button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <label className="label">School/University *</label>
                          <input
                            type="text"
                            className="input"
                            value={edu.school}
                            onChange={(e) => handleUpdateEducation(edu.id, 'school', e.target.value)}
                            placeholder="Stanford University"
                          />
                        </div>
                        <div>
                          <label className="label">Degree *</label>
                          <input
                            type="text"
                            className="input"
                            value={edu.degree}
                            onChange={(e) => handleUpdateEducation(edu.id, 'degree', e.target.value)}
                            placeholder="Bachelor of Science in Computer Science"
                          />
                        </div>
                        <div>
                          <label className="label">Start Date *</label>
                          <input
                            type="month"
                            className="input"
                            value={edu.startDate}
                            onChange={(e) => handleUpdateEducation(edu.id, 'startDate', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="label">End Date (leave blank if current)</label>
                          <input
                            type="month"
                            className="input"
                            value={edu.endDate || ''}
                            onChange={(e) => handleUpdateEducation(edu.id, 'endDate', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="label">Field of Study</label>
                          <input
                            type="text"
                            className="input"
                            value={edu.field || ''}
                            onChange={(e) => handleUpdateEducation(edu.id, 'field', e.target.value)}
                            placeholder="Computer Science"
                          />
                        </div>
                        <div>
                          <label className="label">Location</label>
                          <input
                            type="text"
                            className="input"
                            value={edu.location || ''}
                            onChange={(e) => handleUpdateEducation(edu.id, 'location', e.target.value)}
                            placeholder="Stanford, CA"
                          />
                        </div>
                        <div>
                          <label className="label">GPA</label>
                          <input
                            type="text"
                            className="input"
                            value={edu.gpa || ''}
                            onChange={(e) => handleUpdateEducation(edu.id, 'gpa', e.target.value)}
                            placeholder="3.8/4.0"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="label">Description</label>
                          <textarea
                            className="input min-h-[80px] resize-y"
                            value={edu.description || ''}
                            onChange={(e) => handleUpdateEducation(edu.id, 'description', e.target.value)}
                            placeholder="Relevant coursework, honors, achievements..."
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Experience */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Work Experience</h2>
                <button type="button" onClick={handleAddExperience} className="btn-secondary text-sm">
                  <FaPlus className="mr-1" /> Add Experience
                </button>
              </div>
              <div className="space-y-4">
                {resumeData.experience.length === 0 ? (
                  <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <p className="text-gray-500">No work experience entries yet</p>
                    <p className="text-sm text-gray-400 mt-1">Click &quot;Add Experience&quot; to add your first work experience</p>
                  </div>
                ) : (
                  resumeData.experience.map((exp) => (
                    <div key={exp.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold">Work Experience Entry</h3>
                        <button
                          type="button"
                          onClick={() => handleRemoveExperience(exp.id)}
                          className="text-red-500 hover:text-red-700 text-sm flex items-center"
                        >
                          <FaTrash className="mr-1" /> Remove
                        </button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <label className="label">Position/Title *</label>
                          <input
                            type="text"
                            className="input"
                            value={exp.position}
                            onChange={(e) => handleUpdateExperience(exp.id, 'position', e.target.value)}
                            placeholder="Senior Software Engineer"
                          />
                        </div>
                        <div>
                          <label className="label">Company *</label>
                          <input
                            type="text"
                            className="input"
                            value={exp.company}
                            onChange={(e) => handleUpdateExperience(exp.id, 'company', e.target.value)}
                            placeholder="Google LLC"
                          />
                        </div>
                        <div>
                          <label className="label">Start Date *</label>
                          <input
                            type="month"
                            className="input"
                            value={exp.startDate}
                            onChange={(e) => handleUpdateExperience(exp.id, 'startDate', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="label">End Date (leave blank if current)</label>
                          <input
                            type="month"
                            className="input"
                            value={exp.endDate || ''}
                            onChange={(e) => handleUpdateExperience(exp.id, 'endDate', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="label">Location</label>
                          <input
                            type="text"
                            className="input"
                            value={exp.location || ''}
                            onChange={(e) => handleUpdateExperience(exp.id, 'location', e.target.value)}
                            placeholder="Mountain View, CA"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="label">Description</label>
                          <textarea
                            className="input min-h-[80px] resize-y"
                            value={exp.description || ''}
                            onChange={(e) => handleUpdateExperience(exp.id, 'description', e.target.value)}
                            placeholder="Brief description of your role and responsibilities..."
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="label">Highlights (one per line)</label>
                          <textarea
                            className="input min-h-[80px] resize-y"
                            value={exp.highlights?.join('\n') || ''}
                            onChange={(e) => handleUpdateExperience(exp.id, 'highlights', e.target.value.split('\n').filter(line => line.trim()))}
                            placeholder="Led development of new features for Google Search&#10;Improved performance by 30% through optimization"
                          />
                          <p className="text-sm text-gray-500 mt-1">Enter each highlight on a new line</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Skills</h2>
                <button type="button" onClick={handleAddSkill} className="btn-secondary text-sm">
                  <FaPlus className="mr-1" /> Add Skill
                </button>
              </div>
              <div className="space-y-3">
                {resumeData.skills.length === 0 ? (
                  <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <p className="text-gray-500">No skills added yet</p>
                    <p className="text-sm text-gray-400 mt-1">Click &quot;Add Skill&quot; to showcase your abilities</p>
                  </div>
                ) : (
                  resumeData.skills.map((skill) => (
                    <div key={skill.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          className="input"
                          placeholder="Skill name (e.g., React, Python)"
                          value={skill.name}
                          onChange={(e) => handleUpdateSkill(skill.id, 'name', e.target.value)}
                        />
                        <input
                          type="text"
                          className="input"
                          placeholder="Category (e.g., Frontend, Backend)"
                          value={skill.category}
                          onChange={(e) => handleUpdateSkill(skill.id, 'category', e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill.id)}
                        className="text-red-500 hover:text-red-700 p-2"
                        aria-label="Remove skill"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Projects */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Projects</h2>
                <button type="button" onClick={handleAddProject} className="btn-secondary text-sm">
                  <FaPlus className="mr-1" /> Add Project
                </button>
              </div>
              <div className="space-y-4">
                {(resumeData.projects || []).length === 0 ? (
                  <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <p className="text-gray-500">No projects added yet</p>
                    <p className="text-sm text-gray-400 mt-1">Click &quot;Add Project&quot; to showcase your work</p>
                  </div>
                ) : (
                  (resumeData.projects || []).map((project) => (
                    <div key={project.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold">Project</h3>
                        <button
                          type="button"
                          onClick={() => handleRemoveProject(project.id)}
                          className="text-red-500 hover:text-red-700 text-sm flex items-center"
                        >
                          <FaTrash className="mr-1" /> Remove
                        </button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <label className="label">Project Name *</label>
                          <input
                            type="text"
                            className="input"
                            value={project.name}
                            onChange={(e) => handleUpdateProject(project.id, 'name', e.target.value)}
                            placeholder="E-commerce Platform"
                          />
                        </div>
                        <div>
                          <label className="label">URL</label>
                          <input
                            type="text"
                            className="input"
                            value={project.url || ''}
                            onChange={(e) => handleUpdateProject(project.id, 'url', e.target.value)}
                            placeholder="https://github.com/username/project"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="label">Description *</label>
                          <textarea
                            className="input min-h-[80px] resize-y"
                            value={project.description}
                            onChange={(e) => handleUpdateProject(project.id, 'description', e.target.value)}
                            placeholder="A full-stack e-commerce platform built with React and Node.js..."
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="label">Technologies (comma-separated)</label>
                          <input
                            type="text"
                            className="input"
                            value={project.technologies?.join(', ') || ''}
                            onChange={(e) => handleUpdateProject(project.id, 'technologies', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                            placeholder="React, Node.js, PostgreSQL, Docker"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Languages */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Languages</h2>
                <button type="button" onClick={handleAddLanguage} className="btn-secondary text-sm">
                  <FaPlus className="mr-1" /> Add Language
                </button>
              </div>
              <div className="space-y-3">
                {(resumeData.languages || []).length === 0 ? (
                  <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <p className="text-gray-500">No languages added yet</p>
                    <p className="text-sm text-gray-400 mt-1">Click &quot;Add Language&quot; to list your language skills</p>
                  </div>
                ) : (
                  (resumeData.languages || []).map((lang) => (
                    <div key={lang.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          className="input"
                          placeholder="Language (e.g., English, Spanish)"
                          value={lang.name}
                          onChange={(e) => handleUpdateLanguage(lang.id, 'name', e.target.value)}
                        />
                        <select
                          className="input"
                          value={lang.level}
                          onChange={(e) => handleUpdateLanguage(lang.id, 'level', e.target.value)}
                        >
                          <option value="Native">Native</option>
                          <option value="Fluent">Fluent</option>
                          <option value="Advanced">Advanced</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Basic">Basic</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLanguage(lang.id)}
                        className="text-red-500 hover:text-red-700 p-2"
                        aria-label="Remove language"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Honors & Awards */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Honors & Awards</h2>
                <button type="button" onClick={handleAddHonor} className="btn-secondary text-sm">
                  <FaPlus className="mr-1" /> Add Honor
                </button>
              </div>
              <div className="space-y-3">
                {(resumeData.honors || []).length === 0 ? (
                  <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <p className="text-gray-500">No honors or awards added yet</p>
                  </div>
                ) : (
                  (resumeData.honors || []).map((honor, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text"
                        className="input flex-1"
                        placeholder="e.g., Dean's List, Best Paper Award"
                        value={honor}
                        onChange={(e) => handleUpdateHonor(index, e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveHonor(index)}
                        className="text-red-500 hover:text-red-700 p-2"
                        aria-label="Remove honor"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Certifications */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Certifications</h2>
                <button type="button" onClick={handleAddCertificate} className="btn-secondary text-sm">
                  <FaPlus className="mr-1" /> Add Certificate
                </button>
              </div>
              <div className="space-y-3">
                {(resumeData.certificates || []).length === 0 ? (
                  <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <p className="text-gray-500">No certifications added yet</p>
                  </div>
                ) : (
                  (resumeData.certificates || []).map((cert, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text"
                        className="input flex-1"
                        placeholder="e.g., AWS Certified Solutions Architect"
                        value={cert}
                        onChange={(e) => handleUpdateCertificate(index, e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveCertificate(index)}
                        className="text-red-500 hover:text-red-700 p-2"
                        aria-label="Remove certificate"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div id="panel-preview" role="tabpanel" aria-labelledby="tab-preview" className={`${activeTab !== 'preview' ? 'hidden' : ''}`}>
          <div className="card sticky top-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Live Preview</h2>
              <button
                type="button"
                onClick={handleGeneratePDF}
                disabled={isGeneratingPdf}
                className="btn-primary text-sm"
              >
                {isGeneratingPdf ? <FaSpinner className="mr-2 animate-spin" /> : <FaDownload className="mr-2" />}
                Download PDF
              </button>
            </div>
            <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-inner">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {resumeData.personal.firstName || resumeData.personal.lastName
                      ? `${resumeData.personal.firstName} ${resumeData.personal.lastName}`
                      : 'Your Name'}
                  </h3>
                  <p className="text-gray-600">{resumeData.personal.position || 'Your Position'}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                    {resumeData.personal.email && <span>{resumeData.personal.email}</span>}
                    {resumeData.personal.email && resumeData.personal.mobile && <span>•</span>}
                    {resumeData.personal.mobile && <span>{resumeData.personal.mobile}</span>}
                    {(resumeData.personal.email || resumeData.personal.mobile) && resumeData.personal.address && <span>•</span>}
                    {resumeData.personal.address && <span>{resumeData.personal.address}</span>}
                    {!resumeData.personal.email && !resumeData.personal.mobile && !resumeData.personal.address && (
                      <span className="text-gray-400">Add contact information</span>
                    )}
                  </div>
                  {resumeData.personal.linkedin && (
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-primary-600">
                      <span>linkedin.com/in/...</span>
                    </div>
                  )}
                </div>

                {resumeData.summary && (
                  <div>
                    <h4 className="font-bold text-gray-900 border-b pb-1 mb-3">Summary</h4>
                    <p className="text-gray-700 whitespace-pre-line">{resumeData.summary}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-bold text-gray-900 border-b pb-1 mb-3">Education</h4>
                  {resumeData.education.length > 0 ? (
                    resumeData.education.map((edu) => (
                      <div key={edu.id} className="mb-3">
                        <div className="flex justify-between">
                          <span className="font-semibold">{edu.school}</span>
                          <span className="text-gray-600">
                            {edu.startDate} - {edu.endDate || 'Present'}
                          </span>
                        </div>
                        <p className="text-gray-700">{edu.degree}{edu.field ? `, ${edu.field}` : ''}</p>
                        {edu.gpa && <p className="text-sm text-gray-500">GPA: {edu.gpa}</p>}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm italic">No education entries yet</p>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 border-b pb-1 mb-3">Experience</h4>
                  {resumeData.experience.length > 0 ? (
                    resumeData.experience.map((exp) => (
                      <div key={exp.id} className="mb-3">
                        <div className="flex justify-between">
                          <span className="font-semibold">{exp.position}</span>
                          <span className="text-gray-600">
                            {exp.startDate} - {exp.endDate || 'Present'}
                          </span>
                        </div>
                        <p className="text-gray-700">{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
                        {exp.highlights && exp.highlights.length > 0 && (
                          <ul className="list-disc list-inside text-gray-600 mt-1 space-y-1">
                            {exp.highlights.map((highlight, idx) => (
                              <li key={idx}>{highlight}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm italic">No work experience yet</p>
                  )}
                </div>

                {resumeData.skills.length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-900 border-b pb-1 mb-3">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.skills.map((skill) => (
                        <span key={skill.id} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                          {skill.name}{skill.category ? ` (${skill.category})` : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(resumeData.projects || []).length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-900 border-b pb-1 mb-3">Projects</h4>
                    {(resumeData.projects || []).map((project) => (
                      <div key={project.id} className="mb-2">
                        <span className="font-semibold">{project.name}</span>
                        <p className="text-gray-600 text-sm">{project.description}</p>
                        {project.technologies && project.technologies.length > 0 && (
                          <p className="text-xs text-gray-500">{project.technologies.join(', ')}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {(resumeData.languages || []).length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-900 border-b pb-1 mb-3">Languages</h4>
                    <div className="flex flex-wrap gap-2">
                      {(resumeData.languages || []).map((lang) => (
                        <span key={lang.id} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                          {lang.name} — {lang.level}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(resumeData.honors || []).length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-900 border-b pb-1 mb-3">Honors & Awards</h4>
                    <ul className="list-disc list-inside text-gray-600">
                      {(resumeData.honors || []).map((honor, idx) => (
                        <li key={idx}>{honor}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {(resumeData.certificates || []).length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-900 border-b pb-1 mb-3">Certifications</h4>
                    <ul className="list-disc list-inside text-gray-600">
                      {(resumeData.certificates || []).map((cert, idx) => (
                        <li key={idx}>{cert}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <p>Preview shows approximate layout. PDF output will have perfect LaTeX formatting.</p>
            </div>
          </div>
        </div>

        {/* LaTeX Source Panel */}
        <div id="panel-latex" role="tabpanel" aria-labelledby="tab-latex" className={`${activeTab !== 'latex' ? 'hidden' : ''}`}>
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">LaTeX Source Code</h2>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-sm font-mono max-h-[70vh]">
              {generatedLatex}
            </pre>
            <div className="mt-4 text-sm text-gray-500">
              <p>This is the generated LaTeX source code. You can download and compile it locally.</p>
            </div>
          </div>
        </div>

        {/* Sidebar (visible only in form mode) */}
        {activeTab === 'form' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="font-bold mb-4">Export Options</h3>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGeneratePDF}
                  disabled={isGeneratingPdf}
                  className="btn-primary w-full"
                >
                  {isGeneratingPdf ? <FaSpinner className="mr-2 animate-spin" /> : <FaDownload className="mr-2" />}
                  Generate PDF
                </button>

              </div>
            </div>

            <div className="card">
              <h3 className="font-bold mb-4">Template Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Color Scheme</label>
                  <select
                    className="input"
                    value={templateSettings.colorScheme}
                    onChange={(e) => handleTemplateSettingChange('colorScheme', e.target.value)}
                  >
                    <option value="awesome-skyblue">Blue (Default)</option>
                    <option value="awesome-emerald">Green</option>
                    <option value="awesome-pink">Pink</option>
                    <option value="awesome-red">Red</option>
                    <option value="awesome-orange">Orange</option>
                    <option value="awesome-nephritis">Nephritis</option>
                    <option value="awesome-concrete">Concrete</option>
                    <option value="awesome-darknight">Dark Night</option>
                  </select>
                </div>
                <div>
                  <label className="label">Font Size</label>
                  <select
                    className="input"
                    value={templateSettings.fontSize}
                    onChange={(e) => handleTemplateSettingChange('fontSize', e.target.value as '10pt' | '11pt' | '12pt')}
                  >
                    <option value="10pt">10pt</option>
                    <option value="11pt">11pt (Default)</option>
                    <option value="12pt">12pt</option>
                  </select>
                </div>
                <div>
                  <label className="label">Paper Size</label>
                  <select
                    className="input"
                    value={templateSettings.paperSize}
                    onChange={(e) => handleTemplateSettingChange('paperSize', e.target.value as 'a4paper' | 'letterpaper')}
                  >
                    <option value="a4paper">A4</option>
                    <option value="letterpaper">Letter</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded text-primary-600 mr-2"
                      checked={templateSettings.sectionColorHighlight}
                      onChange={(e) => handleTemplateSettingChange('sectionColorHighlight', e.target.checked)}
                    />
                    <span>Color Highlight Sections</span>
                  </label>
                </div>
                <div>
                  <label className="label">Header Alignment</label>
                  <select
                    className="input"
                    value={templateSettings.headerAlignment}
                    onChange={(e) => handleTemplateSettingChange('headerAlignment', e.target.value as 'C' | 'L' | 'R')}
                  >
                    <option value="C">Center</option>
                    <option value="L">Left</option>
                    <option value="R">Right</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
