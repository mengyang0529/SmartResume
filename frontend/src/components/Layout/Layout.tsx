import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { FaBars, FaTimes, FaHome, FaThLarge, FaFileImport, FaEdit, FaGithub } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

export default function Layout() {
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Detect templateId from URL to provide contextual navigation
  const templateMatch = location.pathname.match(/\/(import|editor)\/([^/]+)/)
  const activeTemplateId = templateMatch ? templateMatch[2] : ''

  const navItems = [
    { path: '/', label: 'Home', icon: <FaHome /> },
    { path: '/templates', label: 'Templates', icon: <FaThLarge /> },
  ]

  if (activeTemplateId) {
    navItems.push({ path: `/import/${activeTemplateId}`, label: 'Import', icon: <FaFileImport /> })
  }

  navItems.push({ 
    path: activeTemplateId ? `/editor/${activeTemplateId}` : '/editor', 
    label: 'Editor', 
    icon: <FaEdit /> 
  })

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    const normalizedPath = path.split('/').slice(0, 2).join('/')
    if (normalizedPath === '' || normalizedPath === '/') return location.pathname === '/'
    return location.pathname.startsWith(normalizedPath)
  }

  return (
    <div className="min-h-screen bg-white text-[rgba(0,0,0,0.95)] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[rgba(0,0,0,0.1)]">
        <div className="flex items-center h-[55px] px-4 md:px-6">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="w-[30px] h-[30px] flex items-center justify-center rounded-micro hover:bg-[rgba(0,0,0,0.05)] transition-colors mr-3"
            aria-label="Open menu"
          >
            <FaBars className="text-sm text-warm-500" />
          </button>

          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <span className="text-[15px] font-semibold text-[rgba(0,0,0,0.95)] leading-none">Smart Resume</span>
          </Link>
        </div>
      </header>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[60]"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-[#fcfcfb] border-r border-[rgba(0,0,0,0.1)] shadow-2xl z-[70] flex flex-col"
            >
              <div className="h-[55px] flex items-center justify-between px-6 border-b border-[rgba(0,0,0,0.05)] bg-white">
                <span className="text-sm font-bold uppercase tracking-wider text-warm-400">Navigation</span>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[rgba(0,0,0,0.05)] transition-colors"
                >
                  <FaTimes className="text-xs text-warm-500" />
                </button>
              </div>

              <nav className="flex-1 py-6 px-3 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-150 group"
                    style={{
                      color: isActive(item.path) ? '#0075de' : 'rgba(0,0,0,0.6)',
                      backgroundColor: isActive(item.path) ? 'rgba(0,117,222,0.08)' : 'transparent',
                      fontWeight: isActive(item.path) ? '600' : '500',
                    }}
                  >
                    <span className={`text-base ${isActive(item.path) ? 'text-[#0075de]' : 'text-warm-400 group-hover:text-warm-600'}`}>
                      {item.icon}
                    </span>
                    <span className="text-sm">{item.label}</span>
                  </Link>
                ))}
              </nav>

              <div className="p-6 border-t border-[rgba(0,0,0,0.05)] bg-[#f6f5f4]">
                <div className="flex flex-col gap-4">
                  <a 
                    href="https://github.com/mengyang0529" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-3 text-xs text-warm-500 hover:text-[#0075de] transition-colors"
                  >
                    <FaGithub className="text-base" />
                    <span>View on GitHub</span>
                  </a>
                  <p className="text-[10px] text-warm-400 uppercase tracking-widest font-bold">
                    &copy; 2026 Smart Resume
                  </p>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Simplified Footer */}
      <footer className="border-t border-[rgba(0,0,0,0.1)] bg-[#f6f5f4] py-8">
        <div className="container-narrow flex justify-center">
          <p className="text-micro text-warm-400">
            Powered by Typst & AI &bull; MIT License
          </p>
        </div>
      </footer>
    </div>
  )
}
