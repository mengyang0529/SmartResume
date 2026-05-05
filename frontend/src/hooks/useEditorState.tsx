import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import type { PersonalInfo } from '@app-types/resume';
import type { EditorState } from '@app-types/editorState';
import type { RichTextBlock } from '@app-types/richText';
import { getAccentColor } from '@utils/typstGenerators';
import { generateMarkdownResume } from '@utils/markdownGenerator';
import { parseMarkdownResume } from '@utils/markdownParser';
import { generateId } from '@utils/id';
import { findTemplateBySlug, RESUME_TEMPLATES } from '@data/templates';
import { usePdfCompiler } from './usePdfCompiler';
import { useEditorPersistence } from './useEditorPersistence';
import { downloadBlob } from '@utils/download';

const INITIAL_PERSONAL: PersonalInfo = {
  firstName: '',
  lastName: '',
  position: '',
  email: '',
  mobile: '',
  address: '',
  homepage: '',
};

export function useEditorState() {
  const { templateId } = useParams();

  // ── Core state ──────────────────────────────────────────────
  const [state, setState] = useState<EditorState>({
    version: 2,
    personal: INITIAL_PERSONAL,
    contentBlocks: [],
    supplementaryBlocks: [],
    templateSlug: templateId || 'classic',
  });
  const [isSample, setIsSample] = useState(false);

  // ── Compile ──────────────────────────────────────────────────
  const compile = usePdfCompiler({ state });

  // ── Persistence ─────────────────────────────────────────────
  const persist = useEditorPersistence({
    templateId,
    state,
    setState,
    setIsSample,
  });

  // ── Template switching ───────────────────────────────────────
  useEffect(() => {
    if (templateId && templateId !== state.templateSlug) {
      setState(prev => ({ ...prev, templateSlug: templateId }));
    }
  }, [templateId, state.templateSlug]);

  // ── Handlers ────────────────────────────────────────────────
  const setPersonal = useCallback((personal: PersonalInfo) => {
    setState(prev => ({ ...prev, personal }));
  }, []);

  const setContentBlocks = useCallback((contentBlocks: RichTextBlock[]) => {
    setState(prev => ({ ...prev, contentBlocks }));
  }, []);

  const setSupplementaryBlocks = useCallback((supplementaryBlocks: RichTextBlock[]) => {
    setState(prev => ({ ...prev, supplementaryBlocks }));
  }, []);

  const handleChange = useCallback(() => setIsSample(false), []);

  const addSection = () => {
    handleChange();
    const newId = generateId('block');
    setContentBlocks([...state.contentBlocks, { id: newId, type: 'h1', content: 'New Section' }]);
  };

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const raw = reader.result as string;
          const parsed = parseMarkdownResume(raw);
          setState({ ...parsed, version: 2, templateSlug: state.templateSlug });
          setIsSample(false);
        } catch (_) {
          /* ignore */
        }
      };
      reader.readAsText(file);
      event.target.value = '';
    },
    [state.templateSlug]
  );

  const handleExportMarkdown = () => {
    const md = generateMarkdownResume({
      personal: state.personal,
      contentBlocks: state.contentBlocks,
      supplementaryBlocks: state.supplementaryBlocks,
    });
    const blob = new Blob([md], { type: 'text/markdown' });
    downloadBlob(blob, `${state.personal.firstName || 'resume'}-backup.md`);
  };

  // ── Photo ────────────────────────────────────────────────────
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const handlePhotoClick = () => photoInputRef.current?.click();
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleChange();
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPersonal({ ...state.personal, photo: { url: dataUrl, shape: 'circle' } });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };
  const handlePhotoRemove = () => {
    setPersonal({ ...state.personal, photo: undefined });
  };

  // ── Derived values ───────────────────────────────────────────
  const currentTemplate = useMemo(
    () => findTemplateBySlug(state.templateSlug) || RESUME_TEMPLATES[0],
    [state.templateSlug]
  );
  const accentColor = useMemo(() => getAccentColor(currentTemplate.settings), [currentTemplate]);

  return {
    state,
    personal: state.personal,
    contentBlocks: state.contentBlocks,
    supplementaryBlocks: state.supplementaryBlocks,
    setPersonal,
    setContentBlocks,
    setSupplementaryBlocks,
    isSample,
    pdfUrl: compile.pdfUrl,
    compileError: compile.compileError,
    isCompiling: compile.isCompiling,
    currentTemplate,
    accentColor,
    handleChange,
    photoInputRef,
    fileInputRef: persist.fileInputRef,
    handlePhotoClick,
    handlePhotoUpload,
    handlePhotoRemove,
    handleRefreshPreview: compile.handleRefreshPreview,
    handleExportMarkdown,
    handleDownloadPdf: compile.handleDownloadPdf,
    openImportFile: persist.openImportFile,
    handleFileUpload,
    addSection,
  };
}
