import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ResumeData, TemplateSettings } from '../types/resume';
import type { RichTextBlock } from '../types/richText';
import type { ResumeTemplate } from '../data/templates';
import { DEFAULT_TEMPLATE } from '../data/templates';
import { useTypstCompiler } from './useTypstCompiler';
import { generateResumeTypst } from '../utils/typstGenerators';
import { historyService } from '../services/historyService';

export function useResumeCompile(config: {
  templateSettings: TemplateSettings;
  templates: ResumeTemplate[];
  resumeData: ResumeData;
  skillsBlocks: RichTextBlock[] | undefined;
}) {
  const { templateSettings, templates, resumeData, skillsBlocks } = config;

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const pdfUrlRef = useRef<string | null>(null);
  const compilingTemplateRef = useRef(1);
  const lastCompileSource = useRef('');

  const onCompileResult = useCallback((pdfBytes: ArrayBuffer, compileId?: number) => {
    if (compileId && compileId !== compilingTemplateRef.current) return;
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);
    pdfUrlRef.current = url;
    setPdfUrl(url);

    // Save to history on successful compile
    historyService.saveSnapshot({ ...resumeData, skillsBlocks });
  }, [resumeData, skillsBlocks]);

  const {
    isCompiling,
    error: compileError,
    compile: triggerCompile,
    setPhoto,
    removePhoto,
  } = useTypstCompiler({
    debounceMs: 400,
    onCompileResult,
  });

  // Cleanup PDF URL on unmount
  useEffect(() => {
    return () => {
      if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);
    };
  }, []);

  const generateTypstNow = useCallback(
    (data: ResumeData, blocks?: RichTextBlock[]) => {
      const source = generateResumeTypst(data, templateSettings, blocks);
      if (source !== lastCompileSource.current) {
        lastCompileSource.current = source;
        const tpl = templates.find(t => t.settings.template === templateSettings.template);
        const templateIdVal = tpl?.id ?? 1;
        compilingTemplateRef.current = templateIdVal;
        triggerCompile(source, templateIdVal);
      }
    },
    [templateSettings, triggerCompile, templates]
  );

  // Auto-compile whenever resume data or template changes
  useEffect(() => {
    // Only compile on template change or initial load if we don't have a PDF yet
    if (!pdfUrl && (resumeData.personal.firstName || resumeData.sections.length > 0)) {
      generateTypstNow(resumeData, skillsBlocks);
    }
  }, [templateSettings.template, generateTypstNow, pdfUrl, resumeData.personal.firstName, resumeData.sections.length, skillsBlocks]);

  const handleRefreshPreview = useCallback(() => {
    if (resumeData.personal.firstName || resumeData.sections.length > 0) {
      generateTypstNow(resumeData, skillsBlocks);
    }
  }, [resumeData, skillsBlocks, generateTypstNow]);

  const handleDownloadPdf = useCallback(() => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `${resumeData.personal.firstName || 'resume'}_${
      resumeData.personal.lastName || 'export'
    }.pdf`;
    a.click();
  }, [pdfUrl, resumeData]);

  const currentTemplate = useMemo(
    () =>
      templates.find(t => t.settings.template === templateSettings.template) ?? DEFAULT_TEMPLATE,
    [templateSettings.template, templates]
  );

  return {
    pdfUrl,
    isCompiling,
    compileError,
    currentTemplate,
    setPhoto,
    removePhoto,
    generateTypstNow,
    handleRefreshPreview,
    handleDownloadPdf,
  };
}
