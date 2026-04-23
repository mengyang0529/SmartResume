import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaTerminal, FaLayerGroup, FaImages, FaUserAlt, FaHome } from 'react-icons/fa'
import clsx from 'clsx'

export default function Layout() {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home', icon: FaHome, num: '01' },
    { path: '/gallery', label: 'Gallery', icon: FaImages, num: '02' },
    { path: '/editor', label: 'Editor', icon: FaLayerGroup, num: '03' },
    { path: '/profile', label: 'Profile', icon: FaUserAlt, num: '04' },
  ]

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const navigate = useNavigate()

  const handleCreateResume = () => {
    if (location.pathname === '/editor') {
      window.dispatchEvent(new Event('openResumeJsonFile'))
    } else {
      navigate('/editor', { state: { openJsonFile: true } })
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans flex flex-col">
      {/* Global Horizontal Header */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-gray-800/30 z-[100] flex items-center justify-between px-10">
        {/* Logo Section */}
        <Link to="/" className="flex items-center space-x-4 group shrink-0">
          <div className="w-10 h-10 bg-red-600 rounded flex items-center justify-center text-white shadow-[0_0_15px_rgba(220,38,38,0.2)] group-hover:shadow-[0_0_25px_rgba(220,38,38,0.4)] transition-all">
            <FaTerminal className="text-lg" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-[0.2em] group-hover:text-red-500 transition-colors leading-none">Smart Resume</span>
            <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mt-1">Foundry OS v2.4</span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="flex items-center space-x-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                "group relative flex items-center px-6 py-3 rounded transition-all duration-300",
                isActive(item.path) 
                  ? "bg-[#111111] text-white border-b-2 border-red-600" 
                  : "text-gray-500 hover:text-gray-200 hover:bg-white/5"
              )}
            >
              <span className={clsx("text-[9px] font-mono mr-3 transition-colors", isActive(item.path) ? "text-red-500" : "text-gray-700")}>{item.num}</span>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] transition-colors">{item.label}</span>
              {isActive(item.path) && (
                <motion.div layoutId="headerActiveGlow" className="absolute inset-x-0 bottom-[-2px] h-[2px] bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)]" />
              )}
            </Link>
          ))}
        </nav>

        {/* System & Social Section */}
        <div className="flex items-center space-x-8 shrink-0">
          <div className="hidden lg:flex items-center space-x-3">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
             <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Compiler Online</span>
          </div>
          <div className="flex items-center space-x-4 border-l border-gray-800/50 pl-8">
            <button onClick={handleCreateResume} className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2.5 rounded transition-all shadow-[0_10px_20px_rgba(220,38,38,0.2)]">
               Create Resume
            </button>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 mt-20">
        <Outlet />
      </main>

      {/* Industrial Footer */}
      <footer className="bg-[#0A0A0A] border-t border-gray-800/20 py-12 px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">
              © {new Date().getFullYear()} Forge Systems / Professional / Identity / Compiler
            </p>
          </div>
          <div className="flex space-x-10">
            <FooterLink label="Source" href="https://github.com/mengyang0529" />
            <FooterLink label="Documentation" href="#" />
            <FooterLink label="MIT License" href="#" />
            <span className="text-[10px] font-mono text-gray-800 tracking-widest">v2.4.0-PROD</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FooterLink({ label, href }: any) {
  return (
    <a href={href} className="text-[10px] font-black uppercase tracking-widest text-gray-700 hover:text-red-500 transition-colors">
      {label}
    </a>
  )
}
