import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaUser, FaSave, FaHistory, FaFilePdf, FaTrash, FaEdit, FaDownload, FaPlus } from 'react-icons/fa'
import toast from 'react-hot-toast'

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
  {
    id: 1,
    name: 'Software Engineer Resume',
    lastModified: '2024-01-15',
    size: '245 KB',
    template: 'Modern Tech',
  },
  {
    id: 2,
    name: 'Academic CV',
    lastModified: '2024-01-10',
    size: '1.2 MB',
    template: 'Academic CV',
  },
  {
    id: 3,
    name: 'Cover Letter - Google',
    lastModified: '2024-01-05',
    size: '189 KB',
    template: 'Cover Letter',
  },
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
    toast.success('Profile saved successfully')
    // In a real app, send to API: userApi.updateProfile({ name: profile.fullName })
  }

  const handleEditResume = (_resumeId: number) => {
    navigate('/editor')
    toast.success('Opening resume in editor...')
  }

  const handleDownloadResume = (_resumeId: number) => {
    const resume = savedResumes.find(r => r.id === _resumeId)
    toast.success(`Downloading ${resume?.name || 'resume'}...`)
    // In a real app, trigger actual download
  }

  const handleDeleteResume = (resumeId: number) => {
    if (confirm('Are you sure you want to delete this resume?')) {
      setSavedResumes(prev => prev.filter(r => r.id !== resumeId))
      toast.success('Resume deleted')
    }
  }

  const handleNewResume = () => {
    navigate('/editor')
  }

  const handleUseTemplate = (_templateId: number) => {
    navigate('/editor')
    toast.success('Template loaded into editor')
  }

  const handleEditTemplate = (_templateId: number) => {
    toast('Template editing coming soon!')
  }

  const handleShareTemplate = (_templateId: number) => {
    toast('Template sharing coming soon!')
  }

  const handleCreateTemplate = () => {
    const name = prompt('Enter template name:')
    if (name && name.trim()) {
      const newTemplate: CustomTemplate = {
        id: Date.now(),
        name: name.trim(),
        used: 0,
      }
      setTemplates(prev => [...prev, newTemplate])
      toast.success('Template created')
    }
  }

  return (
    <div className="container-padded py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your saved resumes and templates</p>
        </div>
        <button
          onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
          className="btn-primary"
        >
          <FaSave className="mr-2" />
          {isEditing ? 'Save Profile' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Card */}
          <div className="card">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                <FaUser className="text-3xl text-primary-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{profile.fullName}</h2>
                <p className="text-gray-600">{profile.jobTitle}</p>
                <p className="text-sm text-gray-500">Member since January 2024</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  className="input"
                  value={profile.fullName}
                  onChange={(e) => handleProfileChange('fullName', e.target.value)}
                  disabled={!isEditing}
                  readOnly={!isEditing}
                />
              </div>
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  className="input"
                  value={profile.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  disabled={!isEditing}
                  readOnly={!isEditing}
                />
              </div>
              <div>
                <label className="label">Company</label>
                <input
                  type="text"
                  className="input"
                  value={profile.company}
                  onChange={(e) => handleProfileChange('company', e.target.value)}
                  disabled={!isEditing}
                  readOnly={!isEditing}
                />
              </div>
              <div>
                <label className="label">Job Title</label>
                <input
                  type="text"
                  className="input"
                  value={profile.jobTitle}
                  onChange={(e) => handleProfileChange('jobTitle', e.target.value)}
                  disabled={!isEditing}
                  readOnly={!isEditing}
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">Bio</label>
                <textarea
                  className="input min-h-[100px] resize-y"
                  value={profile.bio}
                  onChange={(e) => handleProfileChange('bio', e.target.value)}
                  disabled={!isEditing}
                  readOnly={!isEditing}
                />
              </div>
            </div>
          </div>

          {/* Saved Resumes */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Saved Resumes</h2>
                <p className="text-gray-600">Your recently created and saved resumes</p>
              </div>
              <button onClick={handleNewResume} className="btn-secondary">
                <FaPlus className="mr-2" /> New Resume
              </button>
            </div>

            <div className="space-y-4">
              {savedResumes.length === 0 ? (
                <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                  <p className="text-gray-500">No saved resumes yet</p>
                  <button onClick={handleNewResume} className="text-primary-600 hover:underline mt-2">
                    Create your first resume
                  </button>
                </div>
              ) : (
                savedResumes.map((resume) => (
                  <div
                    key={resume.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FaFilePdf className="text-xl text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-bold">{resume.name}</h3>
                        <p className="text-sm text-gray-500">
                          Template: {resume.template} • Modified: {resume.lastModified} • {resume.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditResume(resume.id)}
                        className="px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors flex items-center"
                        aria-label="Edit resume"
                      >
                        <FaEdit className="mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDownloadResume(resume.id)}
                        className="px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center"
                        aria-label="Download resume"
                      >
                        <FaDownload className="mr-1" />
                      </button>
                      <button
                        onClick={() => handleDeleteResume(resume.id)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Delete resume"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Stats & Templates */}
        <div className="space-y-8">
          {/* Usage Stats */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">Usage Statistics</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Resumes Created</span>
                  <span className="font-bold">{savedResumes.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${Math.min(savedResumes.length * 10, 100)}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">PDFs Generated</span>
                  <span className="font-bold">{savedResumes.length * 3}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${Math.min(savedResumes.length * 15, 100)}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Templates Saved</span>
                  <span className="font-bold">{templates.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${Math.min(templates.length * 20, 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Templates */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">My Templates</h2>
              <button onClick={handleCreateTemplate} className="btn-secondary text-sm">
                <FaPlus className="mr-1" /> Create
              </button>
            </div>
            <div className="space-y-4">
              {templates.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No custom templates yet</p>
              ) : (
                templates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold">{template.name}</h3>
                      <span className="text-sm text-gray-500">Used {template.used} times</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUseTemplate(template.id)}
                        className="text-sm px-3 py-1 bg-primary-50 text-primary-600 rounded hover:bg-primary-100 transition-colors"
                      >
                        Use
                      </button>
                      <button
                        onClick={() => handleEditTemplate(template.id)}
                        className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleShareTemplate(template.id)}
                        className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        Share
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <FaFilePdf className="text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Generated PDF resume</p>
                  <p className="text-sm text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaSave className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Saved &quot;Academic CV&quot; template</p>
                  <p className="text-sm text-gray-500">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <FaHistory className="text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Edited Software Engineer resume</p>
                  <p className="text-sm text-gray-500">3 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
