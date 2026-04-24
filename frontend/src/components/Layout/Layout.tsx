import { Outlet, Link, useLocation } from 'react-router-dom'
import { FaPenFancy } from 'react-icons/fa'

export default function Layout() {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/editor', label: 'Editor' },
  ]

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-white text-[rgba(0,0,0,0.95)] flex flex-col">
      {/* Notion-style Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[rgba(0,0,0,0.1)]">
        <div className="flex items-center h-[55px] px-6">
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-[30px] h-[30px] bg-[#0075de] rounded-micro flex items-center justify-center text-white transition-colors">
              <FaPenFancy className="text-sm" />
            </div>
            <span className="text-[15px] font-semibold text-[rgba(0,0,0,0.95)] leading-none">Smart Resume</span>
          </Link>

          {/* Nav Links */}
          <nav className="flex items-center gap-1 ml-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="px-3 py-1.5 rounded-micro text-nav-button transition-colors duration-150"
                style={{
                  color: isActive(item.path) ? 'rgba(0,0,0,0.95)' : 'rgba(0,0,0,0.6)',
                  backgroundColor: isActive(item.path) ? 'rgba(0,0,0,0.05)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Notion-style Footer */}
      <footer className="border-t border-[rgba(0,0,0,0.1)] bg-[#f6f5f4]">
        <div className="container-narrow py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-caption-light text-warm-500">
            &copy; {new Date().getFullYear()} Smart Resume
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/mengyang0529"
              className="text-caption text-warm-500 hover:text-[rgba(0,0,0,0.95)] transition-colors no-underline hover:underline"
            >
              Source
            </a>
            <span className="text-caption text-warm-300">MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
