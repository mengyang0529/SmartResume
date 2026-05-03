import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight, FaEdit, FaFilePdf, FaShieldAlt, FaLanguage, FaRocket } from 'react-icons/fa';
import localforage from 'localforage';
import type { ResumeData } from '../types/resume';
import { RESUME_TEMPLATES } from '../data/templates';

export default function HomePage() {
  const navigate = useNavigate();
  const [hasSavedResume, setHasSavedResume] = useState(false);

  useEffect(() => {
    Promise.all([
      localforage.getItem<ResumeData>('current_resume_data_default'),
      localforage.getItem<ResumeData>('current_resume_data_modern'),
      localforage.getItem<ResumeData>('current_resume_data_rirekisho'),
      localforage.getItem<ResumeData>('current_resume_data_shokumukeirekisho'),
    ]).then((results) => {
      const saved = results.find(r => Boolean(r?.personal?.firstName) || Boolean(r?.sections?.length));
      setHasSavedResume(Boolean(saved));
    });
  }, []);

  const featuredTemplates = RESUME_TEMPLATES.slice(0, 3);

  return (
    <div className="bg-[#fcfcfb] min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-28 md:pb-32 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="container-narrow relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(0,117,222,0.08)] border border-[rgba(0,117,222,0.1)] text-[#0075de] text-[10px] font-bold uppercase tracking-widest mb-6">
                <FaRocket className="text-[9px]" />
                Powered by Typst & Markdown
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold text-[rgba(0,0,0,0.95)] leading-[1.1] tracking-tight">
                Your Resume, <br />
                <span className="text-[#0075de]">Professionally Engineered.</span>
              </h1>

              <p className="mt-8 text-lg md:text-xl text-warm-500 max-w-2xl mx-auto leading-relaxed">
                Skip the formatting headache. Write your content in a clean, block-based editor and get a production-grade PDF instantly. 100% private, 100% free.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => navigate('/templates')}
                  className="w-full sm:w-auto px-8 py-4 bg-[#0075de] text-white rounded-xl font-bold shadow-lg shadow-[rgba(0,117,222,0.25)] hover:bg-[#005bab] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
                >
                  Start Building Now
                  <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                </button>
                {hasSavedResume && (
                  <button
                    onClick={() => navigate('/editor')}
                    className="w-full sm:w-auto px-8 py-4 bg-white border border-[rgba(0,0,0,0.1)] text-[rgba(0,0,0,0.8)] rounded-xl font-bold hover:bg-[rgba(0,0,0,0.02)] transition-all"
                  >
                    Continue Last Session
                  </button>
                )}
              </div>

              <div className="mt-8 flex items-center justify-center gap-6 text-[11px] text-warm-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <FaShieldAlt className="text-[#2a9d99]" />
                  Client-side Only
                </div>
                <div className="w-1 h-1 rounded-full bg-warm-300" />
                <div className="flex items-center gap-1.5">
                  <FaFilePdf className="text-[#dc3522]" />
                  Vector PDF Export
                </div>
                <div className="w-1 h-1 rounded-full bg-warm-300" />
                <div className="flex items-center gap-1.5">
                  <FaLanguage className="text-[#0075de]" />
                  JP Support
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Feature Grid */}
      <section className="py-20 bg-[#f6f5f4] border-y border-[rgba(0,0,0,0.05)]">
        <div className="container-narrow">
          <div className="grid md:grid-cols-3 gap-12">
            <FeatureItem
              icon={<FaEdit className="text-[#0075de]" />}
              title="Block-Based Editing"
              description="Forget dragging text boxes. Organize your career into structured blocks that stay perfectly aligned."
            />
            <FeatureItem
              icon={<FaFilePdf className="text-[#dc3522]" />}
              title="Typst Rendering"
              description="High-fidelity typography used by researchers. Get perfectly kerned, professional-looking PDFs every time."
            />
            <FeatureItem
              icon={<FaLanguage className="text-[#2a9d99]" />}
              title="Japanese Ready"
              description="Built-in support for traditional Rirekisho and Shokumukeirekisho formats with precise layouts."
            />
          </div>
        </div>
      </section>

      {/* 3. Template Showcase */}
      <section className="py-24">
        <div className="container-narrow">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-4">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold text-[rgba(0,0,0,0.95)]">Ready-to-use Templates.</h2>
              <p className="mt-3 text-warm-500">Pick a style and start filling in your details. Switch templates anytime without losing your data.</p>
            </div>
            <button
              onClick={() => navigate('/templates')}
              className="text-[#0075de] font-bold text-sm hover:underline flex items-center gap-1.5"
            >
              Browse all templates <FaArrowRight className="text-[10px]" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTemplates.map((tpl, i) => (
              <motion.div
                key={tpl.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group cursor-pointer"
                onClick={() => navigate(`/editor/${tpl.slug}`)}
              >
                <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-[rgba(0,0,0,0.08)] bg-white shadow-sm group-hover:shadow-xl group-hover:border-[rgba(0,117,222,0.2)] transition-all relative">
                  <img src={tpl.previewImage} alt={tpl.name} className="w-full h-full object-cover object-top p-1" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-6 py-2.5 bg-white rounded-full text-sm font-bold shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform">Use this Template</span>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="font-bold text-[rgba(0,0,0,0.95)]">{tpl.name}</h3>
                  <p className="text-xs text-warm-400 mt-1 uppercase tracking-wider">{tpl.category}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Final CTA */}
      <section className="pb-24 pt-12">
        <div className="container-narrow">
          <div className="bg-[#0075de] rounded-[2rem] p-12 md:p-20 text-center text-white shadow-2xl shadow-[rgba(0,117,222,0.3)] relative overflow-hidden">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Build your future today.</h2>
              <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">No account needed. No hidden fees. Just you and your professional resume.</p>
              <button
                onClick={() => navigate('/templates')}
                className="px-10 py-4 bg-white text-[#0075de] rounded-xl font-bold hover:bg-white/90 hover:scale-105 active:scale-95 transition-all"
              >
                Get Started for Free
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-[rgba(0,0,0,0.05)] flex items-center justify-center text-xl">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-[rgba(0,0,0,0.95)] text-lg mb-2">{title}</h3>
        <p className="text-warm-500 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
