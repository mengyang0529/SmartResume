import { useCallback, useEffect } from 'react';
import clsx from 'clsx';
import { useOutletContext } from 'react-router-dom';

import { RichTextEditor } from '@features/editor/components/RichTextEditor';
import ResumeEditorToolbar from '@features/editor/components/ResumeEditorToolbar';
import ResumePdfPreview from '@features/editor/components/ResumePdfPreview';
import ResumePersonalInfoSection from '@features/editor/components/ResumePersonalInfoSection';
import SectionCard from '@features/editor/components/SectionCard';
import { useEditorState } from '@features/editor/hooks/useEditorState';

export default function ResumeEditorPage() {
  const editor = useEditorState();
  const { setActiveTemplateId } = useOutletContext<{ setActiveTemplateId: (id: string) => void }>();

  useEffect(() => {
    setActiveTemplateId(editor.state.templateSlug);
  }, [editor.state.templateSlug, setActiveTemplateId]);

  const handleContentChange = useCallback(
    (blocks: typeof editor.contentBlocks) => {
      editor.handleChange();
      editor.setContentBlocks(blocks);
    },
    [editor]
  );

  const handleSupplementaryChange = useCallback(
    (blocks: typeof editor.supplementaryBlocks) => {
      editor.handleChange();
      editor.setSupplementaryBlocks(blocks);
    },
    [editor]
  );

  const handlePersonalFieldChange = useCallback(
    (updater: (prev: typeof editor.personal) => typeof editor.personal) => {
      editor.handleChange();
      editor.setPersonal(updater(editor.personal));
    },
    [editor]
  );

  return (
    <div className="min-h-[calc(100vh-55px)] lg:h-[calc(100vh-55px)] bg-[#f0efed] flex flex-col selection:bg-[rgba(0,117,222,0.15)]">
      <ResumeEditorToolbar
        openImportFile={editor.openImportFile}
        handleExportMarkdown={editor.handleExportMarkdown}
        currentTemplate={editor.currentTemplate}
      />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {editor.compileError && (
            <div className="px-4 pt-4">
              <div className="p-3 rounded-lg bg-[rgba(221,91,0,0.06)] border border-[rgba(221,91,0,0.15)] text-warm-600 text-xs">
                {editor.compileError}
              </div>
            </div>
          )}

          <div
            className={clsx(
              'px-3 sm:px-4 py-4 sm:py-6 space-y-6 pb-8 lg:pb-24',
              editor.isSample && 'opacity-60'
            )}
          >
            <section id="section-personal">
              <SectionCard title="Personal Information">
                <ResumePersonalInfoSection
                  personal={editor.personal}
                  onFieldChange={handlePersonalFieldChange}
                  onPhotoClick={editor.handlePhotoClick}
                  onPhotoUpload={editor.handlePhotoUpload}
                  onPhotoRemove={editor.handlePhotoRemove}
                  photoInputRef={editor.photoInputRef}
                />
              </SectionCard>
            </section>

            <section id="section-content">
              <SectionCard
                title="Resume Content"
                subtitle="Add and arrange your resume sections with the rich text editor"
              >
                <RichTextEditor
                  blocks={editor.contentBlocks}
                  onChange={handleContentChange}
                />
              </SectionCard>
            </section>

            <section id="section-supplementary">
              <SectionCard
                title="Supplementary Info"
                subtitle="Use H1 for section headings; all other block types can be used freely."
              >
                <RichTextEditor
                  blocks={editor.supplementaryBlocks}
                  onChange={handleSupplementaryChange}
                />
              </SectionCard>
            </section>
          </div>
        </div>

        <ResumePdfPreview
          currentTemplate={editor.currentTemplate}
          isCompiling={editor.isCompiling}
          pdfUrl={editor.pdfUrl}
          onRefresh={editor.handleRefreshPreview}
          onDownload={editor.handleDownloadPdf}
        />
      </div>

      <input
        ref={editor.fileInputRef}
        type="file"
        accept=".md,text/markdown"
        className="hidden"
        onChange={editor.handleFileUpload}
      />
    </div>
  );
}
