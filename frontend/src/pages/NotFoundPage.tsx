import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaHome, FaEdit } from 'react-icons/fa'

const quickLinks = [
  { to: '/editor', icon: FaEdit, label: 'Resume Editor', desc: 'Create or edit your resume' },
]

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center container-narrow py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-lg mx-auto"
      >
        <div className="w-16 h-16 rounded-standard bg-[rgba(0,117,222,0.08)] flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl font-bold text-[#0075de]">404</span>
        </div>

        <h1 className="text-subheading text-[rgba(0,0,0,0.95)] mb-2">Page Not Found</h1>
        <p className="text-body text-warm-500 mb-8 leading-relaxed">
          The page you are looking for does not exist or has been moved. Let us get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <Link to="/" className="btn-primary text-caption px-5 py-[8px] flex items-center justify-center gap-2">
            <FaHome className="text-xs" />
            Back to Home
          </Link>
          <Link to="/editor" className="btn-secondary text-caption px-5 py-[8px] flex items-center justify-center gap-2">
            <FaEdit className="text-xs" />
            Create Resume
          </Link>
        </div>

        {/* Quick Links */}
        <div className="text-left card p-6">
          <h3 className="text-caption font-semibold text-warm-500 uppercase tracking-wider mb-4">Quick Links</h3>
          <div className="space-y-2">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-3 p-3 rounded-standard hover:bg-[rgba(0,0,0,0.03)] transition-colors group"
              >
                <div className="w-9 h-9 rounded-standard bg-[rgba(0,0,0,0.04)] flex items-center justify-center group-hover:bg-[rgba(0,117,222,0.06)] transition-colors">
                  <link.icon className="text-sm text-warm-400 group-hover:text-[#0075de]" />
                </div>
                <div className="text-left">
                  <p className="text-caption font-semibold text-[rgba(0,0,0,0.95)]">{link.label}</p>
                  <p className="text-micro text-warm-400">{link.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
