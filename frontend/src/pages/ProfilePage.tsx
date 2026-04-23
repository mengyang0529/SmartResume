import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaBriefcase, FaChartBar, FaClock, FaSearchLocation, FaUserTie } from 'react-icons/fa'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { applicationApi } from '../services/api'

interface Interview {
  id: string
  round: number
  interviewType: string
  interviewer: string
  scheduledAt: string | null
  outcome: string
  feedback?: string
  notes?: string
}

interface Application {
  id: string
  company: string
  jobTitle: string
  location?: string
  status: string
  stage?: string
  appliedAt: string
  source?: string
  notes?: string
  interviews?: Interview[]
}

interface JobProfile {
  targetRole: string
  targetLocation: string
  resumeVariant: string
  notes: string
}

const initialApplications: Application[] = [
  {
    id: 'app-1',
    company: 'Azure Dynamics',
    jobTitle: 'Senior Software Architect',
    location: 'Remote / US',
    status: 'Interviewing',
    stage: 'Technical Interview',
    appliedAt: '2024-04-12',
    source: 'LinkedIn',
    notes: 'Waiting for follow-up from hiring manager.',
    interviews: [
      { id: 'int-1', round: 1, interviewType: 'Phone Screen', interviewer: 'Mia Chen', scheduledAt: '2024-04-15T10:30:00Z', outcome: 'passed', feedback: 'Strong architecture fit', notes: 'Follow up on cloud metrics.' },
    ],
  },
  {
    id: 'app-2',
    company: 'Proto Labs',
    jobTitle: 'Product Engineering Lead',
    location: 'San Francisco, CA',
    status: 'Applied',
    stage: 'Resume Submitted',
    appliedAt: '2024-04-08',
    source: 'Company site',
    notes: 'Use research-focused resume version.',
    interviews: [],
  },
  {
    id: 'app-3',
    company: 'Skyline AI',
    jobTitle: 'AI Systems Engineer',
    location: 'New York, NY',
    status: 'Offer',
    stage: 'Offer Received',
    appliedAt: '2024-03-29',
    source: 'Referral',
    notes: 'Evaluate offer vs. ongoing discussions.',
    interviews: [
      { id: 'int-2', round: 2, interviewType: 'Technical', interviewer: 'Noah Li', scheduledAt: '2024-04-02T14:00:00Z', outcome: 'passed', feedback: 'Excellent systems knowledge' },
    ],
  },
]

const initialJobProfile: JobProfile = {
  targetRole: 'Senior Software Architect',
  targetLocation: 'Remote-first / Bay Area',
  resumeVariant: 'Technical Leadership',
  notes: 'Focus on Typst PDF generation, distributed systems, and production workload case studies.',
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [jobProfile, setJobProfile] = useState<JobProfile>(initialJobProfile)
  const [applications, setApplications] = useState<Application[]>(initialApplications)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    applicationApi.listApplications()
      .then((data) => setApplications(data))
      .catch(() => {
        toast.error('无法加载投递记录，将显示本地默认数据。')
      })
      .finally(() => setIsLoading(false))
  }, [])

  const applicationStats = useMemo(() => {
    const total = applications.length
    const interviewing = applications.filter(app => app.status === 'Interviewing').length
    const offers = applications.filter(app => app.status === 'Offer').length
    const pending = applications.filter(app => ['Applied', 'Resume Submitted'].includes(app.status)).length
    return [
      { label: 'Total Applications', value: total, max: Math.max(10, total), color: 'bg-red-600' },
      { label: 'Interviewing', value: interviewing, max: 10, color: 'bg-emerald-500' },
      { label: 'Offers', value: offers, max: 10, color: 'bg-sky-500' },
      { label: 'Pending', value: pending, max: 10, color: 'bg-yellow-500' },
    ]
  }, [applications])

  const activityLogs = applications.flatMap((app) => {
    const lastInterview = app.interviews?.slice(-1)[0]
    const events = [
      { title: `${app.company} - ${app.stage}`, time: app.appliedAt, status: app.status },
    ]
    if (lastInterview) {
      events.push({ title: `${app.company} - ${lastInterview.interviewType}`, time: lastInterview.scheduledAt?.slice(0, 10) || app.appliedAt, status: lastInterview.outcome })
    }
    return events
  }).sort((a, b) => (b.time.localeCompare(a.time)))

  const handleJobProfileChange = (field: keyof JobProfile, value: string) => {
    setJobProfile(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-[#050505] py-24 px-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-[2px] w-12 bg-red-600"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">Career Operations</span>
            </div>
            <h1 className="text-6xl font-black uppercase tracking-tighter text-white leading-none">
              Job Application <br /> <span className="text-gray-600">Tracker</span>
            </h1>
          </div>
          <button
            onClick={() => setIsEditing((value) => !value)}
            className={clsx(
              'px-10 py-4 font-black uppercase tracking-widest text-[10px] transition-all',
              isEditing ? 'bg-red-600 text-white shadow-[0_10px_30px_rgba(220,38,38,0.3)]' : 'bg-white text-black hover:bg-red-600 hover:text-white'
            )}
          >
            {isEditing ? 'Save Profile' : 'Edit Search Profile'}
          </button>
        </header>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <ProfileCard title="Job Search Profile" icon={<FaUserTie />}>
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
                <FoundryInput label="Target Role" value={jobProfile.targetRole} onChange={(value: string) => handleJobProfileChange('targetRole', value)} disabled={!isEditing} />
                <FoundryInput label="Target Location" value={jobProfile.targetLocation} onChange={(value: string) => handleJobProfileChange('targetLocation', value)} disabled={!isEditing} />
                <FoundryInput label="Resume Variant" value={jobProfile.resumeVariant} onChange={(value: string) => handleJobProfileChange('resumeVariant', value)} disabled={!isEditing} />
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4 block">Search Notes</label>
                  <textarea
                    className="w-full bg-[#050505] border border-gray-800 p-6 text-sm text-gray-400 focus:ring-1 focus:ring-red-600 transition-all min-h-[140px] resize-none leading-relaxed"
                    value={jobProfile.notes}
                    onChange={(e) => handleJobProfileChange('notes', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </ProfileCard>

            <ProfileCard title="Application Timeline" icon={<FaBriefcase />}>
              <div className="space-y-4">
                {isLoading && <div className="text-gray-500 text-sm">加载中...</div>}
                {applications.map((application, index) => (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="group p-6 bg-[#050505] border border-gray-800/50 hover:border-red-600 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-white">{application.company}</h3>
                        <p className="text-[11px] text-gray-500 mt-2">{application.jobTitle} · {application.location || 'Remote'}</p>
                      </div>
                      <span className="text-[10px] font-mono uppercase text-red-500">{application.stage}</span>
                    </div>
                    <div className="mt-5 grid sm:grid-cols-3 gap-4 text-[10px] text-gray-400">
                      <span>Applied: {application.appliedAt}</span>
                      <span>Status: {application.status}</span>
                      <span>Source: {application.source || 'N/A'}</span>
                    </div>
                    <p className="mt-5 text-sm text-gray-400 leading-relaxed">{application.notes || 'No notes added yet.'}</p>
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <ActionButton label="编辑" onClick={() => navigate('/editor')} />
                      <ActionButton label="详情" onClick={() => {}} />
                      <span className="text-[10px] text-gray-600 uppercase tracking-[0.3em]">{application.interviews?.length || 0} interview rounds</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ProfileCard>
          </div>

          <div className="space-y-12">
            <ProfileCard title="Application Metrics" icon={<FaChartBar />}>
              <div className="space-y-8">
                {applicationStats.map((stat) => (
                  <div key={stat.label}>
                    <div className="flex justify-between mb-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{stat.label}</span>
                      <span className="text-xs font-mono font-bold text-red-500">{stat.value}</span>
                    </div>
                    <div className="w-full bg-gray-900 h-1 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (stat.value / stat.max) * 100)}%` }}
                        className={clsx('h-full shadow-[0_0_10px_rgba(220,38,38,0.5)]', stat.color)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ProfileCard>

            <ProfileCard title="Interview Pipeline" icon={<FaSearchLocation />}>
              <div className="space-y-4">
                {applications.flatMap((app) => app.interviews || []).slice(0, 3).map((interview) => (
                  <div key={interview.id} className="p-5 bg-[#050505] border border-gray-800/50 transition-all">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Round {interview.round}</span>
                      <span className="text-[10px] font-black uppercase text-red-500">{interview.outcome}</span>
                    </div>
                    <p className="text-sm text-white">{interview.interviewType} with {interview.interviewer}</p>
                    <p className="text-[11px] text-gray-500 mt-2">{interview.scheduledAt ? interview.scheduledAt.slice(0, 16).replace('T', ' ') : 'TBD'}</p>
                  </div>
                ))}
                {!applications.flatMap((app) => app.interviews || []).length && (
                  <div className="text-[11px] text-gray-500">当前没有安排中的面试。请先创建投递记录。</div>
                )}
              </div>
            </ProfileCard>

            <ProfileCard title="Recent Activity" icon={<FaClock />}>
              <div className="space-y-6">
                {activityLogs.slice(0, 5).map((log, index) => (
                  <div key={`${log.title}-${index}`} className="flex items-start space-x-4 group">
                    <span className="text-[9px] font-mono text-gray-500 mt-1">{log.time}</span>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-300 transition-colors">{log.title}</span>
                      <span className="text-[8px] font-mono text-red-600 mt-1">{log.status}</span>
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

function ActionButton({ label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] border border-gray-800 text-gray-400 hover:border-red-500 hover:text-white transition-all"
    >
      {label}
    </button>
  )
}
