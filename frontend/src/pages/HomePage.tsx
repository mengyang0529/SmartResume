import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowRight,
  FaShieldAlt,
  FaLanguage,
  FaRocket,
  FaMagic,
  FaDownload,
  FaRobot,
  FaFileImport,
  FaImage,
} from 'react-icons/fa';
import { storage } from '@utils/storage';
import { RESUME_TEMPLATES } from '@data/templates';
import type { TemplateDefinition } from '@app-types/template';

export default function HomePage() {
  const navigate = useNavigate();
  const [hasSavedResume, setHasSavedResume] = useState(false);

  useEffect(() => {
    storage.getState().then(saved => {
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
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="container-narrow relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(0,117,222,0.08)] border border-[rgba(0,117,222,0.1)] text-[#0075de] text-[10px] font-bold uppercase tracking-widest mb-6">
                <FaMagic className="text-[9px]" />
                LLM-Assisted Resume Engineering
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold text-[rgba(0,0,0,0.95)] leading-[1.1] tracking-tight">
                From PDF to Professional <br />
                <span className="text-[#0075de]">Powered by AI.</span>
              </h1>

              <p className="mt-8 text-lg md:text-xl text-warm-500 max-w-2xl mx-auto leading-relaxed">
                Transform your existing resume into a perfectly formatted PDF using LLMs. Select a
                style, follow the guide, and get hired.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => navigate('/templates')}
                  className="w-full sm:w-auto px-8 py-4 bg-[#0075de] text-white rounded-xl font-bold shadow-lg shadow-[rgba(0,117,222,0.25)] hover:bg-[#005bab] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
                >
                  Get Started
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
                  100% Private
                </div>
                <div className="w-1 h-1 rounded-full bg-warm-300" />
                <div className="flex items-center gap-1.5">
                  <FaRobot className="text-[#0075de]" />
                  LLM Ready
                </div>
                <div className="w-1 h-1 rounded-full bg-warm-300" />
                <div className="flex items-center gap-1.5">
                  <FaLanguage className="text-[#0075de]" />
                  EN/JP Support
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Guided Workflow Section */}
      <section className="py-24 bg-[#f6f5f4] border-y border-[rgba(0,0,0,0.05)]">
        <div className="container-narrow">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[rgba(0,0,0,0.95)]">How it Works</h2>
            <p className="mt-4 text-warm-500 max-w-xl mx-auto">
              Follow these 4 simple steps to regenerate your resume with professional formatting.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <WorkflowStep
              number={1}
              icon={<FaRocket className="text-[#0075de]" />}
              title="Pick a Template"
              description="Browse our gallery and choose the visual style that fits your career goals."
            />
            {/* Step 2 */}
            <WorkflowStep
              number={2}
              icon={<FaDownload className="text-[#2a9d99]" />}
              title="Download Schema"
              description="Get the specialized Markdown schema for your chosen template to guide the AI."
            />
            {/* Step 3 */}
            <WorkflowStep
              number={3}
              icon={<FaRobot className="text-[#dc3522]" />}
              title="Process with AI"
              description="Convert your PDF to image for better accuracy, then send it to ChatGPT/Claude with the schema."
              tip={
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-100 rounded-lg text-[10px] text-yellow-800 leading-tight">
                  <div className="flex items-center gap-1 font-bold mb-1 text-left">
                    <FaImage /> Pro Tip
                  </div>
                  <p className="text-left">
                    Images (PNG/JPG) work better than raw PDF text for complex layouts.
                  </p>
                </div>
              }
            />
            {/* Step 4 */}
            <WorkflowStep
              number={4}
              icon={<FaFileImport className="text-[#0075de]" />}
              title="Import & Polish"
              description="Paste the generated Markdown into our editor to get your production-grade PDF."
            />
          </div>
        </div>
      </section>

      {/* 3. Template Showcase */}
      <section className="py-24">
        <div className="container-narrow">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-4">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold text-[rgba(0,0,0,0.95)]">
                Ready-to-use Templates.
              </h2>
              <p className="mt-3 text-warm-500">
                Pick a style and start filling in your details. Switch templates anytime without
                losing your data.
              </p>
            </div>
            <button
              onClick={() => navigate('/templates')}
              className="text-[#0075de] font-bold text-sm hover:underline flex items-center gap-1.5"
            >
              Browse all templates <FaArrowRight className="text-[10px]" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTemplates.map((tpl: TemplateDefinition, i: number) => (
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
                  <img
                    src={tpl.previewImage}
                    alt={tpl.name}
                    className="w-full h-full object-cover object-top p-1"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-6 py-2.5 bg-white rounded-full text-sm font-bold shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform">
                      Use this Template
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="font-bold text-[rgba(0,0,0,0.95)]">{tpl.name}</h3>
                  <p className="text-xs text-warm-400 mt-1 uppercase tracking-wider">
                    {tpl.category}
                  </p>
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
              <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
                No account needed. No hidden fees. Just you and your professional resume.
              </p>
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

interface WorkflowStepProps {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  tip?: React.ReactNode;
}

function WorkflowStep({ number, icon, title, description, action, tip }: WorkflowStepProps) {
  return (
    <div className="relative flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-[rgba(0,0,0,0.05)] flex items-center justify-center text-2xl relative mb-6">
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#0075de] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
          {number}
        </div>
        {icon}
      </div>
      <h3 className="font-bold text-[rgba(0,0,0,0.95)] text-lg mb-3">{title}</h3>
      <p className="text-warm-500 text-sm leading-relaxed mb-2">{description}</p>
      {action}
      {tip}
    </div>
  );
}
