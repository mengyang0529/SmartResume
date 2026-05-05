import { FaUpload, FaFileDownload } from 'react-icons/fa';

interface ResumeEditorToolbarProps {
  openImportFile: () => void;
  handleExportMarkdown: () => void;
  currentTemplate: { name: string };
}

export default function ResumeEditorToolbar({
  openImportFile,
  handleExportMarkdown,
  currentTemplate,
}: ResumeEditorToolbarProps) {
  return (
    <div className="shrink-0 bg-white border-b border-[rgba(0,0,0,0.1)] px-4 py-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={openImportFile}
              className="px-2.5 py-1.5 rounded-md text-sm text-warm-500 hover:bg-[rgba(0,0,0,0.05)] hover:text-[rgba(0,0,0,0.95)] transition-all flex items-center gap-1.5"
            >
              <FaUpload className="text-xs" />
              <span className="hidden sm:inline text-xs">Import</span>
            </button>
            <button
              onClick={handleExportMarkdown}
              className="px-2.5 py-1.5 rounded-md text-sm text-warm-500 hover:bg-[rgba(0,0,0,0.05)] hover:text-[rgba(0,0,0,0.95)] transition-all flex items-center gap-1.5"
            >
              <FaFileDownload className="text-xs" />
              <span className="hidden sm:inline text-xs">Export</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-warm-400">Template</span>
            <span className="text-xs font-semibold text-[rgba(0,0,0,0.95)]">
              {currentTemplate.name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
