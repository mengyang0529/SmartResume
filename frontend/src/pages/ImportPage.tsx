import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { RESUME_TEMPLATES } from '@data/templates';
import { parseMarkdownResume } from '@utils/markdownParser';
import { convertPdfToImage } from '@utils/pdfToImage';
import { storage } from '@utils/storage';
import { ChoiceModal } from '@components/import/ChoiceModal';
import { OnboardingContent } from '@components/import/OnboardingContent';

export default function ImportPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { setActiveTemplateId } = useOutletContext<{ setActiveTemplateId: (id: string) => void }>();

  const [markdown, setMarkdown] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [showChoiceModal, setShowChoiceModal] = useState(true);

  const [isConverting, setIsConverting] = useState(false);
  const [convertedImages, setConvertedImages] = useState<string[]>([]);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const template = RESUME_TEMPLATES.find(t => t.slug === templateId) || RESUME_TEMPLATES[0];

  useEffect(() => {
    setActiveTemplateId(template.slug);
  }, [template.slug, setActiveTemplateId]);

  const getSchemaPath = () => {
    return `${template.basePath}${template.schemaFile || 'schema.md'}`;
  };

  const downloadSchema = () => {
    const path = getSchemaPath();
    const link = document.createElement('a');
    link.href = path;
    link.download = path.split('/').pop() || 'schema.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') return;
    setIsConverting(true);
    try {
      const dataUrl = await convertPdfToImage(file);
      setConvertedImages([dataUrl]);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `resume-image-${templateId}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert('Failed to convert PDF.');
    } finally {
      setIsConverting(false);
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async event => {
      const content = event.target?.result as string;
      if (content) {
        setMarkdown(content);
        if (content.includes('---')) await processImport(content);
      }
    };
    reader.readAsText(file);
  };

  const processImport = async (content: string) => {
    setIsImporting(true);
    try {
      const parsed = parseMarkdownResume(content);
      await storage.saveState({ ...parsed, version: 2, templateSlug: template.slug });
      navigate(`/editor/${template.slug}`);
    } catch (error) {
      alert('Failed to parse Markdown.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="bg-[#fcfcfb] min-h-[calc(100vh-55px)] flex flex-col relative">
      <ChoiceModal
        show={showChoiceModal}
        onClose={() => setShowChoiceModal(false)}
        onSelectImport={() => setShowChoiceModal(false)}
        onSelectScratch={() => navigate(`/editor/${template.slug}`)}
        onGoBack={() => navigate('/templates')}
      />

      <div className="container-narrow py-8 flex-1 flex flex-col">
        <button
          onClick={() => navigate('/templates')}
          className="flex items-center gap-2 text-warm-400 hover:text-[#0075de] text-sm font-medium mb-8 transition-colors group"
        >
          <FaArrowLeft className="text-[10px] group-hover:-translate-x-1 transition-transform" />
          Back to Templates
        </button>

        <div className="grid lg:grid-cols-12 gap-12 flex-1">
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-8">
              <h1 className="text-2xl font-bold text-[rgba(0,0,0,0.95)] mb-2">Great choice!</h1>
              <p className="text-warm-500 text-sm mb-6">
                You've selected the{' '}
                <span className="font-bold text-[#0075de]">{template.name}</span> template.
              </p>
              <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-[rgba(0,0,0,0.1)] bg-white shadow-sm p-1">
                <img
                  src={template.previewImage}
                  alt={template.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <OnboardingContent
              templateName={template.name}
              downloadSchema={downloadSchema}
              isConverting={isConverting}
              convertedImages={convertedImages}
              pdfInputRef={pdfInputRef}
              handlePdfUpload={handlePdfUpload}
              markdown={markdown}
              isImporting={isImporting}
              handleFileImport={handleFileImport}
              handleImport={() => processImport(markdown)}
              setMarkdown={setMarkdown}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
