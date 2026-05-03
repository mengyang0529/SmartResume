import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaArrowRight, 
  FaDownload, 
  FaRobot, 
  FaFileImport, 
  FaImage,
  FaArrowLeft,
  FaCheckCircle,
  FaEdit
} from 'react-icons/fa';
import { RESUME_TEMPLATES } from '../data/templates';
import { parseMarkdownResume } from '../utils/markdownIO';
import localforage from 'localforage';

export default function ImportPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const [markdown, setMarkdown] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [showChoiceModal, setShowChoiceModal] = useState(true);

  const template = RESUME_TEMPLATES.find(t => t.slug === templateId) || RESUME_TEMPLATES[0];

  const getSchemaPath = () => {
    const { template: type } = template.settings;
    if (['classic', 'modern', 'art'].includes(type)) {
      return `/templates/awesome-cv/awesome-cv-${type}.md`;
    }
    if (type === 'rirekisho') {
      return `/templates/rirekisho/rirekisho.md`;
    }
    if (type === 'shokumukeirekisho') {
      return `/templates/shokumukeirekisho/shokumukeirekisho.md`;
    }
    return '/RESUME_SCHEMA_EN.md'; // Fallback
  };

  const downloadSchema = () => {
    const path = getSchemaPath();
    const fileName = path.split('/').pop() || 'schema.md';
    const link = document.createElement('a');
    link.href = path;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async () => {
    if (!markdown.trim()) return;
    setIsImporting(true);
    try {
      const data = parseMarkdownResume(markdown);
      // Save to localforage for the specific template
      await localforage.setItem(`current_resume_data_${template.settings.template}`, data);
      navigate(`/editor/${template.slug}`);
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to parse Markdown. Please ensure it follows the schema.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="bg-[#fcfcfb] min-h-[calc(100vh-55px)] flex flex-col relative">
      {/* Entry Choice Modal */}
      <AnimatePresence>
        {showChoiceModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowChoiceModal(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl border border-[rgba(0,0,0,0.1)] p-8 md:p-12 overflow-hidden"
            >
              {/* Decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#0075de]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
              
              <div className="relative z-10 text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-[rgba(0,0,0,0.95)] mb-4">How would you like to start?</h2>
                <p className="text-warm-500 text-sm mb-10 max-w-sm mx-auto leading-relaxed">
                  Choose between our AI-powered import or start with a fresh, empty template.
                </p>

                <div className="grid gap-4">
                  <button
                    onClick={() => setShowChoiceModal(false)}
                    className="group w-full p-6 bg-white border-2 border-[#0075de]/10 rounded-2xl text-left hover:border-[#0075de] hover:bg-[#0075de]/[0.02] transition-all flex items-center gap-6"
                  >
                    <div className="w-14 h-14 rounded-xl bg-[rgba(0,117,222,0.08)] border border-[rgba(0,117,222,0.1)] text-[#0075de] flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                      <FaFileImport />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-[rgba(0,0,0,0.95)] text-lg">Import from Existing Resume</h3>
                      <p className="text-warm-400 text-xs mt-1">Convert your current PDF or Image using AI assistance.</p>
                    </div>
                    <FaArrowRight className="text-warm-200 group-hover:text-[#0075de] transition-colors" />
                  </button>

                  <button
                    onClick={() => navigate(`/editor/${template.slug}`)}
                    className="group w-full p-6 bg-white border-2 border-[rgba(0,0,0,0.05)] rounded-2xl text-left hover:border-[rgba(0,0,0,0.2)] hover:bg-[rgba(0,0,0,0.02)] transition-all flex items-center gap-6"
                  >
                    <div className="w-14 h-14 rounded-xl bg-[rgba(0,0,0,0.03)] border border-[rgba(0,0,0,0.05)] text-warm-500 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                      <FaEdit />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-[rgba(0,0,0,0.95)] text-lg">Start from Scratch</h3>
                      <p className="text-warm-400 text-xs mt-1">Begin with a clean template and edit manually.</p>
                    </div>
                    <FaArrowRight className="text-warm-200 group-hover:text-warm-600 transition-colors" />
                  </button>
                </div>

                <div className="mt-8">
                  <button 
                    onClick={() => navigate('/templates')}
                    className="text-warm-400 text-xs hover:text-[#0075de] font-medium transition-colors"
                  >
                    Changed my mind? Go back to templates
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="container-narrow py-8 flex-1 flex flex-col">
        {/* Navigation */}
        <button 
          onClick={() => navigate('/templates')}
          className="flex items-center gap-2 text-warm-400 hover:text-[#0075de] text-sm font-medium mb-8 transition-colors group"
        >
          <FaArrowLeft className="text-[10px] group-hover:-translate-x-1 transition-transform" />
          Back to Templates
        </button>

        <div className="grid lg:grid-cols-12 gap-12 flex-1">
          {/* Left Side: Template Info */}
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-8">
              <h1 className="text-2xl font-bold text-[rgba(0,0,0,0.95)] mb-2">Great choice!</h1>
              <p className="text-warm-500 text-sm mb-6">You've selected the <span className="font-bold text-[#0075de]">{template.name}</span> template. Now, let's get your data ready.</p>
              
              <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-[rgba(0,0,0,0.1)] bg-white shadow-sm p-1">
                <img src={template.previewImage} alt={template.name} className="w-full h-full object-cover object-top" />
              </div>
            </div>
          </div>

          {/* Right Side: Step-by-Step Onboarding */}
          <div className="lg:col-span-8 space-y-10">
            <div className="space-y-8">
              {/* Step 1 & 2 */}
              <div className="grid sm:grid-cols-2 gap-6">
                <StepCard
                  number={1}
                  icon={<FaDownload className="text-[#2a9d99]" />}
                  title="Download Schema"
                  description={`Get the specialized Markdown schema for the ${template.name} template.`}
                >
                  <div className="mt-4">
                    <button 
                      onClick={downloadSchema} 
                      className="w-full text-[11px] font-bold py-2 px-3 bg-white border border-[rgba(0,117,222,0.2)] text-[#0075de] rounded-xl hover:bg-[#0075de] hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <FaDownload /> Download {template.name} Schema
                    </button>
                  </div>
                </StepCard>

                <StepCard
                  number={2}
                  icon={<FaRobot className="text-[#dc3522]" />}
                  title="Generate with AI"
                  description="Send your resume image and the schema to ChatGPT/Claude."
                >
                   <div className="mt-3 p-3 bg-yellow-50 border border-yellow-100 rounded-xl text-[11px] text-yellow-800 leading-relaxed">
                    <div className="flex items-center gap-1.5 font-bold mb-1 text-left">
                      <FaImage className="text-sm" /> Pro Tip
                    </div>
                    <p className="text-left leading-relaxed">Convert your PDF to a high-quality image (PNG/JPG) before uploading to the AI for better layout recognition.</p>
                  </div>
                </StepCard>
              </div>

              {/* Step 3: Paste Markdown */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.1)] shadow-sm"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(0,117,222,0.08)] border border-[rgba(0,117,222,0.1)] text-[#0075de] flex items-center justify-center text-lg font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-[rgba(0,0,0,0.95)]">Paste Markdown</h3>
                    <p className="text-warm-400 text-xs">Copy the Markdown generated by the AI and paste it below.</p>
                  </div>
                </div>

                <div className="relative group">
                  <textarea
                    value={markdown}
                    onChange={(e) => setMarkdown(e.target.value)}
                    placeholder="Paste your markdown here (starting with ---)..."
                    className="w-full h-64 p-4 bg-[#fcfcfb] border border-[rgba(0,0,0,0.08)] rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0075de] focus:border-transparent transition-all resize-none"
                  />
                  {markdown && (
                    <div className="absolute top-4 right-4 text-[#2a9d99] flex items-center gap-1.5 text-[10px] font-bold bg-white px-2 py-1 rounded-md border border-[rgba(42,157,153,0.1)] shadow-sm">
                      <FaCheckCircle /> Content Ready
                    </div>
                  )}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-[11px] text-warm-400 leading-relaxed max-w-sm">
                    Once you paste the Markdown, we'll parse it and take you to the final editor where you can fine-tune every detail.
                  </p>
                  <button
                    disabled={!markdown.trim() || isImporting}
                    onClick={handleImport}
                    className="w-full sm:w-auto px-8 py-3 bg-[#0075de] text-white rounded-xl font-bold shadow-lg shadow-[rgba(0,117,222,0.2)] hover:bg-[#005bab] disabled:opacity-50 disabled:hover:translate-y-0 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
                  >
                    {isImporting ? 'Processing...' : 'Continue to Editor'}
                    <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepCard({ number, icon, title, description, children }: { 
  number: number; 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (number - 1) * 0.1 }}
      className="bg-white rounded-2xl p-5 border border-[rgba(0,0,0,0.1)] shadow-sm flex flex-col h-full"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-[rgba(0,0,0,0.03)] border border-[rgba(0,0,0,0.05)] text-[rgba(0,0,0,0.95)] flex items-center justify-center text-sm font-bold">
          {number}
        </div>
        <div className="text-lg">{icon}</div>
      </div>
      <h3 className="font-bold text-[rgba(0,0,0,0.95)] text-sm mb-1">{title}</h3>
      <p className="text-warm-500 text-[11px] leading-relaxed flex-1">{description}</p>
      {children}
    </motion.div>
  );
}
