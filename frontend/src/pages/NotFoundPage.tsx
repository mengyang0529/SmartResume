import { Link } from 'react-router-dom'
import { FaHome, FaSearch, FaExclamationTriangle } from 'react-icons/fa'

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center container-padded">
      <div className="text-center max-w-2xl">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <FaExclamationTriangle className="text-4xl text-red-600" />
        </div>

        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Page Not Found</h2>

        <p className="text-xl text-gray-600 mb-10">
          The page you're looking for doesn't exist or has been moved.
          Don't worry—let's get you back on track.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          <Link
            to="/"
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <FaHome />
            <span>Back to Home</span>
          </Link>
          <Link
            to="/editor"
            className="btn-outline flex items-center justify-center space-x-2"
          >
            <FaSearch />
            <span>Create Resume</span>
          </Link>
        </div>

        <div className="text-left bg-gray-50 rounded-xl p-6">
          <h3 className="font-bold text-lg mb-4">Looking for something specific?</h3>
          <ul className="space-y-3 text-gray-600">
            <li>
              <Link to="/editor" className="text-primary-600 hover:underline">
                Resume Editor
              </Link>
              {' '}– Create or edit your resume
            </li>
            <li>
              <Link to="/templates" className="text-primary-600 hover:underline">
                Templates
              </Link>
              {' '}– Browse professional templates
            </li>
            <li>
              <Link to="/profile" className="text-primary-600 hover:underline">
                My Profile
              </Link>
              {' '}– Manage your saved resumes
            </li>
            <li>
              <Link to="/about" className="text-primary-600 hover:underline">
                About
              </Link>
              {' '}– Learn more about WebResume
            </li>
          </ul>
        </div>

        <p className="mt-8 text-gray-500">
          If you believe this is an error, please try again later or contact support.
        </p>
      </div>
    </div>
  )
}