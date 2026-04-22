import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaStar, FaDownload, FaEye, FaFilter, FaMagic, FaTimes } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { resumeApi, pdfApi } from '../services/api'
import { ResumeData } from '../types/resume'

const templates = [
  {
    id: 1,
    name: 'Classic Professional',
    category: 'Resume',
    description: 'Clean, traditional design suitable for all industries',
    color: 'bg-blue-100',
    textColor: 'text-blue-800',
    popularity: 4.8,
    downloads: 12500,
  },
  {
    id: 2,
    name: 'Modern Tech',
    category: 'CV',
    description: 'Contemporary design perfect for tech and engineering roles',
    color: 'bg-green-100',
    textColor: 'text-green-800',
    popularity: 4.9,
    downloads: 9800,
  },
  {
    id: 3,
    name: 'Academic CV',
    category: 'CV',
    description: 'Comprehensive template for academic and research positions',
    color: 'bg-purple-100',
    textColor: 'text-purple-800',
    popularity: 4.7,
    downloads: 7600,
  },
  {
    id: 4,
    name: 'Creative Portfolio',
    category: 'Resume',
    description: 'Visually striking design for creative professions',
    color: 'bg-pink-100',
    textColor: 'text-pink-800',
    popularity: 4.6,
    downloads: 5400,
  },
  {
    id: 5,
    name: 'Executive Level',
    category: 'Resume',
    description: 'Elegant template for senior management positions',
    color: 'bg-gray-100',
    textColor: 'text-gray-800',
    popularity: 4.9,
    downloads: 3200,
  },
  {
    id: 6,
    name: 'Cover Letter',
    category: 'Cover Letter',
    description: 'Matching cover letter template for all resume styles',
    color: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    popularity: 4.5,
    downloads: 8900,
  },
]

type FilterType = 'all' | 'Resumes' | 'CVs' | 'Cover Letters' | 'Most Popular' | 'Free'

const filters: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All Designs' },
  { key: 'Resumes', label: 'Resumes' },
  { key: 'CVs', label: 'CVs' },
  { key: 'Cover Letters', label: 'Cover Letters' },
  { key: 'Most Popular', label: 'Most Popular' },
  { key: 'Free', label: 'Free' },
]

export default function GalleryPage() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)

  const handlePreview = async (templateId: number) => {
    const template = templates.find(t => t.id === templateId)
    if (!template) return
    
    setSelectedTemplate(template)
    setIsPreviewOpen(true)
    setIsLoadingPreview(true)
    setPreviewPdfUrl(null)
    
    try {
      // Use the kebab-case name for the template class
      const templateName = template.name.toLowerCase().replace(/\s+/g, '-')
      const result = await pdfApi.getTemplatePreview(templateName)
      
      // Construct absolute URL for the preview
      setPreviewPdfUrl(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${result.previewUrl}`)
    } catch (error) {
      console.error('Failed to load template preview:', error)
      toast.error('Failed to generate template preview')
      setIsPreviewOpen(false)
    } finally {
      setIsLoadingPreview(false)
    }
  }

  const handleUseTemplate = (templateId: number) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      toast.success(`Loading ${template.name} into editor...`)
      navigate(`/editor/${templateId}`)
    }
  }

  const filteredTemplates = templates.filter(template => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'Resumes') return template.category === 'Resume'
    if (activeFilter === 'CVs') return template.category === 'CV'
    if (activeFilter === 'Cover Letters') return template.category === 'Cover Letter'
    if (activeFilter === 'Most Popular') return template.popularity >= 4.7
    if (activeFilter === 'Free') return true // All templates are free
    return true
  })

  return (
    <div className="container-padded py-8">
      {/* ... (rest of the header remains the same) */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Resume Gallery</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Choose from professionally designed LaTeX templates in our gallery. All designs are based on the
          popular Classic Professional framework.
        </p>
      </div>

      {/* Template Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="flex items-center mr-2 text-gray-600">
          <FaFilter className="mr-2" />
          <span className="font-medium">Filter:</span>
        </div>
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            aria-pressed={activeFilter === filter.key}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === filter.key
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-gray-600 mb-6">
        Showing <span className="font-bold">{filteredTemplates.length}</span> of {templates.length} designs
      </p>

      {/* Template Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="card hover:shadow-lg transition-shadow">
            <div className={`${template.color} ${template.textColor} rounded-lg p-4 mb-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm">{template.category}</span>
                <div className="flex items-center">
                  <FaStar className="mr-1" />
                  <span className="font-bold">{template.popularity}</span>
                </div>
              </div>
              <h3 className="text-xl font-bold">{template.name}</h3>
            </div>

            <p className="text-gray-600 mb-6">{template.description}</p>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
              <span>{template.downloads.toLocaleString()} downloads</span>
              <span className="flex items-center">
                <FaStar className="mr-1 text-yellow-500" />
                {template.popularity}/5
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handlePreview(template.id)}
                className="btn-primary flex-1 min-w-[80px]"
                title="Preview Template"
              >
                <FaEye className="md:mr-2" />
                <span className="hidden md:inline">Preview</span>
              </button>
              <button
                onClick={() => handleUseTemplate(template.id)}
                className="btn-primary bg-accent-600 hover:bg-accent-700 flex-1 min-w-[80px]"
                title="Generate Resume"
              >
                <FaMagic className="md:mr-2" />
                <span className="hidden md:inline">Generate</span>
              </button>
              <button
                onClick={() => handleUseTemplate(template.id)}
                className="btn-outline flex-1 min-w-[80px]"
                title="Customize Design"
              >
                <FaDownload className="md:mr-2" />
                <span className="hidden md:inline">Use Design</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ... (rest of comparison/FAQ remains the same) */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No designs match the selected filter.</p>
          <button
            onClick={() => setActiveFilter('all')}
            className="mt-4 text-primary-600 hover:underline"
          >
            Show all designs
          </button>
        </div>
      )}

      {/* Template Comparison */}
      <div className="card mt-12">
        <h2 className="section-title">Design Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Feature</th>
                <th className="text-left py-3 px-4">Classic Professional</th>
                <th className="text-left py-3 px-4">Modern Tech</th>
                <th className="text-left py-3 px-4">Academic CV</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3 px-4 font-medium">Sections</td>
                <td className="py-3 px-4">All standard</td>
                <td className="py-3 px-4">All standard + projects</td>
                <td className="py-3 px-4">Extended academic</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 font-medium">Color Options</td>
                <td className="py-3 px-4">3</td>
                <td className="py-3 px-4">5</td>
                <td className="py-3 px-4">2</td>
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 font-medium">Page Length</td>
                <td className="py-3 px-4">1-2 pages</td>
                <td className="py-3 px-4">1 page</td>
                <td className="py-3 px-4">2+ pages</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Best For</td>
                <td className="py-3 px-4">All industries</td>
                <td className="py-3 px-4">Tech roles</td>
                <td className="py-3 px-4">Research & academia</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="card mt-12">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-lg mb-2">Are these designs really free?</h3>
            <p className="text-gray-600">
              Yes, all designs in our gallery are completely free to use. They are based on our
              Classic Professional LaTeX design and can be used for personal or commercial purposes.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">Can I customize the designs?</h3>
            <p className="text-gray-600">
              Absolutely! You can customize colors, fonts, sections, and layout through our
              visual editor to create your perfect resume.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">Do I need LaTeX knowledge?</h3>
            <p className="text-gray-600">
              No, our web-based editor handles all the complexity for you. You just need to
              fill in your information, and we'll generate a professional PDF.
            </p>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Design Preview</h2>
                <p className="text-sm text-gray-500">Previewing <span className="font-semibold text-primary-600">{selectedTemplate?.name}</span> style</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleUseTemplate(selectedTemplate?.id)}
                  className="btn-primary"
                >
                  <FaMagic className="mr-2" />
                  Use this Design
                </button>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close preview"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
            </div>

            {/* Modal Body - PDF Viewer */}
            <div className="flex-1 overflow-hidden bg-gray-100 relative">
              {isLoadingPreview ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                  <p className="text-gray-500">Compiling professional LaTeX preview...</p>
                </div>
              ) : previewPdfUrl ? (
                <iframe
                  src={`${previewPdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  className="w-full h-full border-none"
                  title="Design Preview PDF"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Failed to load preview. Please try again.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
              <p className="text-xs text-gray-400">
                This is a real-time LaTeX render. The final PDF will look exactly as shown above.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
