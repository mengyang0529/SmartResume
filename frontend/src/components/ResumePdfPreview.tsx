import { FaSpinner, FaSync, FaDownload } from 'react-icons/fa';

interface ResumePdfPreviewProps {
  currentTemplate: { name: string };
  isCompiling: boolean;
  pdfUrl: string | null;
  onRefresh: () => void;
  onDownload: () => void;
}

export default function ResumePdfPreview({
  currentTemplate,
  isCompiling,
  pdfUrl,
  onRefresh,
  onDownload,
}: ResumePdfPreviewProps) {
  return (
    <div className="flex-1 lg:flex-none min-h-[300px] sm:min-h-[520px] lg:min-h-0 lg:h-auto lg:w-[760px] xl:w-[860px] border-t lg:border-t-0 lg:border-l border-[rgba(0,0,0,0.1)] bg-white flex flex-col">
      <div className="shrink-0 px-5 py-3 border-b border-[rgba(0,0,0,0.1)] flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-[rgba(0,0,0,0.95)]">
            {currentTemplate.name} Preview
          </h3>
          <p className="text-xs text-warm-500 mt-0.5">Current template PDF preview</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isCompiling}
            className="text-xs font-semibold px-4 py-1.5 rounded-md border border-[#0075de] text-[#0075de] hover:bg-[rgba(0,117,222,0.04)] transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 shadow-sm active:scale-95"
          >
            {isCompiling ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaSync className="text-[10px]" />
            )}
            Refresh Preview
          </button>
          <button
            onClick={onDownload}
            disabled={isCompiling || !pdfUrl}
            className="text-xs font-medium px-3 py-1.5 rounded-md bg-[#0075de] text-white hover:bg-[#005bab] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none"
          >
            {isCompiling ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaDownload className="text-[10px]" />
            )}
            PDF
          </button>
        </div>
      </div>
      <div className="flex-1 p-4 bg-[#f0efed]">
        {pdfUrl ? (
          <object
            data={pdfUrl}
            type="application/pdf"
            className="w-full h-full rounded-standard shadow-sm border border-[rgba(0,0,0,0.1)] bg-white"
            title={`${currentTemplate.name} PDF Preview`}
          >
            <div className="flex items-center justify-center h-full text-warm-400 text-sm">
              PDF preview not available on this browser.{' '}
              <a href={pdfUrl} className="text-[#0075de] underline ml-1" target="_blank">
                Open
              </a>
            </div>
          </object>
        ) : (
          <div className="flex items-center justify-center h-full text-warm-400 text-sm">
            {isCompiling ? 'Compiling...' : 'Click Refresh to preview'}
          </div>
        )}
      </div>
    </div>
  );
}
