import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { 
  FaEdit, FaDownload, 
  FaPlus, FaTrash, FaArrowUp, FaArrowDown,
  FaUser, FaGraduationCap, FaBriefcase, FaTools, 
  FaSpinner, FaSave
} from 'react-icons/fa'
import toast from 'react-hot-toast'
import { ResumeData, TemplateSettings, Experience, Education, Skill } from '../types/resume'
import { generateResumeLatex } from '../utils/latexGenerator'
import { pdfApi } from '../services/api'

export default function ResumeEditorPage() {
  const { templateId } = useParams()
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData)
  const [templateSettings, setTemplateSettings] = useState<TemplateSettings>(defaultTemplateSettings)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  // Load template data if templateId is provided
  useEffect(() => {
    // In a real app, we would fetch the template from the API
    // For now, we'll just use the default data
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
  }

  const handlePersonalInfoChange = (field: keyof typeof resumeData.personal, value: string) => {
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

  const handleTemplateSettingChange = (field: keyof TemplateSettings, value: any) => {
    setTemplateSettings(prev => {
      const next = {
        ...prev,
        [field]: value
      }
      saveToLocalStorage(resumeData, next)
      return next
    })
  }

  // Generic array update helpers
  const addItem = <T extends { id: string }>(field: keyof ResumeData, newItem: T) => {
    setResumeData(prev => {
      const currentArray = (prev[field] as T[]) || []
      const next = {
        ...prev,
        [field]: [...currentArray, newItem]
      }
      saveToLocalStorage(next, templateSettings)
      return next
    })
  }

  const updateItem = <T extends { id: string }>(field: keyof ResumeData, id: string, updates: Partial<T>) => {
    setResumeData(prev => {
      const currentArray = (prev[field] as T[]) || []
      const next = {
        ...prev,
        [field]: currentArray.map(item => item.id === id ? { ...item, ...updates } : item)
      }
      saveToLocalStorage(next, templateSettings)
      return next
    })
  }

  const removeItem = (field: keyof ResumeData, id: string) => {
    setResumeData(prev => {
      const currentArray = (prev[field] as any[]) || []
      const next = {
        ...prev,
        [field]: currentArray.filter(item => item.id !== id)
      }
      saveToLocalStorage(next, templateSettings)
      return next
    })
  }

  const moveItem = (field: keyof ResumeData, id: string, direction: 'up' | 'down') => {
    setResumeData(prev => {
      const currentArray = [...((prev[field] as any[]) || [])]
      const index = currentArray.findIndex(item => item.id === id)
      if (index === -1) return prev
      if (direction === 'up' && index === 0) return prev
      if (direction === 'down' && index === currentArray.length - 1) return prev

      const targetIndex = direction === 'up' ? index - 1 : index + 1
      const [movedItem] = currentArray.splice(index, 1)
      currentArray.splice(targetIndex, 0, movedItem)

      const next = {
        ...prev,
        [field]: currentArray
      }
      saveToLocalStorage(next, templateSettings)
      return next
    })
  }

  const handleGeneratePDF = async () => {
    setIsGeneratingPdf(true)
    const latex = generateResumeLatex(resumeData, templateSettings)
    
    try {
      const result = await pdfApi.generateFromLaTeX(latex)
      if (result.cacheKey) {
        // Redirect to download
        window.open(pdfApi.downloadPdf(result.cacheKey), '_blank')
        toast.success('PDF generated successfully!')
      }
    } catch (error) {
      console.error('Failed to generate PDF', error)
      toast.error('Failed to generate PDF. Please try again.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <div className="container-padded py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resume Editor</h1>
          <p className="text-gray-600">Fill in your details to generate your professional resume.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => {
              saveToLocalStorage(resumeData, templateSettings)
              toast.success('Progress saved locally')
            }}
            className="btn-outline flex items-center"
          >
            <FaSave className="mr-2" />
            Save Progress
          </button>
          <button 
            onClick={handleGeneratePDF}
            disabled={isGeneratingPdf}
            className="btn-primary flex items-center"
          >
            {isGeneratingPdf ? <FaSpinner className="mr-2 animate-spin" /> : <FaDownload className="mr-2" />}
            Generate PDF
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2">
          {/* Form Panel */}
          <div id="panel-form">
            <div className="space-y-8">
              {/* Personal Information */}
              <div className="card">
                <div className="flex items-center space-x-2 mb-4">
                  <FaUser className="text-primary-600" />
                  <h2 className="text-xl font-bold">Personal Information</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">First Name *</label>
                    <input
                      type="text"
                      className="input"
                      value={resumeData.personal.firstName}
                      onChange={(e) => handlePersonalInfoChange('firstName', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Last Name *</label>
                    <input
                      type="text"
                      className="input"
                      value={resumeData.personal.lastName}
                      onChange={(e) => handlePersonalInfoChange('lastName', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Professional Position *</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Senior Software Engineer"
                      value={resumeData.personal.position}
                      onChange={(e) => handlePersonalInfoChange('position', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Email *</label>
                    <input
                      type="email"
                      className="input"
                      value={resumeData.personal.email}
                      onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Mobile</label>
                    <input
                      type="text"
                      className="input"
                      value={resumeData.personal.mobile || ''}
                      onChange={(e) => handlePersonalInfoChange('mobile', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Address</label>
                    <input
                      type="text"
                      className="input"
                      value={resumeData.personal.address || ''}
                      onChange={(e) => handlePersonalInfoChange('address', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">LinkedIn URL</label>
                    <input
                      type="text"
                      className="input"
                      value={resumeData.personal.linkedin || ''}
                      onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">GitHub Username</label>
                    <input
                      type="text"
                      className="input"
                      value={resumeData.personal.gitlab || ''}
                      onChange={(e) => handlePersonalInfoChange('gitlab', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="card">
                <div className="flex items-center space-x-2 mb-4">
                  <FaEdit className="text-primary-600" />
                  <h2 className="text-xl font-bold">Professional Summary</h2>
                </div>
                <textarea
                  className="input min-h-[120px]"
                  placeholder="Briefly describe your professional background and key strengths..."
                  value={resumeData.summary || ''}
                  onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                />
              </div>

              {/* Work Experience */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <FaBriefcase className="text-primary-600" />
                    <h2 className="text-xl font-bold">Work Experience</h2>
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
                    className="btn-outline btn-sm py-1"
                  >
                    <FaPlus className="mr-1" /> Add
                  </button>
                </div>
                
                <div className="space-y-6">
                  {resumeData.experience.map((exp, index) => (
                    <div key={exp.id} className="p-4 border border-gray-200 rounded-lg relative group">
                      <div className="absolute right-4 top-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => moveItem('experience', exp.id, 'up')} className="text-gray-400 hover:text-primary-600"><FaArrowUp /></button>
                        <button onClick={() => moveItem('experience', exp.id, 'down')} className="text-gray-400 hover:text-primary-600"><FaArrowDown /></button>
                        <button onClick={() => removeItem('experience', exp.id)} className="text-gray-400 hover:text-red-600"><FaTrash /></button>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="label">Company / Organization</label>
                          <input
                            type="text"
                            className="input"
                            value={exp.company}
                            onChange={(e) => updateItem<Experience>('experience', exp.id, { company: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="label">Position</label>
                          <input
                            type="text"
                            className="input"
                            value={exp.position}
                            onChange={(e) => updateItem<Experience>('experience', exp.id, { position: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="label">Location</label>
                          <input
                            type="text"
                            className="input"
                            value={exp.location || ''}
                            onChange={(e) => updateItem<Experience>('experience', exp.id, { location: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="label">Start Date</label>
                          <input
                            type="text"
                            className="input"
                            placeholder="Jan 2020"
                            value={exp.startDate}
                            onChange={(e) => updateItem<Experience>('experience', exp.id, { startDate: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="label">End Date</label>
                          <input
                            type="text"
                            className="input"
                            placeholder="Present"
                            value={exp.endDate || ''}
                            onChange={(e) => updateItem<Experience>('experience', exp.id, { endDate: e.target.value })}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="label">Description / Responsibilities</label>
                          <textarea
                            className="input min-h-[100px]"
                            value={exp.description || ''}
                            onChange={(e) => updateItem<Experience>('experience', exp.id, { description: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <FaGraduationCap className="text-primary-600" />
                    <h2 className="text-xl font-bold">Education</h2>
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
                    className="btn-outline btn-sm py-1"
                  >
                    <FaPlus className="mr-1" /> Add
                  </button>
                </div>
                
                <div className="space-y-6">
                  {resumeData.education.map((edu) => (
                    <div key={edu.id} className="p-4 border border-gray-200 rounded-lg relative group">
                      <div className="absolute right-4 top-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => moveItem('education', edu.id, 'up')} className="text-gray-400 hover:text-primary-600"><FaArrowUp /></button>
                        <button onClick={() => moveItem('education', edu.id, 'down')} className="text-gray-400 hover:text-primary-600"><FaArrowDown /></button>
                        <button onClick={() => removeItem('education', edu.id)} className="text-gray-400 hover:text-red-600"><FaTrash /></button>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="label">School / University</label>
                          <input
                            type="text"
                            className="input"
                            value={edu.school}
                            onChange={(e) => updateItem<Education>('education', edu.id, { school: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="label">Degree</label>
                          <input
                            type="text"
                            className="input"
                            placeholder="Bachelor of Science"
                            value={edu.degree}
                            onChange={(e) => updateItem<Education>('education', edu.id, { degree: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="label">Field of Study</label>
                          <input
                            type="text"
                            className="input"
                            placeholder="Computer Science"
                            value={edu.field || ''}
                            onChange={(e) => updateItem<Education>('education', edu.id, { field: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="label">Start Date</label>
                          <input
                            type="text"
                            className="input"
                            value={edu.startDate}
                            onChange={(e) => updateItem<Education>('education', edu.id, { startDate: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="label">End Date</label>
                          <input
                            type="text"
                            className="input"
                            value={edu.endDate || ''}
                            onChange={(e) => updateItem<Education>('education', edu.id, { endDate: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <FaTools className="text-primary-600" />
                    <h2 className="text-xl font-bold">Skills</h2>
                  </div>
                  <button
                    onClick={() => addItem<Skill>('skills', {
                      id: crypto.randomUUID(),
                      category: '',
                      name: '',
                    })}
                    className="btn-outline btn-sm py-1"
                  >
                    <FaPlus className="mr-1" /> Add
                  </button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {resumeData.skills.map((skill) => (
                    <div key={skill.id} className="flex items-center space-x-2">
                      <input
                        type="text"
                        className="input"
                        placeholder="Category (e.g. Languages)"
                        value={skill.category}
                        onChange={(e) => updateItem<Skill>('skills', skill.id, { category: e.target.value })}
                      />
                      <input
                        type="text"
                        className="input"
                        placeholder="Skills (e.g. Java, Python)"
                        value={skill.name}
                        onChange={(e) => updateItem<Skill>('skills', skill.id, { name: e.target.value })}
                      />
                      <button onClick={() => removeItem('skills', skill.id)} className="text-gray-400 hover:text-red-600"><FaTrash /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Always Visible in Grid */}
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
      </div>
    </div>
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
