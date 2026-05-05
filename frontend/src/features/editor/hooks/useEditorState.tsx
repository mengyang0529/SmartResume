import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { PersonalInfo } from '@app-types/resume';
import type { EditorState } from '@app-types/editorState';
import type { RichTextBlock } from '@app-types/richText';
import { getAccentColor } from '../../template-renderer/generators';
import { generateId } from '@shared/utils/id';
import { findTemplateBySlug, RESUME_TEMPLATES } from '@data/templates';
import { usePdfCompiler } from '../../template-renderer/hooks/usePdfCompiler';
import { useEditorPersistence } from './useEditorPersistence';
import { usePhotoManager } from './usePhotoManager';
import { useEditorIO } from './useEditorIO';

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

  // ── Feature Hooks ──────────────────────────
  const photo = usePhotoManager(state.personal, setPersonal, handleChange);

  const io = useEditorIO({
    state,
    onImport: (parsed) => {
      setState({ ...parsed, version: 2, templateSlug: state.templateSlug });
      setIsSample(false);
    }
  });

  // ── Template switching ───────────────────────────────────────
  useEffect(() => {
    if (templateId && templateId !== state.templateSlug) {
      setState(prev => ({ ...prev, templateSlug: templateId }));
    }
  }, [templateId, state.templateSlug]);

  const addSection = useCallback(() => {
    handleChange();
    const newId = generateId('block');
    setContentBlocks([...state.contentBlocks, { id: newId, type: 'h1', content: 'New Section' }]);
  }, [state.contentBlocks, setContentBlocks, handleChange]);

  // ── Derived values ───────────────────────────────────────────
  const currentTemplate = useMemo(
    () => findTemplateBySlug(state.templateSlug) || RESUME_TEMPLATES[0],
    [state.templateSlug]
  );
  const accentColor = useMemo(() => getAccentColor(currentTemplate.settings), [currentTemplate]);

  // P3-3: 结构化返回对象，降低认知负荷
  return {
    // 数据与 UI 状态
    data: {
      personal: state.personal,
      contentBlocks: state.contentBlocks,
      supplementaryBlocks: state.supplementaryBlocks,
      templateSlug: state.templateSlug,
      isSample,
      currentTemplate,
      accentColor,
    },
    // 基础操作
    actions: {
      setPersonal,
      setContentBlocks,
      setSupplementaryBlocks,
      handleChange,
      addSection,
    },
    // 照片管理
    photo: {
      ref: photo.photoInputRef,
      upload: photo.handlePhotoUpload,
      remove: photo.handlePhotoRemove,
      click: photo.handlePhotoClick,
    },
    // 文件 I/O
    io: {
      ref: persist.fileInputRef,
      open: persist.openImportFile,
      upload: io.handleFileUpload,
      exportMd: io.handleExportMarkdown,
    },
    // PDF 编译相关
    pdf: {
      url: compile.pdfUrl,
      error: compile.compileError,
      isCompiling: compile.isCompiling,
      refresh: compile.handleRefreshPreview,
      download: compile.handleDownloadPdf,
    }
  };
}

export type EditorInstance = ReturnType<typeof useEditorState>;
