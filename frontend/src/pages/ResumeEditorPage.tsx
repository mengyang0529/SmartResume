import { useCallback } from 'react'
import clsx from 'clsx'

import { RichTextEditor } from '../components/RichTextEditor'
import HistoryPanel from '../components/HistoryPanel'
import ResumeEditorToolbar from '../components/ResumeEditorToolbar'
import ResumePdfPreview from '../components/ResumePdfPreview'
import ResumePersonalInfoSection from '../components/ResumePersonalInfoSection'
import SectionCard from '../components/SectionCard'
import { useResumeEditor } from '../hooks/useResumeEditor'
import { blocksToModules } from '../utils/resumeTransforms'
import { blocksToSkills } from '../utils/resumeEditorUtils'

export default function ResumeEditorPage() {
  const editor = useResumeEditor()

  const handleModuleChange = useCallback((blocks: typeof editor.moduleBlocks) => {
    editor.handleChange()
    editor.setModuleBlocks(blocks)
    editor.setResumeData(prev => ({ ...prev, sections: blocksToModules(blocks) }))
  }, [editor])

  const handleSkillsChange = useCallback((blocks: typeof editor.skillsBlocks) => {
    editor.handleChange()
    editor.setSkillsBlocks(blocks)
    editor.setResumeData(p => ({ ...p, skills: blocksToSkills(blocks) }))
  }, [editor])

  const handlePersonalFieldChange = useCallback(
    (updater: (prev: typeof editor.resumeData) => typeof editor.resumeData) => {
      editor.handleChange()
      editor.setResumeData(updater)
    },
    [editor]
  )

  return (
    <div className="min-h-[calc(100vh-55px)] lg:h-[calc(100vh-55px)] bg-[#f0efed] flex flex-col selection:bg-[rgba(0,117,222,0.15)]">
      <ResumeEditorToolbar
        showNav={editor.showNav}
        setShowNav={editor.setShowNav}
        navItems={editor.navItems}
        addSection={editor.addSection}
        openImportFile={editor.openImportFile}
        handleExportMarkdown={editor.handleExportMarkdown}
        setShowHistory={editor.setShowHistory}
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

          <div className={clsx("px-3 sm:px-4 py-4 sm:py-6 space-y-6 pb-8 lg:pb-24", editor.isSample && "opacity-60")}>
            <section id="section-personal">
              <SectionCard title="Personal Information">
                <ResumePersonalInfoSection
                  resumeData={editor.resumeData}
                  onFieldChange={handlePersonalFieldChange}
                  onPhotoClick={editor.handlePhotoClick}
                  onPhotoUpload={editor.handlePhotoUpload}
                  onPhotoRemove={editor.handlePhotoRemove}
                  photoInputRef={editor.photoInputRef}
                />
              </SectionCard>
            </section>

            <section id="section-modules">
              <SectionCard title="Resume Modules" subtitle="Add and arrange your resume sections with the rich text editor">
                <RichTextEditor
                  blocks={editor.moduleBlocks}
                  onChange={handleModuleChange}
                  headingColor={editor.accentColor}
                  showMetadata={editor.currentTemplate.settings.template === 'shokumukeirekisho'}
                />
              </SectionCard>
            </section>

            <section id="section-skills">
              <SectionCard title="Expertise" subtitle="Use H2 for category names and H3/bullet for individual skills">
                <RichTextEditor
                  blocks={editor.skillsBlocks}
                  onChange={handleSkillsChange}
                  headingColor={editor.accentColor}
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

      <input ref={editor.fileInputRef} type="file" accept=".md,text/markdown" className="hidden" onChange={editor.handleFileUpload} />

      <HistoryPanel
        open={editor.showHistory}
        onClose={() => editor.setShowHistory(false)}
        onRestore={editor.handleHistoryRestore}
      />
    </div>
  )
}
