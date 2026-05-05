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
  // P3-3: 结构化后的编辑器实例
  const editor = useEditorState();
  const { data, actions, photo, io, pdf } = editor;
  
  const { setActiveTemplateId } = useOutletContext<{ setActiveTemplateId: (id: string) => void }>();

  useEffect(() => {
    setActiveTemplateId(data.templateSlug);
  }, [data.templateSlug, setActiveTemplateId]);

  const handleContentChange = useCallback(
    (blocks: typeof data.contentBlocks) => {
      actions.handleChange();
      actions.setContentBlocks(blocks);
    },
    [actions, data.contentBlocks]
  );

  const handleSupplementaryChange = useCallback(
    (blocks: typeof data.supplementaryBlocks) => {
      actions.handleChange();
      actions.setSupplementaryBlocks(blocks);
    },
    [actions, data.supplementaryBlocks]
  );

  const handlePersonalFieldChange = useCallback(
    (updater: (prev: typeof data.personal) => typeof data.personal) => {
      actions.handleChange();
      actions.setPersonal(updater(data.personal));
    },
    [actions, data.personal]
  );

  return (
    <div className="min-h-[calc(100vh-55px)] lg:h-[calc(100vh-55px)] bg-[#f0efed] flex flex-col selection:bg-[rgba(0,117,222,0.15)]">
      <ResumeEditorToolbar
        openImportFile={io.open}
        handleExportMarkdown={io.exportMd}
        currentTemplate={data.currentTemplate}
      />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {pdf.error && (
            <div className="px-4 pt-4">
              <div className="p-3 rounded-lg bg-[rgba(221,91,0,0.06)] border border-[rgba(221,91,0,0.15)] text-warm-600 text-xs">
                {pdf.error}
              </div>
            </div>
          )}

          <div
            className={clsx(
              'px-3 sm:px-4 py-4 sm:py-6 space-y-6 pb-8 lg:pb-24',
              data.isSample && 'opacity-60'
            )}
          >
            <section id="section-personal">
              <SectionCard title="Personal Information">
                <ResumePersonalInfoSection
                  personal={data.personal}
                  onFieldChange={handlePersonalFieldChange}
                  onPhotoClick={photo.click}
                  onPhotoUpload={photo.upload}
                  onPhotoRemove={photo.remove}
                  photoInputRef={photo.ref}
                />
              </SectionCard>
            </section>

            <section id="section-content">
              <SectionCard
                title="Resume Content"
                subtitle="Add and arrange your resume sections with the rich text editor"
              >
                <RichTextEditor
                  blocks={data.contentBlocks}
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
                  blocks={data.supplementaryBlocks}
                  onChange={handleSupplementaryChange}
                />
              </SectionCard>
            </section>
          </div>
        </div>

        <ResumePdfPreview
          currentTemplate={data.currentTemplate}
          isCompiling={pdf.isCompiling}
          pdfUrl={pdf.url}
          onRefresh={pdf.refresh}
          onDownload={pdf.download}
        />
      </div>

      <input
        ref={io.ref}
        type="file"
        accept=".md,text/markdown"
        className="hidden"
        onChange={io.upload}
      />
    </div>
  );
}
