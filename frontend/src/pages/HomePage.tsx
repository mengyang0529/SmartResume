import { useNavigate } from 'react-router-dom'
import { FaMagic, FaDownload, FaEdit, FaStar } from 'react-icons/fa'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-accent-50 py-20">
        <div className="container-padded text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Create Professional Resumes with{' '}
            <span className="text-primary-600">LaTeX Quality</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Generate beautiful, print-ready resumes using the same templates as professional
            LaTeX documents. No coding required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/editor')}
              className="btn-primary text-lg px-8 py-4"
            >
              <FaMagic className="mr-2" />
              Create Your Resume
            </button>
            <button
              onClick={() => navigate('/templates')}
              className="btn-outline text-lg px-8 py-4"
            >
              <FaStar className="mr-2" />
              Browse Templates
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container-padded">
          <h2 className="section-title text-center">Why Choose Web Resume?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaEdit className="text-3xl text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Easy Visual Editor</h3>
              <p className="text-gray-600">
                Fill out simple forms and see real-time previews. No LaTeX knowledge required.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaMagic className="text-3xl text-accent-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">LaTeX Quality Output</h3>
              <p className="text-gray-600">
                Get print-ready PDFs with professional typography and perfect formatting.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaDownload className="text-3xl text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Multiple Formats</h3>
              <p className="text-gray-600">
                Download as PDF or LaTeX source code for further customization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-20">
        <div className="container-padded text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Create Your Perfect Resume?</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join thousands of professionals who have landed their dream jobs with our resumes.
          </p>
          <button
            onClick={() => navigate('/editor')}
            className="btn-primary bg-white text-gray-900 hover:bg-gray-100 text-lg px-10 py-4"
          >
            Get Started For Free
          </button>
          <p className="mt-6 text-gray-400">No sign-up required. Start creating instantly.</p>
        </div>
      </section>
    </div>
  )
}