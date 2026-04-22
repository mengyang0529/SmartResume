import { Outlet, Link, useLocation } from 'react-router-dom'
import { FaHome, FaEdit, FaImages, FaUser, FaInfoCircle } from 'react-icons/fa'

export default function Layout() {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home', icon: <FaHome /> },
    { path: '/editor', label: 'Editor', icon: <FaEdit /> },
    { path: '/templates', label: 'Templates', icon: <FaImages /> },
    { path: '/profile', label: 'Profile', icon: <FaUser /> },
    { path: '/about', label: 'About', icon: <FaInfoCircle /> },
  ]

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const handlePlaceholderLink = (e: React.MouseEvent) => {
    e.preventDefault()
    // Optionally show a toast notification in the future
    console.log('This feature is coming soon!')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container-padded">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div
                className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center"
                role="img"
                aria-label="WebResume Logo"
              >
                <span className="text-white font-bold">R</span>
              </div>
              <span className="text-xl font-bold text-gray-900">WebResume</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                </Link>
              ))}
            </nav>


          </div>

          {/* Mobile Navigation */}
          <nav className="md:hidden flex items-center justify-around py-3 border-t border-gray-200 mt-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center p-2 rounded-lg ${
                  isActive(item.path)
                    ? 'text-primary-600'
                    : 'text-gray-600'
                }`}
              >
                {item.icon}
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container-padded">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div
                  className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center"
                  role="img"
                  aria-label="WebResume Logo"
                >
                  <span className="text-white font-bold">R</span>
                </div>
                <span className="text-xl font-bold">WebResume</span>
              </div>
              <p className="text-gray-400">
                Create professional resumes with LaTeX quality. Free and open source.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link to="/editor" className="text-gray-400 hover:text-white">Editor</Link></li>
                <li><Link to="/templates" className="text-gray-400 hover:text-white">Templates</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-white">About</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" onClick={handlePlaceholderLink} className="text-gray-400 hover:text-white">Documentation</a></li>
                <li><a href="#" onClick={handlePlaceholderLink} className="text-gray-400 hover:text-white">API</a></li>
                <li><a href="#" onClick={handlePlaceholderLink} className="text-gray-400 hover:text-white">Help Center</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" onClick={handlePlaceholderLink} className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" onClick={handlePlaceholderLink} className="text-gray-400 hover:text-white">Terms of Service</a></li>
                <li><a href="#" onClick={handlePlaceholderLink} className="text-gray-400 hover:text-white">License</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} WebResume. Open source under MIT License.</p>
            <p className="mt-2">Inspired by <a href="https://github.com/posquit0/Awesome-CV" className="text-primary-400 hover:text-primary-300">Awesome-CV</a></p>
          </div>
        </div>
      </footer>
    </div>
  )
}