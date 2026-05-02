import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaArrowRight, FaUser, FaDownload, FaCloud } from 'react-icons/fa'
import localforage from 'localforage'
import type { ResumeData } from '../types/resume'

export default function HomePage() {
  const navigate = useNavigate()
  const [hasSavedResume, setHasSavedResume] = useState(false)

  useEffect(() => {
    localforage.getItem<ResumeData>('current_resume_data').then(saved => {
      setHasSavedResume(Boolean(saved?.personal || saved?.sections?.length))
    })
  }, [])

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="container-narrow pt-20 pb-16 md:pt-[100px] md:pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 mb-8">
            <span className="pill-badge">Markdown + Typst Engine</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-display-hero text-[rgba(0,0,0,0.95)] max-w-3xl mx-auto">
            Stop Wrestling
            <br />
            <span className="text-[#0075de]">With Layouts.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-body-large text-warm-500 max-w-lg mx-auto mt-6">
            Write your story in a simple editor. We handle the professional typography and PDF generation automatically.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={() => navigate('/templates')}
              className="btn-primary text-nav-button px-6 py-[10px] flex items-center gap-2"
            >
              Get Started
              <FaArrowRight className="text-xs" />
            </button>
            <button
              onClick={() => navigate(hasSavedResume ? '/editor' : '/templates')}
              className="btn-secondary text-nav-button px-6 py-[10px]"
            >
              {hasSavedResume ? 'Continue Editing' : 'View Templates'}
            </button>
          </div>

          {/* Trust indicator */}
          <div className="flex items-center justify-center gap-2 mt-8 text-caption-light text-warm-300">
            <FaCloud className="text-xs" />
            <span>No configuration required &middot; All data stays on your device</span>
          </div>
        </motion.div>
      </section>

      {/* How-to Section (Warm alt bg) */}
      <section className="bg-[#f6f5f4] border-t border-[rgba(0,0,0,0.1)]">
        <div className="container-narrow py-20 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Section header */}
            <div className="text-center mb-16">
              <span className="pill-badge mb-4">How to Use</span>
              <h2 className="text-section-heading text-[rgba(0,0,0,0.95)] mt-4">
                Two Ways to Get Started
              </h2>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Card: Manual Fill */}
              <div className="card-hover text-center p-10">
                <div className="w-12 h-12 rounded-standard bg-[rgba(0,117,222,0.08)] flex items-center justify-center mx-auto mb-5">
                  <FaUser className="text-lg text-[#0075de]" />
                </div>
                <h3 className="text-card-title text-[rgba(0,0,0,0.95)] mb-3">Manually Fill</h3>
                <p className="text-body text-warm-500 mb-8 max-w-xs mx-auto leading-relaxed">
                  Fill in your identity, write modules with the rich text editor, add skills, then preview and download the PDF.
                </p>
                <div className="grid grid-cols-4 gap-3">
                  <MiniStep number="1" label="Identity" />
                  <MiniStep number="2" label="Modules" />
                  <MiniStep number="3" label="Skills" />
                  <MiniStep number="4" label="Export" />
                </div>
              </div>

              {/* Card: Import from JSON */}
              <div className="card-hover text-center p-10">
                <div className="w-12 h-12 rounded-standard bg-[rgba(0,117,222,0.08)] flex items-center justify-center mx-auto mb-5">
                  <FaDownload className="text-lg text-[#0075de]" />
                </div>
                <h3 className="text-card-title text-[rgba(0,0,0,0.95)] mb-3">Import from JSON</h3>
                <p className="text-body text-warm-500 mb-8 max-w-xs mx-auto leading-relaxed">
                  If you already have a resume JSON file, use the <strong className="text-[rgba(0,0,0,0.95)]">Import JSON</strong> button in the editor to load your data instantly.
                </p>
                <div className="flex items-center justify-center gap-3 text-caption text-warm-500">
                  <span className="font-semibold">JSON File</span>
                  <span className="text-[#0075de]">&rarr;</span>
                  <span className="font-semibold">Editor</span>
                  <span className="text-[#0075de]">&rarr;</span>
                  <span className="font-semibold">PDF</span>
                </div>
              </div>
            </div>

            {/* Privacy note */}
            <div className="flex items-center justify-center gap-3 mt-12">
              <div className="flex items-center gap-2 px-5 py-3 rounded-standard border border-[rgba(0,0,0,0.1)] bg-white">
                <FaCloud className="text-sm text-warm-300" />
                <span className="text-caption-light text-warm-500">
                  Zero servers, zero uploads. All data stays on your device.
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

function MiniStep({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="w-8 h-8 rounded-full bg-white border border-[rgba(0,0,0,0.1)] flex items-center justify-center text-caption font-bold text-[rgba(0,0,0,0.95)]">
        {number}
      </div>
      <span className="text-micro text-warm-500">{label}</span>
    </div>
  )
}
