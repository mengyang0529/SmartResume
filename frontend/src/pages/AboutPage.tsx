import { FaHeart, FaUsers, FaCode, FaPalette } from 'react-icons/fa'

const teamMembers = [
  {
    name: 'Alex Chen',
    role: 'Frontend Lead',
    description: 'Responsive UI and user experience',
    expertise: ['React', 'TypeScript', 'Tailwind CSS'],
  },
  {
    name: 'Maria Rodriguez',
    role: 'Backend Engineer',
    description: 'API design and LaTeX processing',
    expertise: ['Node.js', 'Python', 'Docker'],
  },
  {
    name: 'David Kim',
    role: 'LaTeX Specialist',
    description: 'Template development and PDF generation',
    expertise: ['LaTeX', 'XeLaTeX', 'Font Management'],
  },
  {
    name: 'Sarah Johnson',
    role: 'UX Designer',
    description: 'Visual design and user research',
    expertise: ['Figma', 'User Testing', 'Accessibility'],
  },
]

const technologies = [
  { name: 'React', description: 'Frontend framework for building interactive UIs' },
  { name: 'TypeScript', description: 'Type-safe JavaScript for better developer experience' },
  { name: 'Node.js', description: 'Backend runtime for API server' },
  { name: 'Python', description: 'LaTeX compilation service and automation' },
  { name: 'Docker', description: 'Containerization for consistent environments' },
  { name: 'XeLaTeX', description: 'LaTeX engine with Unicode and font support' },
  { name: 'PostgreSQL', description: 'Database for user data and templates' },
  { name: 'Tailwind CSS', description: 'Utility-first CSS framework for styling' },
]

export default function AboutPage() {
  return (
    <div className="container-padded py-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">About WebResume</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          We're building the easiest way to create professional, print-ready resumes with the
          quality of LaTeX and the simplicity of a web app.
        </p>
      </div>

      {/* Mission */}
      <div className="card mb-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-gray-600 mb-4">
              LaTeX produces the most beautiful, professionally typeset documents, but it has
              a steep learning curve. Our mission is to make that quality accessible to
              everyone through an intuitive web interface.
            </p>
            <p className="text-gray-600">
              Whether you're a student applying for your first internship or an executive
              updating your CV, WebResume helps you create documents that stand out.
            </p>
          </div>
          <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <FaPalette className="text-2xl text-primary-600" />
                </div>
                <div>
                  <h3 className="font-bold">Beautiful Design</h3>
                  <p className="text-sm text-gray-600">Professional LaTeX typography</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FaCode className="text-2xl text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold">Open Source</h3>
                  <p className="text-sm text-gray-600">Free and community-driven</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <FaUsers className="text-2xl text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold">Easy to Use</h3>
                  <p className="text-sm text-gray-600">No LaTeX knowledge required</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="mb-16">
        <h2 className="section-title text-center">Meet Our Team</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="card text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-700">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <h3 className="text-xl font-bold">{member.name}</h3>
              <p className="text-primary-600 font-medium mb-2">{member.role}</p>
              <p className="text-gray-600 mb-4">{member.description}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {member.expertise.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technology Stack */}
      <div className="card mb-12">
        <h2 className="section-title">Technology Stack</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {technologies.map((tech) => (
            <div key={tech.name} className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-bold text-lg mb-2">{tech.name}</h3>
              <p className="text-gray-600 text-sm">{tech.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Open Source */}
      <div className="card">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Open Source</h2>
            <p className="text-gray-600 mb-6">
              WebResume is completely open source. We believe in transparency, community
              collaboration, and making professional tools accessible to everyone.
            </p>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Built with modern web technologies for the best user experience.
              </p>
            </div>
          </div>
          <div className="bg-gray-900 text-white rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-6">Inspired by Awesome-CV</h3>
            <p className="text-gray-300 mb-6">
              This project is built on top of the excellent{' '}
              <a
                href="https://github.com/posquit0/Awesome-CV"
                className="text-primary-300 hover:text-primary-200 underline"
              >
                Awesome-CV
              </a>{' '}
              LaTeX template by posquit0. We've converted it into a web application while
              preserving all its beautiful typography and professional layout.
            </p>
            <div className="flex items-center space-x-2 text-gray-400">
              <FaHeart className="text-red-500" />
              <span>Special thanks to the LaTeX community</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="card mt-12">
        <h2 className="section-title text-center">Get In Touch</h2>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-600 mb-8">
            Have questions, suggestions, or want to collaborate? We'd love to hear from you.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              className="btn-outline"
              onClick={() => alert('Feedback feature coming soon!')}
            >
              Send Feedback
            </button>
            <button
              className="btn-primary"
              onClick={() => alert('Support feature coming soon!')}
            >
              Get Support
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}