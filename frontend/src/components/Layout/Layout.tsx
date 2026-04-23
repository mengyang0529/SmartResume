import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaTerminal, FaLayerGroup, FaImages, FaHome } from 'react-icons/fa'
import clsx from 'clsx'

export default function Layout() {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home', icon: FaHome, num: '01' },
    { path: '/gallery', label: 'Gallery', icon: FaImages, num: '02' },
    { path: '/editor', label: 'Editor', icon: FaLayerGroup, num: '03' },
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
    <div className="min-h-screen bg-[#1e1e22] text-gray-400 font-sans flex flex-col">
      {/* Global Horizontal Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-[#32323a]/90 backdrop-blur-xl border-b border-gray-700/30 z-[100] flex items-center justify-between px-8">
        {/* Logo Section */}
        <Link to="/" className="flex items-center space-x-3 group shrink-0">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-gray-300 shadow-[0_0_10px_rgba(220,38,38,0.2)] group-hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all">
            <FaTerminal className="text-base" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] group-hover:text-red-500 transition-colors leading-none">Smart Resume</span>
            <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest mt-1">Foundry OS v2.4</span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="flex items-center space-x-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                "group relative flex items-center px-4 py-2 rounded transition-all duration-300",
                isActive(item.path) 
                  ? "bg-[#32323a] text-gray-300 border-b-2 border-red-600" 
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              )}
            >
              <span className={clsx("text-[8px] font-mono mr-2 transition-colors", isActive(item.path) ? "text-red-500" : "text-gray-700")}>{item.num}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.15em] transition-colors">{item.label}</span>
              {isActive(item.path) && (
                <motion.div layoutId="headerActiveGlow" className="absolute inset-x-0 bottom-[-2px] h-[2px] bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
              )}
            </Link>
          ))}
        </nav>

        {/* System & Social Section */}
        <div className="flex items-center space-x-6 shrink-0">
          <div className="hidden lg:flex items-center space-x-2">
             <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.5)]"></div>
             <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Compiler Online</span>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 mt-14">
        <Outlet />
      </main>

      {/* Industrial Footer */}
      <footer className="bg-[#1e1e22] border-t border-gray-700/20 py-12 px-10">
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
