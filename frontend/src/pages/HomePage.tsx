import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaArrowRight, FaTerminal } from 'react-icons/fa'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center overflow-hidden relative">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,59,48,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,59,48,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      
      {/* Dynamic Laser Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-red-600/10 blur-[150px] pointer-events-none"></div>

      <div className="container-padded relative z-10 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="flex flex-col items-center"
        >
          <div className="inline-flex items-center space-x-3 px-4 py-2 bg-red-600/10 border border-red-600/30 rounded text-red-500 mb-12">
             <FaTerminal className="text-xs" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">System Initialized: Forge v2.0</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-white mb-8 leading-[0.9]">
            Build Resumes <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-red-400">Like Engineering.</span>
          </h1>

          <p className="text-gray-500 text-lg md:text-xl font-mono uppercase tracking-widest max-w-2xl mb-16">
            Visual compilers for professional identity. High-fidelity Typst output. Precision-grade formatting.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 mb-24">
            <button
              onClick={() => navigate('/editor')}
              className="px-12 py-5 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-xs rounded transition-all shadow-[0_15px_40px_rgba(220,38,38,0.4)] hover:scale-105 active:scale-95 flex items-center space-x-3"
            >
              <span>Create Resume</span>
              <FaArrowRight className="text-xs" />
            </button>
            <button
              onClick={() => navigate('/gallery')}
              className="px-12 py-5 bg-[#111111] border border-gray-800 hover:border-gray-600 text-gray-300 font-black uppercase tracking-widest text-xs rounded transition-all hover:bg-[#1A1A1A]"
            >
              Browse Templates
            </button>
          </div>

          {/* Industrial Metric Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-gray-800/50 pt-16 w-full">
            <Metric label="Latency" value="250ms" />
            <Metric label="Output" value="Typst PDF" />
            <Metric label="System" value="Modular" />
            <Metric label="Security" value="Encrypted" />
          </div>
        </motion.div>
      </div>

      {/* Decorative Side Text */}
      <div className="hidden lg:block absolute left-12 bottom-12 rotate-[-90deg] origin-left">
         <span className="text-[10px] font-black text-gray-800 uppercase tracking-[0.5em]">Forge Systems / Professional / Identity / Compiler</span>
      </div>
    </div>
  )
}

function Metric({ label, value }: any) {
  return (
    <div className="flex flex-col space-y-2">
      <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">{label}</span>
      <span className="text-xl font-bold text-gray-400 font-mono">{value}</span>
    </div>
  )
}
