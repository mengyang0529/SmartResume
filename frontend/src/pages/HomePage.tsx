import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaArrowRight, FaCode, FaUser, FaDownload, FaCloud } from 'react-icons/fa'

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

        {/* Workflow Guide */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-32 max-w-4xl mx-auto"
        >
          <div className="text-center mb-16">
            <div className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.3em] mb-6">How to Use</div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-300 tracking-tight">
              Two Ways to Get Started
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-[#26262c] border border-gray-700/30 rounded-lg p-10 text-center group hover:border-red-600/30 transition-all duration-300">
              <div className="text-3xl mb-4 text-gray-500 group-hover:text-red-500 transition-colors">{<FaUser />}</div>
              <h3 className="text-sm font-black text-gray-300 uppercase tracking-widest mb-4">Manually Fill</h3>
              <p className="text-[11px] text-gray-600 leading-relaxed mb-8 max-w-xs mx-auto">
                Fill in your identity, write modules with the rich text editor, add skills, then preview and download the PDF.
              </p>
              <div className="grid grid-cols-4 gap-3 text-center">
                <MiniStep number="1" label="Identity" />
                <MiniStep number="2" label="Modules" />
                <MiniStep number="3" label="Skills" />
                <MiniStep number="4" label="Export" />
              </div>
            </div>

            <div className="bg-[#26262c] border border-gray-700/30 rounded-lg p-10 text-center group hover:border-red-600/30 transition-all duration-300">
              <div className="text-3xl mb-4 text-gray-500 group-hover:text-red-500 transition-colors">{<FaDownload />}</div>
              <h3 className="text-sm font-black text-gray-300 uppercase tracking-widest mb-4">Import from JSON</h3>
              <p className="text-[11px] text-gray-600 leading-relaxed mb-8 max-w-xs mx-auto">
                If you already have a resume JSON file, click the <span className="text-gray-400">Import JSON</span> button in the editor to load your data instantly.
              </p>
              <div className="flex items-center justify-center space-x-4 text-[10px] font-mono text-gray-600">
                <span className="text-gray-500">JSON File</span>
                <span className="text-red-600/60">→</span>
                <span className="text-gray-400">Editor</span>
                <span className="text-red-600/60">→</span>
                <span className="text-gray-500">PDF</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center space-x-3 px-6 py-4 bg-[#26262c] border border-gray-700/40 rounded-lg">
              <FaCloud className="text-gray-600 text-sm" />
              <span className="text-[11px] font-medium text-gray-500">
                All data stays on your device — zero servers, zero uploads.
              </span>
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

function MiniStep({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-8 h-8 rounded-full bg-[#1e1e22] border border-gray-700 flex items-center justify-center text-[10px] font-black text-gray-500 mb-2">{number}</div>
      <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">{label}</span>
    </div>
  )
}
