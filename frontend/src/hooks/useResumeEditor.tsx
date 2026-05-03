import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FaUser, FaLayerGroup, FaWrench } from 'react-icons/fa';
import type { ResumeData, TemplateSettings } from '../types/resume';
import type { RichTextBlock } from '../types/richText';
import { getAccentColor } from '../utils/typstGenerators';
import { generateMarkdownResume } from '../utils/markdownIO';
import { EMPTY_RESUME_DATA } from '../data/sampleResume';
import { generateId } from '../utils/id';
import { DEFAULT_TEMPLATE, findTemplateBySlug, RESUME_TEMPLATES } from '../data/templates';
import { useResumeCompile } from './useResumeCompile';
import { useResumePersistence } from './useResumePersistence';

export function useResumeEditor() {
  const templates = RESUME_TEMPLATES;
  const { templateId } = useParams();
  const initialTemplate = findTemplateBySlug(templateId);
  const location = useLocation();
  const navigate = useNavigate();

  // ── Core state ──────────────────────────────────────────────
  const [resumeData, setResumeData] = useState<ResumeData>(EMPTY_RESUME_DATA);
  const [templateSettings, setTemplateSettings] = useState<TemplateSettings>(
    (initialTemplate ?? DEFAULT_TEMPLATE).settings
  );
  const [moduleBlocks, setModuleBlocks] = useState<RichTextBlock[]>([]);
  const [skillsBlocks, setSkillsBlocks] = useState<RichTextBlock[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isSample, setIsSample] = useState(false);
  const [showNav, setShowNav] = useState(false);

  // ── Compile ──────────────────────────────────────────────────
  const compile = useResumeCompile({ templateSettings, templates, resumeData, skillsBlocks });

  // ── Persistence (localforage + import + history) ─────────────
  const persist = useResumePersistence({
    templateId,
    templateSettings,
    resumeData,
    skillsBlocks,
    moduleBlocks,
    setResumeData,
    setModuleBlocks,
    setSkillsBlocks,
    setIsSample,
  });

  // ── Template switching ───────────────────────────────────────
  useEffect(() => {
    const selected = findTemplateBySlug(templateId);
    if (!selected) {
      navigate('/templates', { replace: true });
      return;
    }
    setTemplateSettings(selected.settings);
  }, [templateId, navigate]);

  // ── Photo ────────────────────────────────────────────────────
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const handlePhotoClick = () => photoInputRef.current?.click();

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsSample(false);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      compile.setPhoto(dataUrl);
      setResumeData(prev => ({
        ...prev,
        personal: { ...prev.personal, photo: { url: dataUrl, shape: 'circle' as const } },
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handlePhotoRemove = () => {
    compile.removePhoto();
    setResumeData(prev => ({ ...prev, personal: { ...prev.personal, photo: undefined } }));
  };

  // Sync photo to the compiler worker
  useEffect(() => {
    const photo = resumeData.personal.photo;
    if (photo?.url) compile.setPhoto(photo.url);
    else compile.removePhoto();
  }, [resumeData.personal.photo?.url]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Import file trigger ──────────────────────────────────────
  useEffect(() => {
    if ((location.state as any)?.openImportFile) {
      persist.openImportFile();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, persist.openImportFile]);

  // ── Export ───────────────────────────────────────────────────
  const handleExportMarkdown = () => {
    const md = generateMarkdownResume({ ...resumeData, skillsBlocks });
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resumeData.personal.firstName || 'resume'}-backup.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Derived values ───────────────────────────────────────────
  const accentColor = useMemo(() => getAccentColor(templateSettings), [templateSettings]);

  const sectionTitles = useMemo(
    () =>
      moduleBlocks
        .filter(b => b.type === 'h1')
        .map(b => ({ id: b.id, title: b.content || 'Untitled' })),
    [moduleBlocks]
  );

  const handleChange = useCallback(() => setIsSample(false), []);

  // ── Navigation ───────────────────────────────────────────────
  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(`section-${sectionId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToBlock = (blockId: string) => {
    scrollToSection('modules');
    setTimeout(() => {
      const el = document.querySelector(`[data-block-id="${blockId}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const addSection = () => {
    setIsSample(false);
    const newId = generateId('block');
    setModuleBlocks(prev => [...prev, { id: newId, type: 'h1', content: 'New Section' }]);
    setTimeout(() => scrollToSection('modules'), 50);
  };

  const navItems = useMemo(() => {
    const items: { id: string; label: string; icon: React.ReactNode; onClick: () => void }[] = [
      {
        id: 'personal',
        label: 'Personal Info',
        icon: <FaUser />,
        onClick: () => {
          scrollToSection('personal');
          setShowNav(false);
        },
      },
    ];
    sectionTitles.forEach(sec => {
      items.push({
        id: sec.id,
        label: sec.title,
        icon: <FaLayerGroup />,
        onClick: () => {
          scrollToBlock(sec.id);
          setShowNav(false);
        },
      });
    });
    items.push({
      id: 'skills',
      label: 'Skills',
      icon: <FaWrench />,
      onClick: () => {
        scrollToSection('skills');
        setShowNav(false);
      },
    });
    return items;
  }, [sectionTitles]);

  useEffect(() => {
    if (!showNav) return;
    const handler = () => setShowNav(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [showNav]);

  // ── Public API ───────────────────────────────────────────────
  return {
    resumeData,
    setResumeData,
    templateSettings,
    setTemplateSettings,
    moduleBlocks,
    setModuleBlocks,
    skillsBlocks,
    setSkillsBlocks,
    showHistory,
    setShowHistory,
    isSample,
    setIsSample,
    showNav,
    setShowNav,
    pdfUrl: compile.pdfUrl,
    compileError: compile.compileError,
    isCompiling: compile.isCompiling,
    currentTemplate: compile.currentTemplate,
    accentColor,
    sectionTitles,
    navItems,
    handleChange,
    photoInputRef,
    fileInputRef: persist.fileInputRef,
    handlePhotoClick,
    handlePhotoUpload,
    handlePhotoRemove,
    handleRefreshPreview: compile.handleRefreshPreview,
    handleFileUpload: persist.handleFileUpload,
    openImportFile: persist.openImportFile,
    handleExportMarkdown,
    handleDownloadPdf: compile.handleDownloadPdf,
    handleHistoryRestore: persist.handleHistoryRestore,
    addSection,
  };
}
