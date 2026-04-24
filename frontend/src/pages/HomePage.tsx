import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaArrowRight, FaCode } from 'react-icons/fa'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#1e1e22] flex flex-col items-center justify-center relative px-6 overflow-hidden">
      {/* Subtle Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,#000_60%,transparent_100%)]"></div>

      <div className="relative z-10 max-w-3xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center space-x-3 mb-10 text-gray-600 border-b border-gray-800 pb-2">
            <FaCode className="text-xs" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em]">Markdown Powered / Typst Engine</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-gray-200 mb-8 tracking-tighter leading-tight">
            Stop Wrestling <br />
            <span className="text-red-600">With Layouts.</span>
          </h1>

          <p className="text-gray-500 text-lg md:text-xl font-medium mb-12 max-w-xl mx-auto leading-relaxed">
            Write your story in a simple editor. <br/>
            We handle the professional typography and PDF generation automatically. 
          </p>

          <div className="flex flex-col items-center space-y-6">
            <button
              onClick={() => navigate('/editor')}
              className="group px-10 py-5 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-xs rounded transition-all shadow-xl hover:shadow-red-900/20 flex items-center space-x-4"
            >
              <span>Get Started</span>
              <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
            </button>
            
            <div className="text-[10px] font-mono text-gray-700 uppercase tracking-widest">
              No configuration required
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-12 text-[10px] font-black text-gray-800 uppercase tracking-[0.8em]">
        Forge Systems © 2026
      </div>
    </div>
  )
}
