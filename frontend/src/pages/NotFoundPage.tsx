import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaHome, FaEdit, FaImages, FaUser } from 'react-icons/fa'

const quickLinks = [
  { to: '/editor', icon: FaEdit, label: 'Resume Editor', desc: 'Create or edit your resume' },
  { to: '/gallery', icon: FaImages, label: 'Gallery', desc: 'Browse professional designs' },
  { to: '/profile', icon: FaUser, label: 'My Profile', desc: 'Manage your saved resumes' },
]

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center container-padded py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-xl mx-auto"
      >
        <div className="w-20 h-20 bg-accent-50 rounded-2xl flex items-center justify-center mx-auto mb-8">
          <span className="text-4xl font-bold text-accent-500">404</span>
        </div>

        <h1 className="text-3xl font-bold text-primary-900 mb-3 tracking-tight">Page Not Found</h1>
        <p className="text-primary-500 mb-10 leading-relaxed">
          The page you are looking for does not exist or has been moved. 
          Do not worry — let us get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <Link to="/" className="btn-primary gap-2">
            <FaHome className="text-xs" />
            Back to Home
          </Link>
          <Link to="/editor" className="btn-outline gap-2">
            <FaEdit className="text-xs" />
            Create Resume
          </Link>
        </div>

        <div className="text-left bg-white rounded-2xl p-6 border border-primary-100 shadow-soft">
          <h3 className="font-semibold text-primary-900 mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
          <div className="space-y-2">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary-50 transition-colors group"
              >
                <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center group-hover:bg-white group-hover:shadow-soft transition-all">
                  <link.icon className="text-sm text-primary-500 group-hover:text-primary-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary-800">{link.label}</p>
                  <p className="text-xs text-primary-400">{link.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
