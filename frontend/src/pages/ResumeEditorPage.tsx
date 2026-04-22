import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { 
  FaEdit, FaDownload, FaPlus, FaTrash, FaArrowUp, FaArrowDown,
  FaUser, FaGraduationCap, FaBriefcase, FaTools, FaSpinner, 
  FaSave, FaPalette, FaCog, FaLayerGroup
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

  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData)
  const [templateSettings, setTemplateSettings] = useState<TemplateSettings>(defaultTemplateSettings)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [activeTab, setActiveTab] = useState('personal')
  const [isSaved, setIsSaved] = useState(true)
  
  useEffect(() => {
    const saved = localStorage.getItem('current_resume_data')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.sections && Array.isArray(parsed.sections)) {
          setResumeData(parsed)
        } else {
          setResumeData(defaultResumeData)
        }
      } catch (e) {
        setResumeData(defaultResumeData)
      }
    }
  }, [])

  const handleChange = () => setIsSaved(false)

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
      sections: prev.sections.map(s => s.id === sectionId ? { ...s, entries: [...s.entries, newEntry] } : s)
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
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen shadow-sm">
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="py-2 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Base</div>
          <NavBtn active={activeTab === 'personal'} onClick={() => setActiveTab('personal')} icon={<FaUser />} label="Personal" />
          <NavBtn active={activeTab === 'education'} onClick={() => setActiveTab('education')} icon={<FaGraduationCap />} label="Education" />
          
          <div className="py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between">
            <span>Custom Sections</span>
          </div>
          {resumeData.sections.map(sec => (
            <NavBtn 
              key={sec.id}
              active={activeTab === sec.id} 
              onClick={() => setActiveTab(sec.id)} 
              icon={<FaLayerGroup className="text-gray-400" />} 
              label={sec.title} 
            />
          ))}
          <button onClick={addSection} className="w-full flex items-center space-x-3 px-4 py-3 text-xs text-red-500 font-bold hover:bg-red-50 rounded-xl transition-all mt-2 border border-dashed border-red-200">
            <FaPlus /> <span>New Section</span>
          </button>

          <div className="py-4 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Footer</div>
          <NavBtn active={activeTab === 'skills'} onClick={() => setActiveTab('skills')} icon={<FaTools />} label="Skills" />
        </nav>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
          <button onClick={handleDownloadPdf} disabled={isGeneratingPdf} className="w-full bg-gray-900 text-white rounded-2xl py-4 flex items-center justify-center space-x-3 hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-50">
            {isGeneratingPdf ? <FaSpinner className="animate-spin" /> : <><FaDownload className="text-sm" /> <span className="font-bold tracking-wide">Download PDF</span></>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-12 bg-white/50">
        <div className="max-w-4xl mx-auto space-y-12 pb-32">
          {activeTab === 'personal' && (
            <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="bg-white rounded-3xl p-10 shadow-xl shadow-gray-100/50 border border-gray-100">
              <h2 className="text-3xl font-black text-gray-900 mb-10 tracking-tight">Personal Details</h2>
              <div className="grid grid-cols-2 gap-8">
                <InputField label="First Name" value={resumeData.personal.firstName} onChange={v => { handleChange(); setResumeData(p => ({...p, personal: {...p.personal, firstName: v}}))}} />
                <InputField label="Last Name" value={resumeData.personal.lastName} onChange={v => { handleChange(); setResumeData(p => ({...p, personal: {...p.personal, lastName: v}}))}} />
                <div className="col-span-2">
                  <InputField label="Professional Title" value={resumeData.personal.position} onChange={v => { handleChange(); setResumeData(p => ({...p, personal: {...p.personal, position: v}}))}} />
                </div>
                <InputField label="Email" value={resumeData.personal.email} onChange={v => { handleChange(); setResumeData(p => ({...p, personal: {...p.personal, email: v}}))}} />
                <InputField label="Phone" value={resumeData.personal.mobile} onChange={v => { handleChange(); setResumeData(p => ({...p, personal: {...p.personal, mobile: v}}))}} />
                <div className="col-span-2">
                  <InputField label="Address" value={resumeData.personal.address} onChange={v => { handleChange(); setResumeData(p => ({...p, personal: {...p.personal, address: v}}))}} />
                </div>
                <InputField label="GitHub" value={resumeData.personal.github} onChange={v => { handleChange(); setResumeData(p => ({...p, personal: {...p.personal, github: v}}))}} />
              </div>
            </motion.section>
          )}

          {activeTab === 'education' && (
            <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="bg-white rounded-3xl p-10 shadow-xl shadow-gray-100/50 border border-gray-100">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Education</h2>
                <button onClick={() => {
                  handleChange();
                  setResumeData(p => ({...p, education: [...p.education, { id: crypto.randomUUID(), school: "", degree: "", startDate: "", endDate: "" }]}));
                }} className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all"><FaPlus /></button>
              </div>
              <div className="space-y-6">
                {resumeData.education.map(edu => (
                  <div key={edu.id} className="p-8 bg-gray-50/50 border border-gray-100 rounded-3xl relative group">
                    <button onClick={() => {
                      handleChange();
                      setResumeData(p => ({...p, education: p.education.filter(e => e.id !== edu.id)}));
                    }} className="absolute -right-3 -top-3 w-8 h-8 bg-white text-red-400 rounded-full shadow-lg border border-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><FaTrash className="text-xs" /></button>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="col-span-2">
                        <InputField label="School / University" value={edu.school} onChange={v => setResumeData(p => ({...p, education: p.education.map(e => e.id === edu.id ? {...e, school: v} : e)}))} />
                      </div>
                      <InputField label="Degree" value={edu.degree} onChange={v => setResumeData(p => ({...p, education: p.education.map(e => e.id === edu.id ? {...e, degree: v} : e)}))} />
                      <InputField label="Location" value={edu.location} onChange={v => setResumeData(p => ({...p, education: p.education.map(e => e.id === edu.id ? {...e, location: v} : e)}))} />
                      <InputField label="Start Date" value={edu.startDate} onChange={v => setResumeData(p => ({...p, education: p.education.map(e => e.id === edu.id ? {...e, startDate: v} : e)}))} />
                      <InputField label="End Date" value={edu.endDate} onChange={v => setResumeData(p => ({...p, education: p.education.map(e => e.id === edu.id ? {...e, endDate: v} : e)}))} />
                      <div className="col-span-2">
                         <textarea className="w-full bg-white border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-red-500 transition-all min-h-[80px]" placeholder="Extra info..." value={edu.description} onChange={e => setResumeData(p => ({...p, education: p.education.map(item => item.id === edu.id ? {...item, description: e.target.value} : item)}))} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {resumeData.sections.map(sec => activeTab === sec.id && (
            <motion.section key={sec.id} initial={{opacity:0, scale:0.98}} animate={{opacity:1, scale:1}} className="bg-white rounded-3xl p-10 shadow-xl shadow-gray-100/50 border border-gray-100">
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-50">
                <input 
                  className="text-3xl font-black text-gray-900 bg-transparent border-none focus:ring-0 w-3/4 p-0" 
                  value={sec.title} 
                  onChange={(e) => updateSectionTitle(sec.id, e.target.value)}
                />
                <div className="flex space-x-2">
                  <button onClick={() => removeSection(sec.id)} className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"><FaTrash /></button>
                </div>
              </div>
              
              <div className="space-y-8">
                {sec.entries.map(entry => (
                  <div key={entry.id} className="p-8 bg-gray-50/50 border border-gray-100 rounded-3xl relative group">
                    <div className="absolute right-4 top-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => moveEntry(sec.id, entry.id, 'up')} className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 hover:text-red-500"><FaArrowUp className="text-[10px]" /></button>
                      <button onClick={() => moveEntry(sec.id, entry.id, 'down')} className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 hover:text-red-500"><FaArrowDown className="text-[10px]" /></button>
                      <button onClick={() => removeEntry(sec.id, entry.id)} className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 text-red-400 hover:bg-red-500 hover:text-white"><FaTrash className="text-[10px]" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="col-span-2">
                        <InputField label="Company / Project Name" value={entry.title} onChange={v => updateEntry(sec.id, entry.id, { title: v })} />
                      </div>
                      <InputField label="Position / Role" value={entry.subtitle} onChange={v => updateEntry(sec.id, entry.id, { subtitle: v })} />
                      <InputField label="Date / Period" value={entry.startDate} onChange={v => updateEntry(sec.id, entry.id, { startDate: v })} />
                      <div className="col-span-2">
                        <textarea 
                          className="w-full bg-white border-none rounded-2xl p-5 text-sm focus:ring-2 focus:ring-red-500 transition-all min-h-[120px] leading-relaxed shadow-inner"
                          placeholder="Describe your achievements (one per line)..."
                          value={entry.description}
                          onChange={(e) => updateEntry(sec.id, entry.id, { description: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={() => addEntry(sec.id)} className="w-full py-6 border-2 border-dashed border-gray-100 rounded-3xl text-gray-400 font-bold hover:bg-gray-50 hover:border-red-200 hover:text-red-400 transition-all flex items-center justify-center space-x-2">
                  <FaPlus className="text-xs" /> <span>Add Entry to this Section</span>
                </button>
              </div>
            </motion.section>
          ))}

          {activeTab === 'skills' && (
            <motion.section initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="bg-white rounded-3xl p-10 shadow-xl shadow-gray-100/50 border border-gray-100">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Skills & Languages</h2>
                <button onClick={() => {
                  handleChange();
                  setResumeData(p => ({...p, skills: [...p.skills, { id: crypto.randomUUID(), category: "", name: "" }]}));
                }} className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all"><FaPlus /></button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {resumeData.skills.map(skill => (
                  <div key={skill.id} className="p-6 bg-gray-50 rounded-2xl relative group border border-gray-100">
                    <button onClick={() => {
                      handleChange();
                      setResumeData(p => ({...p, skills: p.skills.filter(s => s.id !== skill.id)}));
                    }} className="absolute -right-2 -top-2 w-6 h-6 bg-white text-red-400 rounded-full shadow-md border border-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><FaTrash className="text-[10px]" /></button>
                    <InputField label="Category" value={skill.category} onChange={v => setResumeData(p => ({...p, skills: p.skills.map(s => s.id === skill.id ? {...s, category: v} : s)}))} />
                    <div className="mt-4">
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Skills</label>
                       <textarea className="w-full bg-white border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500" value={skill.name} onChange={e => setResumeData(p => ({...p, skills: p.skills.map(s => s.id === skill.id ? {...s, name: e.target.value} : s)}))} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </div>

        {!isSaved && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
            <button onClick={() => saveToLocalStorage(resumeData)} className="bg-emerald-500 text-white px-10 py-5 rounded-full shadow-2xl shadow-emerald-200 flex items-center space-x-4 hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95">
              <FaSave className="text-xl" /> <span className="text-lg font-bold">Apply Changes</span>
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

function NavBtn({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={clsx(
      "w-full flex items-center space-x-3 px-4 py-4 rounded-2xl transition-all duration-300 group", 
      active ? "bg-red-500 text-white shadow-xl shadow-red-100 translate-x-1" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
    )}>
      <span className={clsx("text-lg transition-transform", active ? "scale-110" : "group-hover:scale-110")}>{icon}</span>
      <span className="font-bold text-sm truncate tracking-tight">{label}</span>
      {active && <motion.div layoutId="activeInd" className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
    </button>
  )
}

function InputField({ label, value, onChange }: any) {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">{label}</label>
      <input 
        className="bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-red-500 transition-all shadow-inner" 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)} 
      />
    </div>
  )
}
