import { FaDownload, FaFileUpload, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { StepCard } from './StepCard';

interface Step1And2Props {
  templateName: string;
  downloadSchema: () => void;
  isConverting: boolean;
  convertedImages: string[];
  pdfInputRef: React.RefObject<HTMLInputElement>;
  handlePdfUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Step1And2({
  templateName,
  downloadSchema,
  isConverting,
  convertedImages,
  pdfInputRef,
  handlePdfUpload,
}: Step1And2Props) {
  return (
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
            <FaDownload /> Download {templateName} Schema
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
  );
}
