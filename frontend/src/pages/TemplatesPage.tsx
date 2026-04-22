import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaStar, FaDownload, FaEye, FaFilter } from 'react-icons/fa'
import toast from 'react-hot-toast'

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
  { key: 'all', label: 'All Templates' },
  { key: 'Resumes', label: 'Resumes' },
  { key: 'CVs', label: 'CVs' },
  { key: 'Cover Letters', label: 'Cover Letters' },
  { key: 'Most Popular', label: 'Most Popular' },
  { key: 'Free', label: 'Free' },
]

export default function TemplatesPage() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  const handlePreview = (templateId: number) => {
    toast.success(`Previewing template: ${templates.find(t => t.id === templateId)?.name}`)
    // In a real app, open a preview modal or navigate to preview page
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
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Resume Templates</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Choose from professionally designed LaTeX templates. All templates are based on the
          popular Awesome-CV framework.
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
        Showing <span className="font-bold">{filteredTemplates.length}</span> of {templates.length} templates
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

            <div className="flex space-x-3">
              <button
                onClick={() => handlePreview(template.id)}
                className="btn-primary flex-1"
              >
                <FaEye className="mr-2" />
                Preview
              </button>
              <button
                onClick={() => handleUseTemplate(template.id)}
                className="btn-outline flex-1"
              >
                <FaDownload className="mr-2" />
                Use Template
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No templates match the selected filter.</p>
          <button
            onClick={() => setActiveFilter('all')}
            className="mt-4 text-primary-600 hover:underline"
          >
            Show all templates
          </button>
        </div>
      )}

      {/* Template Comparison */}
      <div className="card mt-12">
        <h2 className="section-title">Template Comparison</h2>
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
            <h3 className="font-bold text-lg mb-2">Are these templates really free?</h3>
            <p className="text-gray-600">
              Yes, all templates are completely free to use. They are based on the open-source
              Awesome-CV LaTeX template and can be used for personal or commercial purposes.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">Can I customize the templates?</h3>
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
    </div>
  )
}
