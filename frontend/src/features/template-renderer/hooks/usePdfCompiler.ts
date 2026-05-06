import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { EditorState } from '@app-types/editorState';
import { findTemplateBySlug, RESUME_TEMPLATES } from '@data/templates';
import { useTypstCompiler } from './useTypstCompiler';
import { generateResumeTypst } from '../generators';

export function usePdfCompiler(config: { state: EditorState }) {
  const { state } = config;

  const lastCompileSource = useRef('');

  const {
    isCompiling,
    error: compileError,
    pdfBlobUrl,
    compile: triggerCompile,
    setPhoto,
    removePhoto,
  } = useTypstCompiler({ debounceMs: 400 });

  const currentTemplate = useMemo(
    () => findTemplateBySlug(state.templateSlug) || RESUME_TEMPLATES[0],
    [state.templateSlug]
  );

  const generateTypstNow = useCallback(() => {
    const source = generateResumeTypst(
      state.personal,
      state.contentBlocks,
      state.supplementaryBlocks,
      currentTemplate.settings,
      currentTemplate.slug
    );
    if (source !== lastCompileSource.current) {
      lastCompileSource.current = source;
      triggerCompile(source, currentTemplate.id);
    }
  }, [state.personal, state.contentBlocks, state.supplementaryBlocks, currentTemplate, triggerCompile]);

  // Auto-compile
  useEffect(() => {
    if (state.personal.firstName || state.contentBlocks.length > 0) {
      generateTypstNow();
    }
  }, [generateTypstNow]);

  // Sync photo to compiler
  useEffect(() => {
    if (state.personal.photo?.url) {
      setPhoto(state.personal.photo.url);
    } else {
      removePhoto();
    }
  }, [state.personal.photo?.url, setPhoto, removePhoto]);

  const handleRefreshPreview = useCallback(() => {
    generateTypstNow();
  }, [generateTypstNow]);

  const handleDownloadPdf = useCallback(() => {
    if (!pdfBlobUrl) return;
    const a = document.createElement('a');
    a.href = pdfBlobUrl;
    a.download = `${state.personal.firstName || 'resume'}_${state.personal.lastName || 'export'}.pdf`;
    a.click();
  }, [pdfBlobUrl, state.personal]);

  return {
    pdfUrl: pdfBlobUrl,
    isCompiling,
    compileError,
    handleRefreshPreview,
    handleDownloadPdf,
  };
}
