import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { EditorState } from '@app-types/editorState';
import { findTemplateBySlug, RESUME_TEMPLATES } from '@data/templates';
import { useTypstCompiler } from './useTypstCompiler';
import { generateResumeTypst } from '../generators';

export function usePdfCompiler(config: { state: EditorState }) {
  const { state } = config;

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const pdfUrlRef = useRef<string | null>(null);
  const lastCompileSource = useRef('');

  const onCompileResult = useCallback((pdfBytes: ArrayBuffer) => {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);
    pdfUrlRef.current = url;
    setPdfUrl(url);
  }, []);

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

  useEffect(() => {
    return () => {
      if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);
    };
  }, []);

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
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `${state.personal.firstName || 'resume'}_${state.personal.lastName || 'export'}.pdf`;
    a.click();
  }, [pdfUrl, state.personal]);

  return {
    pdfUrl,
    isCompiling,
    compileError,
    currentTemplate,
    setPhoto,
    removePhoto,
    handleRefreshPreview,
    handleDownloadPdf,
  };
}
