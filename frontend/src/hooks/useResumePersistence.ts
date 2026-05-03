import { useCallback, useEffect, useRef } from 'react';
import localforage from 'localforage';
import type { ResumeData, TemplateSettings } from '../types/resume';
import type { RichTextBlock } from '../types/richText';
import { modulesToBlocks } from '../utils/resumeTransforms';
import { SAMPLE_RESUME_DATA, RIREKISHO_SAMPLE_DATA, SHOKUMU_SAMPLE_DATA } from '../data/sampleResume';
import {
  skillsToBlocks,
  educationToBlocks,
} from '../utils/resumeEditorUtils';
import { parseMarkdownResume } from '../utils/markdownIO';
import { separateRirekiSections } from '../utils/rirekishoUtils';

function applySeparatedData(
  data: {
    sections: ResumeData['sections'];
    education?: ResumeData['education'];
    skillsBlocks?: RichTextBlock[];
    skills?: ResumeData['skills'];
  },
  setModuleBlocks: (b: RichTextBlock[]) => void,
  setSkillsBlocks: (b: RichTextBlock[]) => void,
  setResumeData: (d: ResumeData) => void
) {
  const { regularSections, extraBlocks } = separateRirekiSections(data.sections);
  if (regularSections.length > 0) {
    const blocks = modulesToBlocks(regularSections);
    const hasEduSection = regularSections.some(s => /education|学歴/i.test(s.title));
    if (data.education?.length && !hasEduSection) {
      setModuleBlocks([...educationToBlocks(data.education), ...blocks]);
    } else {
      setModuleBlocks(blocks);
    }
  }
  if (data.skillsBlocks?.length) {
    setSkillsBlocks([...data.skillsBlocks, ...extraBlocks]);
  } else if (data.skills?.length) {
    setSkillsBlocks([...skillsToBlocks(data.skills), ...extraBlocks]);
  } else if (extraBlocks.length > 0) {
    setSkillsBlocks(extraBlocks);
  }
  setResumeData({ ...(data as ResumeData), sections: regularSections });
}

export function useResumePersistence(config: {
  templateId: string | undefined;
  templateSettings: TemplateSettings;
  resumeData: ResumeData;
  skillsBlocks: RichTextBlock[];
  moduleBlocks: RichTextBlock[];
  setResumeData: (d: ResumeData) => void;
  setModuleBlocks: (b: RichTextBlock[]) => void;
  setSkillsBlocks: (b: RichTextBlock[]) => void;
  setIsSample: (v: boolean) => void;
}) {
  const {
    templateId,
    templateSettings,
    resumeData,
    skillsBlocks,
    moduleBlocks,
    setResumeData,
    setModuleBlocks,
    setSkillsBlocks,
    setIsSample,
  } = config;

  const storageKey = `current_resume_data_${templateId || 'default'}`;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load saved data on mount or template switch, fall back to sample
  useEffect(() => {
    localforage.getItem<ResumeData>(storageKey).then(saved => {
      if (saved) {
        applySeparatedData(saved, setModuleBlocks, setSkillsBlocks, setResumeData);
      } else {
        const data =
          templateSettings.template === 'rirekisho'
            ? RIREKISHO_SAMPLE_DATA
            : templateSettings.template === 'shokumukeirekisho'
              ? SHOKUMU_SAMPLE_DATA
              : SAMPLE_RESUME_DATA;
        applySeparatedData(data, setModuleBlocks, setSkillsBlocks, setResumeData);
        setIsSample(true);
      }
    });
  }, [templateId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save after 800ms debounce
  useEffect(() => {
    if (!resumeData.personal.firstName && resumeData.sections.length === 0) return;
    const timer = setTimeout(() => {
      localforage.setItem(storageKey, { ...resumeData, skillsBlocks });
    }, 800);
    return () => clearTimeout(timer);
  }, [resumeData, skillsBlocks, storageKey]);

  // Sync module blocks when sections data appears but blocks are empty
  useEffect(() => {
    if (moduleBlocks.length === 0 && resumeData.sections.length > 0) {
      setModuleBlocks(modulesToBlocks(resumeData.sections));
    }
  }, [resumeData.sections]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync skills blocks when skills data appears but blocks are empty
  useEffect(() => {
    if (skillsBlocks.length === 0 && resumeData.skills.length > 0) {
      setSkillsBlocks(skillsToBlocks(resumeData.skills));
    }
  }, [resumeData.skills]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const raw = reader.result as string;
          const parsed = parseMarkdownResume(raw);
          applySeparatedData(parsed, setModuleBlocks, setSkillsBlocks, setResumeData);
          setIsSample(false);
        } catch (_) {
          /* ignore parse errors */
        }
      };
      reader.readAsText(file);
      event.target.value = '';
    },
    [setModuleBlocks, setSkillsBlocks, setResumeData, setIsSample]
  );

  const openImportFile = useCallback(() => fileInputRef.current?.click(), []);

  const handleHistoryRestore = useCallback(
    (data: ResumeData) => {
      applySeparatedData(data, setModuleBlocks, setSkillsBlocks, setResumeData);
      setIsSample(false);
    },
    [setModuleBlocks, setSkillsBlocks, setResumeData, setIsSample]
  );

  return { handleFileUpload, openImportFile, handleHistoryRestore, fileInputRef };
}
