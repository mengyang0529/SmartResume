import { FaPlus, FaBars, FaUpload, FaFileDownload, FaHistory, FaThLarge } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  onClick: () => void
}

interface ResumeEditorToolbarProps {
  showNav: boolean
  setShowNav: (v: boolean) => void
  navItems: NavItem[]
  addSection: () => void
  openImportFile: () => void
  handleExportMarkdown: () => void
  setShowHistory: (v: boolean) => void
  currentTemplate: { name: string }
}

export default function ResumeEditorToolbar({
  showNav, setShowNav, navItems, addSection, openImportFile,
  handleExportMarkdown, setShowHistory, currentTemplate,
}: ResumeEditorToolbarProps) {
  const navigate = useNavigate()

  return (
    <div className="shrink-0 bg-white border-b border-[rgba(0,0,0,0.1)] px-4 py-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowNav(!showNav) }}
                className="px-2.5 py-1.5 rounded-md text-sm text-warm-500 hover:bg-[rgba(0,0,0,0.05)] hover:text-[rgba(0,0,0,0.95)] transition-all flex items-center gap-1.5"
              >
                <FaBars className="text-xs" />
                <span className="hidden sm:inline text-xs">Sections</span>
              </button>
              {showNav && (
                <div
                  className="absolute top-full left-0 mt-1 w-52 bg-white border border-[rgba(0,0,0,0.1)] rounded-lg shadow-deep py-1 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-1.5 text-xs font-medium text-warm-400">
                    <button onClick={addSection} className="w-full flex items-center justify-between hover:text-[#0075de] transition-colors">
                      <span>Add section</span>
                      <FaPlus className="text-[10px]" />
                    </button>
                  </div>
                  <div className="h-px bg-[rgba(0,0,0,0.06)] mx-3 my-1" />
                  {navItems.map(item => (
                    <button
                      key={item.id}
                      onClick={item.onClick}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-warm-500 hover:bg-[rgba(0,0,0,0.04)] hover:text-[rgba(0,0,0,0.95)] transition-colors"
                    >
                      <span className="text-warm-300 text-xs">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="w-px h-5 bg-[rgba(0,0,0,0.1)]" />

            <button
              onClick={openImportFile}
              className="px-2.5 py-1.5 rounded-md text-sm text-warm-500 hover:bg-[rgba(0,0,0,0.05)] hover:text-[rgba(0,0,0,0.95)] transition-all flex items-center gap-1.5"
            >
              <FaUpload className="text-xs" />
              <span className="hidden sm:inline text-xs">Import</span>
            </button>
            <button
              onClick={handleExportMarkdown}
              className="px-2.5 py-1.5 rounded-md text-sm text-warm-500 hover:bg-[rgba(0,0,0,0.05)] hover:text-[rgba(0,0,0,0.95)] transition-all flex items-center gap-1.5"
            >
              <FaFileDownload className="text-xs" />
              <span className="hidden sm:inline text-xs">Export</span>
            </button>

            <span className="w-px h-5 bg-[rgba(0,0,0,0.1)]" />

            <button
              onClick={() => setShowHistory(true)}
              className="px-2.5 py-1.5 rounded-md text-sm text-warm-500 hover:bg-[rgba(0,0,0,0.05)] hover:text-[rgba(0,0,0,0.95)] transition-all flex items-center gap-1.5"
            >
              <FaHistory className="text-xs" />
              <span className="hidden sm:inline text-xs">History</span>
            </button>

            <span className="w-px h-5 bg-[rgba(0,0,0,0.1)]" />

            <button
              onClick={() => navigate('/templates')}
              className="px-2.5 py-1.5 rounded-md text-sm text-warm-500 hover:bg-[rgba(0,0,0,0.05)] hover:text-[rgba(0,0,0,0.95)] transition-all flex items-center gap-1.5"
            >
              <FaThLarge className="text-xs" />
              <span className="hidden sm:inline text-xs">Change Template</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-warm-400">Template</span>
            <span className="text-xs font-semibold text-[rgba(0,0,0,0.95)]">{currentTemplate.name}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
