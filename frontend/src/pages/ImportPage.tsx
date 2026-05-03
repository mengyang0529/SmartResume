import { useState, useRef } from 'react';
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
  FaEdit,
  FaFileUpload,
  FaSpinner,
  FaExternalLinkAlt
} from 'react-icons/fa';
import { RESUME_TEMPLATES } from '../data/templates';
import { parseMarkdownResume } from '../utils/markdownIO';
import localforage from 'localforage';

// PDF.js setup
import * as pdfjs from 'pdfjs-dist';
// Use Vite's ?url import to get the correct path to the worker
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function ImportPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const [markdown, setMarkdown] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [showChoiceModal, setShowChoiceModal] = useState(true);

  // PDF Conversion States
  const [isConverting, setIsConverting] = useState(false);
  const [convertedImages, setConvertedImages] = useState<string[]>([]);
  const pdfInputRef = useRef<HTMLInputElement>(null);

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

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') return;

    setIsConverting(true);
    setConvertedImages([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      
      const pageImages = [];
      let totalHeight = 0;
      let maxWidth = 0;

      // 1. Render each page to its own canvas first
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = viewport.width;
        tempCanvas.height = viewport.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) continue;

        // Fill white for the page
        tempCtx.fillStyle = '#ffffff';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        await page.render({
          canvasContext: tempCtx,
          viewport: viewport
        }).promise;

        pageImages.push(tempCanvas);
        totalHeight += viewport.height;
        maxWidth = Math.max(maxWidth, viewport.width);
      }

      // 2. Stitch them together on a final canvas
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = maxWidth;
      finalCanvas.height = totalHeight;
      const finalCtx = finalCanvas.getContext('2d');
      if (!finalCtx) throw new Error('Could not create final canvas context');

      // Fill entire background white
      finalCtx.fillStyle = '#ffffff';
      finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

      let currentY = 0;
      for (const canvas of pageImages) {
        // Center horizontally
        const x = (maxWidth - canvas.width) / 2;
        finalCtx.drawImage(canvas, x, currentY);
        currentY += canvas.height;
      }

      setConvertedImages([finalCanvas.toDataURL('image/png')]);
      
      // 3. Trigger download immediately
      const dataUrl = finalCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `resume-image-${templateId}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('PDF conversion failed:', error);
      alert('Failed to convert PDF. Please try again or use a screenshot.');
    } finally {
      setIsConverting(false);
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        setMarkdown(content);
        if (content.includes('---')) {
          await processImport(content);
        }
      }
    };
    reader.readAsText(file);
  };

  const processImport = async (content: string) => {
    setIsImporting(true);
    try {
      const data = parseMarkdownResume(content);
      await localforage.setItem(`current_resume_data_${template.settings.template}`, data);
      navigate(`/editor/${template.slug}`);
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to parse Markdown. Please ensure it follows the schema.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleImport = async () => {
    if (!markdown.trim()) return;
    await processImport(markdown);
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
                  description="Get the specialized Markdown schema for your AI assistant."
                >
                  <div className="mt-4">
                    <button 
                      onClick={downloadSchema} 
                      className="w-full text-[11px] font-bold py-2.5 px-3 bg-white border border-[rgba(0,117,222,0.2)] text-[#0075de] rounded-xl hover:bg-[#0075de] hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <FaDownload /> Download {template.name} Schema
                    </button>
                  </div>
                </StepCard>

                <StepCard
                  number={2}
                  icon={<FaFileUpload className="text-[#dc3522]" />}
                  title="PDF to Image"
                  description="Convert your PDF to images for better AI layout recognition."
                >
                  <div className="mt-4 space-y-3">
                    <input 
                      type="file" 
                      accept=".pdf" 
                      className="hidden" 
                      ref={pdfInputRef} 
                      onChange={handlePdfUpload} 
                    />
                    <button 
                      onClick={() => pdfInputRef.current?.click()}
                      disabled={isConverting}
                      className="w-full text-[11px] font-bold py-2.5 px-3 bg-[#fcfcfb] border-2 border-dashed border-[rgba(0,0,0,0.1)] text-warm-500 rounded-xl hover:border-[#0075de] hover:text-[#0075de] transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      {isConverting ? <FaSpinner className="animate-spin" /> : <FaFileUpload />}
                      {isConverting ? 'Converting...' : 'Convert PDF Resume to Image'}
                    </button>

                    {convertedImages.length > 0 && (
                      <div className="pt-2 flex items-center gap-2 text-[#2a9d99] font-bold text-[10px] bg-[#2a9d99]/[0.05] p-2.5 rounded-xl border border-[#2a9d99]/10">
                        <FaCheckCircle className="text-sm" /> Long image saved! Ready for Step 3.
                      </div>
                    )}
                  </div>
                </StepCard>
              </div>

              {/* Step 3: AI Instructions */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  scale: convertedImages.length > 0 ? [1, 1.01, 1] : 1,
                  boxShadow: convertedImages.length > 0 
                    ? "0 20px 25px -5px rgba(0, 117, 222, 0.1), 0 10px 10px -5px rgba(0, 117, 222, 0.04)" 
                    : "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                }}
                transition={{ 
                  delay: 0.2,
                  scale: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                }}
                className={`bg-white rounded-2xl p-6 border transition-colors duration-500 ${
                  convertedImages.length > 0 ? 'border-[#0075de]/30 ring-4 ring-[#0075de]/5' : 'border-[rgba(0,0,0,0.1)]'
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold transition-colors ${
                      convertedImages.length > 0 ? 'bg-[#0075de] text-white' : 'bg-[rgba(220,53,34,0.08)] text-[#dc3522]'
                    }`}>
                      3
                    </div>
                    <div>
                      <h3 className="font-bold text-[rgba(0,0,0,0.95)]">Upload schema and image to GPT or Claude</h3>
                      <p className="text-warm-400 text-xs">Use ChatGPT or Claude to generate your Markdown.</p>
                    </div>
                  </div>
                  {convertedImages.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="px-3 py-1 bg-[#0075de]/10 text-[#0075de] text-[10px] font-bold rounded-full flex items-center gap-1.5 animate-pulse"
                    >
                      <FaExternalLinkAlt /> ACTION REQUIRED
                    </motion.div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border transition-all ${
                    convertedImages.length > 0 
                      ? 'bg-[#0075de]/[0.02] border-[#0075de]/10' 
                      : 'bg-warm-50/50 border-transparent'
                  }`}>
                    <p className="text-[11px] text-warm-500 leading-relaxed mb-4">
                      Now, leave this page briefly and head to your favorite AI assistant:
                    </p>
                    <ul className="grid sm:grid-cols-2 gap-3">
                      <ExternalAIBtn 
                        name="ChatGPT" 
                        url="https://chatgpt.com" 
                        color="text-[#10a37f]" 
                        active={convertedImages.length > 0}
                      />
                      <ExternalAIBtn 
                        name="Claude.ai" 
                        url="https://claude.ai" 
                        color="text-[#d97757]" 
                        active={convertedImages.length > 0}
                      />
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <InstructionItem icon={<FaImage className="text-blue-500" />} text="Upload the long image you just saved." />
                    <InstructionItem icon={<FaDownload className="text-green-500" />} text="Provide the Schema content from Step 1." />
                    <InstructionItem icon={<FaRobot className="text-purple-500" />} text="Instruct the AI: 'Please extract the resume data into the provided Markdown schema'." />
                  </div>
                </div>
              </motion.div>

              {/* Step 4: Import Result File */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 border border-[rgba(0,0,0,0.1)] shadow-sm"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(0,117,222,0.08)] border border-[rgba(0,117,222,0.1)] text-[#0075de] flex items-center justify-center text-lg font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-bold text-[rgba(0,0,0,0.95)]">Import Result File</h3>
                    <p className="text-warm-400 text-xs">Upload the .md file generated by AI to finalize your resume.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div 
                    onClick={() => document.getElementById('md-upload')?.click()}
                    className={`relative group w-full h-32 border-2 border-dashed rounded-2xl transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                      markdown ? 'border-[#2a9d99] bg-[#2a9d99]/[0.02]' : 'border-[rgba(0,0,0,0.1)] hover:border-[#0075de] hover:bg-[#0075de]/[0.02]'
                    }`}
                  >
                    <input 
                      id="md-upload"
                      type="file" 
                      accept=".md,.txt" 
                      className="hidden" 
                      onChange={handleFileImport} 
                    />
                    
                    {isImporting ? (
                      <FaSpinner className="text-2xl text-[#0075de] animate-spin" />
                    ) : markdown ? (
                      <>
                        <div className="w-12 h-12 rounded-full bg-[#2a9d99]/10 text-[#2a9d99] flex items-center justify-center text-xl">
                          <FaCheckCircle />
                        </div>
                        <p className="text-[11px] font-bold text-[#2a9d99]">File Loaded & Ready</p>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-[rgba(0,0,0,0.03)] text-warm-400 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                          <FaFileImport />
                        </div>
                        <p className="text-[11px] font-bold text-warm-500">Click to upload .md file</p>
                      </>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[11px] text-warm-400 leading-relaxed max-w-sm">
                      Once uploaded, we'll automatically parse your resume and open the editor.
                    </p>
                    {markdown && !isImporting && (
                      <button
                        onClick={handleImport}
                        className="w-full sm:w-auto px-8 py-3 bg-[#0075de] text-white rounded-xl font-bold shadow-lg shadow-[rgba(0,117,222,0.2)] hover:bg-[#005bab] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
                      >
                        Finish & Edit
                        <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}
                  </div>

                  <details className="mt-4">
                    <summary className="text-[10px] text-warm-300 cursor-pointer hover:text-warm-500 transition-colors list-none text-center">
                      Wait, I'd rather paste the text manually
                    </summary>
                    <div className="mt-4">
                      <textarea
                        value={markdown}
                        onChange={(e) => setMarkdown(e.target.value)}
                        placeholder="Paste your markdown here..."
                        className="w-full h-32 p-3 bg-[#fcfcfb] border border-[rgba(0,0,0,0.08)] rounded-xl text-[11px] font-mono focus:outline-none focus:ring-2 focus:ring-[#0075de] transition-all resize-none"
                      />
                    </div>
                  </details>
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

function InstructionItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-start gap-3 text-[11px] text-warm-600 bg-[rgba(0,0,0,0.02)] p-2.5 rounded-xl border border-[rgba(0,0,0,0.03)]">
      <span className="mt-0.5">{icon}</span>
      <span>{text}</span>
    </li>
  );
}

function ExternalAIBtn({ name, url, color, active }: { name: string; url: string; color: string; active: boolean }) {
  return (
    <li>
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className={`flex items-center justify-between p-3 rounded-xl border transition-all group ${
          active 
            ? 'bg-white border-[rgba(0,0,0,0.1)] shadow-sm hover:border-[#0075de] hover:shadow-md' 
            : 'bg-warm-50/50 border-transparent opacity-60 grayscale cursor-not-allowed pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${active ? 'bg-[#2a9d99] animate-pulse' : 'bg-warm-300'}`} />
          <span className={`text-[11px] font-bold ${active ? 'text-[rgba(0,0,0,0.8)]' : 'text-warm-400'}`}>{name}</span>
        </div>
        <FaExternalLinkAlt className={`text-[10px] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${active ? color : 'text-warm-300'}`} />
      </a>
    </li>
  );
}
