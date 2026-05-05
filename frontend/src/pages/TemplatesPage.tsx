import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight, FaFileAlt } from 'react-icons/fa';
import { RESUME_TEMPLATES } from '@data/templates';

export default function TemplatesPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#f6f5f4] min-h-[calc(100vh-55px)]">
      <section className="container-narrow py-10 md:py-14">
        <div className="max-w-3xl">
          <span className="pill-badge">Choose a template</span>
          <h1 className="text-section-heading text-[rgba(0,0,0,0.95)] mt-4">
            Start with the structure that fits your resume.
          </h1>
          <p className="text-body text-warm-500 mt-4 max-w-2xl">
            Pick a template first. Your resume content, import, export, preview, and PDF tools stay
            available in the editor.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mt-8 md:mt-10">
          {RESUME_TEMPLATES.map((template, index) => (
            <motion.button
              key={template.slug}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
              onClick={() => navigate(`/import/${template.slug}`)}
              className="group text-left bg-white border border-[rgba(0,0,0,0.1)] rounded-lg p-4 md:p-5 shadow-sm hover:shadow-deep hover:border-[rgba(0,117,222,0.35)] transition-all"
            >
              <div className="aspect-[4/5] rounded-md bg-[#f0efed] border border-[rgba(0,0,0,0.08)] mb-4 overflow-hidden">
                <img
                  src={template.previewImage}
                  alt={`${template.name} template preview`}
                  className="h-full w-full object-cover object-top"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <FaFileAlt className="text-[#0075de] text-xs" />
                    <span className="text-micro text-warm-400">{template.category}</span>
                  </div>
                  <h2 className="text-card-title text-[rgba(0,0,0,0.95)] mt-1">{template.name}</h2>
                </div>
                <FaArrowRight className="text-sm text-warm-300 group-hover:text-[#0075de] transition-colors" />
              </div>
              <p className="text-body text-warm-500 mt-3 leading-relaxed">{template.description}</p>
            </motion.button>
          ))}
        </div>
      </section>
    </div>
  );
}
