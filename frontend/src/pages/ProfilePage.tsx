import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { FaBriefcase, FaChartBar, FaClock, FaSearchLocation } from 'react-icons/fa'
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

export default function ProfilePage() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState<Application[]>(initialApplications)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    applicationApi.listApplications()
      .then((data) => setApplications(data))
      .catch(() => {
        console.error('Failed to load applications. Showing local default data.')
      })
      .finally(() => setIsLoading(false))
  }, [])

  const applicationStats = useMemo(() => {
    const total = applications.length
    const interviewing = applications.filter(app => app.status === 'Interviewing').length
    const offers = applications.filter(app => app.status === 'Offer').length
    const pending = applications.filter(app => ['Applied', 'Resume Submitted'].includes(app.status)).length
    return [
      { label: 'Total Applications', value: total, color: 'bg-[#0075de]' },
      { label: 'Interviewing', value: interviewing, color: 'bg-[#2a9d99]' },
      { label: 'Offers', value: offers, color: 'bg-[#1aae39]' },
      { label: 'Pending', value: pending, color: 'bg-[#dd5b00]' },
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

  return (
    <div className="bg-white min-h-screen">
      <div className="container-narrow py-20 md:py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-16"
        >
          <span className="pill-badge mb-4">Career Operations</span>
          <h1 className="text-section-heading text-[rgba(0,0,0,0.95)] mt-3">
            Job Application <span className="text-warm-300">Tracker</span>
          </h1>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            <ProfileSection title="Application Timeline" icon={<FaBriefcase />}>
              <div className="space-y-4">
                {isLoading && (
                  <p className="text-caption text-warm-500">Loading...</p>
                )}
                {applications.map((application, index) => (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="card-hover p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-card-title text-[rgba(0,0,0,0.95)]">{application.company}</h3>
                        <p className="text-caption-light text-warm-500 mt-1">
                          {application.jobTitle} &middot; {application.location || 'Remote'}
                        </p>
                      </div>
                      <span className="pill-badge shrink-0">{application.stage}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-4 text-caption-light text-warm-500">
                      <span>Applied: {application.appliedAt}</span>
                      <span>Status: {application.status}</span>
                      <span>Source: {application.source || 'N/A'}</span>
                    </div>
                    <p className="mt-4 text-body text-warm-500 leading-relaxed">
                      {application.notes || 'No notes added yet.'}
                    </p>
                    <div className="flex items-center gap-3 mt-5">
                      <button onClick={() => navigate('/editor')} className="btn-secondary text-caption px-3 py-[6px]">
                        Edit
                      </button>
                      <span className="text-micro text-warm-300">
                        {application.interviews?.length || 0} interview rounds
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ProfileSection>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <ProfileSection title="Application Metrics" icon={<FaChartBar />}>
              <div className="space-y-6">
                {applicationStats.map((stat) => (
                  <div key={stat.label}>
                    <div className="flex justify-between mb-2">
                      <span className="text-caption font-semibold text-warm-500">{stat.label}</span>
                      <span className="text-caption font-bold text-[rgba(0,0,0,0.95)]">{stat.value}</span>
                    </div>
                    <div className="w-full bg-[rgba(0,0,0,0.06)] h-1.5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (stat.value / Math.max(10, applications.length)) * 100)}%` }}
                        className={clsx('h-full rounded-full', stat.color)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ProfileSection>

            <ProfileSection title="Interview Pipeline" icon={<FaSearchLocation />}>
              <div className="space-y-3">
                {applications.flatMap((app) => app.interviews || []).slice(0, 3).map((interview) => (
                  <div key={interview.id} className="card-hover p-5">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-micro font-semibold text-warm-300 uppercase tracking-wider">Round {interview.round}</span>
                      <span className="pill-badge">{interview.outcome}</span>
                    </div>
                    <p className="text-caption font-medium text-[rgba(0,0,0,0.95)]">
                      {interview.interviewType} with {interview.interviewer}
                    </p>
                    <p className="text-micro text-warm-500 mt-1">
                      {interview.scheduledAt ? interview.scheduledAt.slice(0, 16).replace('T', ' ') : 'TBD'}
                    </p>
                  </div>
                ))}
                {!applications.flatMap((app) => app.interviews || []).length && (
                  <p className="text-caption-light text-warm-500">No interviews scheduled yet.</p>
                )}
              </div>
            </ProfileSection>

            <ProfileSection title="Recent Activity" icon={<FaClock />}>
              <div className="space-y-4">
                {activityLogs.slice(0, 5).map((log, index) => (
                  <div key={`${log.title}-${index}`} className="flex items-start gap-3">
                    <span className="text-micro text-warm-300 mt-0.5 shrink-0">{log.time}</span>
                    <div>
                      <p className="text-caption font-medium text-warm-500">{log.title}</p>
                      <span className="text-micro text-[#0075de]">{log.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ProfileSection>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileSection({ title, icon, children }: any) {
  return (
    <div className="card p-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-warm-300">{icon}</span>
        <h2 className="text-caption font-semibold uppercase tracking-wider text-warm-500">{title}</h2>
      </div>
      {children}
    </div>
  )
}
