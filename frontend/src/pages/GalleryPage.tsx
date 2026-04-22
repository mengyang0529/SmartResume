import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaStar, FaDownload, FaEye, FaFilter, FaMagic, FaTimes, FaFilePdf, FaLayerGroup } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { pdfApi } from '../services/api'
import clsx from 'clsx'

const templates = [
  { id: 1, name: 'Standard Professional', category: 'Blueprint', description: 'Optimized for ATS and corporate standards.' },
  { id: 2, name: 'Modern Engineering', category: 'Module', description: 'Grid-based layout for technical profiles.' },
  { id: 3, name: 'Minimalist Academic', category: 'System', description: 'High information density for research.' },
]

export default function GalleryPage() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('all')

  return (
    <div className="min-h-screen bg-[#050505] py-24 px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20">
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-[2px] w-12 bg-red-600"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">Available Blueprints</span>
          </div>
          <h1 className="text-6xl font-black uppercase tracking-tighter text-white leading-none">
            Choose Your <br /> <span className="text-gray-600">Architecture.</span>
          </h1>
        </header>

        {/* Filters */}
        <div className="flex space-x-4 mb-16 overflow-x-auto pb-4 custom-scrollbar">
           {['All', 'Blueprint', 'Module', 'System'].map((f) => (
             <button
               key={f}
               onClick={() => setActiveFilter(f.toLowerCase())}
               className={clsx(
                 "px-8 py-3 text-[10px] font-black uppercase tracking-widest border transition-all",
                 (activeFilter === f.toLowerCase() || (f === 'All' && activeFilter === 'all'))
                   ? "bg-white text-black border-white"
                   : "text-gray-500 border-gray-800 hover:border-gray-600 hover:text-gray-300"
               )}
             >
               {f}
             </button>
           ))}
        </div>

        {/* Template Grid */}
        <div className="grid md:grid-cols-3 gap-10">
          {templates.map((template, i) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group bg-[#0A0A0A] border border-gray-800/50 hover:border-red-600/50 transition-all p-10 relative overflow-hidden"
            >
              {/* Corner Accent */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-red-600/5 rotate-45 translate-x-8 -translate-y-8 group-hover:bg-red-600/20 transition-colors"></div>

              <div className="mb-12">
                <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-4 block">00{template.id} / {template.category}</span>
                <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-4 group-hover:text-red-500 transition-colors">{template.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-mono uppercase tracking-wider">{template.description}</p>
              </div>

              <div className="flex flex-col space-y-4">
                <button
                  onClick={() => navigate(`/editor/${template.id}`)}
                  className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] hover:bg-red-600 hover:text-white transition-all flex items-center justify-center space-x-2"
                >
                  <FaMagic />
                  <span>Configure</span>
                </button>
                <button className="w-full py-4 border border-gray-800 text-gray-500 font-black uppercase tracking-widest text-[10px] hover:border-gray-600 hover:text-gray-300 transition-all flex items-center justify-center space-x-2">
                   <FaEye />
                   <span>Preview</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
