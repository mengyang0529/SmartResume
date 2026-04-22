import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaUser, FaSave, FaHistory, FaFilePdf, FaTrash, FaEdit, FaDownload, FaPlus, FaPalette, FaChartBar, FaClock, FaTerminal, FaChevronRight } from 'react-icons/fa'
import toast from 'react-hot-toast'
import clsx from 'clsx'

interface SavedResume {
  id: number
  name: string
  lastModified: string
  size: string
  template: string
}

interface CustomTemplate {
  id: number
  name: string
  used: number
}

const initialSavedResumes: SavedResume[] = [
  { id: 1, name: 'Software Engineer Resume', lastModified: '2024-01-15', size: '245 KB', template: 'Modern Tech' },
  { id: 2, name: 'Academic CV', lastModified: '2024-01-10', size: '1.2 MB', template: 'Academic CV' },
  { id: 3, name: 'Cover Letter - Google', lastModified: '2024-01-05', size: '189 KB', template: 'Cover Letter' },
]

const initialTemplates: CustomTemplate[] = [
  { id: 1, name: 'My Tech Template', used: 5 },
  { id: 2, name: 'Academic Style', used: 3 },
  { id: 3, name: 'Simple Clean', used: 8 },
]

interface ProfileData {
  fullName: string
  email: string
  company: string
  jobTitle: string
  bio: string
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<ProfileData>({
    fullName: 'John Doe',
    email: 'john@example.com',
    company: 'Google LLC',
    jobTitle: 'Senior Software Engineer',
    bio: 'Experienced software engineer with expertise in full-stack development and system architecture.',
  })
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>(initialSavedResumes)
  const [templates, setTemplates] = useState<CustomTemplate[]>(initialTemplates)

  const handleProfileChange = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = () => {
    setIsEditing(false)
    toast.success('System credentials updated')
  }

  const stats = [
    { label: 'Units Created', value: savedResumes.length, max: 10, color: 'bg-red-600' },
    { label: 'PDF Compilation', value: savedResumes.length * 3, max: 30, color: 'bg-red-600' },
    { label: 'Custom Modules', value: templates.length, max: 10, color: 'bg-red-600' },
  ]

  return (
    <div className="min-h-screen bg-[#050505] py-24 px-10">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <header className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-[2px] w-12 bg-red-600"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">User Identification</span>
            </div>
            <h1 className="text-6xl font-black uppercase tracking-tighter text-white leading-none">
              Account <br /> <span className="text-gray-600">Profile.</span>
            </h1>
          </div>
          <button
            onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
            className={clsx(
              "px-10 py-4 font-black uppercase tracking-widest text-[10px] transition-all",
              isEditing ? "bg-red-600 text-white shadow-[0_10px_30px_rgba(220,38,38,0.3)]" : "bg-white text-black hover:bg-red-600 hover:text-white"
            )}
          >
            {isEditing ? 'Commit Changes' : 'Modify Credentials'}
          </button>
        </header>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Column: Data Input */}
          <div className="lg:col-span-2 space-y-12">
            <ProfileCard title="System Credentials" icon={<FaTerminal />}>
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
                <FoundryInput label="Full Name" value={profile.fullName} onChange={(v: string) => handleProfileChange('fullName', v)} disabled={!isEditing} />
                <FoundryInput label="Email Node" value={profile.email} onChange={(v: string) => handleProfileChange('email', v)} disabled={!isEditing} />
                <FoundryInput label="Organization" value={profile.company} onChange={(v: string) => handleProfileChange('company', v)} disabled={!isEditing} />
                <FoundryInput label="Designation" value={profile.jobTitle} onChange={(v: string) => handleProfileChange('jobTitle', v)} disabled={!isEditing} />
                <div className="md:col-span-2">
                   <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4 block">Professional Log / Bio</label>
                   <textarea 
                    className="w-full bg-[#050505] border border-gray-800 p-6 text-sm text-gray-400 focus:ring-1 focus:ring-red-600 transition-all min-h-[120px] resize-none leading-relaxed"
                    value={profile.bio}
                    onChange={(e) => handleProfileChange('bio', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </ProfileCard>

            <ProfileCard title="Saved Deployment Units" icon={<FaFilePdf />}>
              <div className="space-y-4">
                {savedResumes.map((resume, i) => (
                  <motion.div
                    key={resume.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group flex items-center justify-between p-6 bg-[#050505] border border-gray-800/50 hover:border-gray-600 transition-all"
                  >
                    <div className="flex items-center space-x-6">
                      <div className="w-10 h-10 bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-500 group-hover:text-red-500 group-hover:border-red-600/30 transition-all">
                        <FaFilePdf className="text-sm" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-white group-hover:text-red-500 transition-colors">{resume.name}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-[10px] font-mono text-gray-600">{resume.template}</span>
                          <span className="text-[10px] font-mono text-gray-600">[{resume.size}]</span>
                          <span className="text-[10px] font-mono text-gray-600">{resume.lastModified}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ActionButton icon={<FaEdit />} onClick={() => navigate('/editor')} />
                      <ActionButton icon={<FaDownload />} onClick={() => {}} />
                      <ActionButton icon={<FaTrash />} onClick={() => {}} danger />
                    </div>
                  </motion.div>
                ))}
              </div>
            </ProfileCard>
          </div>

          {/* Right Column: Metrics & Extras */}
          <div className="space-y-12">
            <ProfileCard title="Resource Usage" icon={<FaChartBar />}>
              <div className="space-y-8">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="flex justify-between mb-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{stat.label}</span>
                      <span className="text-xs font-mono font-bold text-red-500">{stat.value} / {stat.max}</span>
                    </div>
                    <div className="w-full bg-gray-900 h-1 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(stat.value / stat.max) * 100}%` }}
                        className="bg-red-600 h-full shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ProfileCard>

            <ProfileCard title="Custom Modules" icon={<FaPalette />}>
               <div className="space-y-4">
                  {templates.map(t => (
                    <div key={t.id} className="p-5 bg-[#050505] border border-gray-800/50 hover:border-red-600/50 transition-all group">
                       <div className="flex justify-between items-center mb-4">
                          <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-300 group-hover:text-white">{t.name}</h4>
                          <span className="text-[9px] font-mono text-gray-600">{t.used} USES</span>
                       </div>
                       <button className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600 hover:text-red-500 transition-colors">Initialize Module</button>
                    </div>
                  ))}
                  <button className="w-full py-4 border border-dashed border-gray-800 text-gray-600 hover:text-red-500 hover:border-red-600 transition-all text-[10px] font-black uppercase">Inject New Template</button>
               </div>
            </ProfileCard>

            <ProfileCard title="Recent Event Logs" icon={<FaClock />}>
               <div className="space-y-6">
                  {[
                    { title: 'PDF Compilation Successful', time: '14:20:05', status: 'OK' },
                    { title: 'Profile Credentials Modified', time: '12:05:33', status: 'SYS' },
                    { title: 'Editor Instance Loaded', time: '09:45:12', status: 'INIT' },
                  ].map((log, i) => (
                    <div key={i} className="flex items-start space-x-4 group">
                       <span className="text-[9px] font-mono text-gray-800 mt-1">{log.time}</span>
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-300 transition-colors">{log.title}</span>
                          <span className="text-[8px] font-mono text-red-600 mt-1">STATUS_{log.status}</span>
                       </div>
                    </div>
                  ))}
               </div>
            </ProfileCard>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileCard({ title, icon, children }: any) {
  return (
    <div className="bg-[#0A0A0A] border border-gray-800/50 p-10 relative overflow-hidden group hover:border-red-600/50 transition-all duration-500">
       <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 rotate-45 translate-x-12 -translate-y-12 transition-colors group-hover:bg-red-600/10"></div>
       <header className="flex items-center space-x-4 mb-10">
          <div className="text-gray-600 group-hover:text-red-500 transition-colors">{icon}</div>
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 group-hover:text-white transition-colors">{title}</h2>
       </header>
       {children}
    </div>
  )
}

function FoundryInput({ label, value, onChange, disabled }: any) {
  return (
    <div className="flex flex-col space-y-3 group/input">
      <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest group-focus-within/input:text-red-500 transition-colors">{label}</label>
      <input 
        className="w-full bg-transparent p-0 text-lg font-medium text-gray-200 border-b border-gray-800 focus:border-red-600 focus:ring-0 transition-all disabled:text-gray-600 disabled:border-transparent"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  )
}

function ActionButton({ icon, onClick, danger }: any) {
  return (
    <button 
      onClick={onClick} 
      className={clsx(
        "w-9 h-9 flex items-center justify-center border transition-all",
        danger ? "border-gray-800 text-gray-600 hover:bg-red-600 hover:text-white hover:border-red-600" : "border-gray-800 text-gray-600 hover:border-gray-300 hover:text-white"
      )}
    >
      <span className="text-[10px]">{icon}</span>
    </button>
  )
}
