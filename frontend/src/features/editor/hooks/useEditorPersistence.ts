import { useCallback, useEffect, useRef } from 'react';
import type { ResumeData } from '@app-types/resume';
import type { EditorState } from '@app-types/editorState';
import { migrateResumeDataToEditorState, extractTemplateSlug } from '../services/migration';
import {
  SAMPLE_CLASSIC_CONTENT,
  SAMPLE_RIREKISHO_CONTENT,
  SAMPLE_RIREKISHO_SUPPLEMENTARY,
  SAMPLE_SHOKUMU_CONTENT,
  SAMPLE_SHOKUMU_SUPPLEMENTARY,
  SAMPLE_SKILLS_SUPPLEMENTARY,
} from '@data/sampleBlocks';
import { SAMPLE_RESUME_DATA } from '@data/sampleResume';
import { storage } from '@shared/utils/storage';

import { getSampleStateForTemplate } from '../services/sampleData';

export function useEditorPersistence(config: {
  templateId: string | undefined;
  state: EditorState;
  setState: (s: EditorState) => void;
  setIsSample: (v: boolean) => void;
}) {
  const { templateId, state, setState, setIsSample } = config;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const lastSavedPhotoRef = useRef<string | undefined>(undefined);

  // Load logic
  useEffect(() => {
    async function load() {
      // 1. Check v2
      const v2 = await storage.getState();
      const photo = await storage.getPhoto();

      if (v2) {
        if (photo && v2.personal.photo && v2.personal.photo.url === '__stored__') {
          v2.personal.photo.url = photo;
        }
        setState(v2);
        lastSavedPhotoRef.current = photo || undefined;
        return;
      }

      // 2. Auto-migrate legacy keys
      // ... (rest of legacy migration logic)
      const legacyKeys = [
        'current_resume_data_classic',
        'current_resume_data_modern',
        'current_resume_data_art',
        'current_resume_data_rirekisho',
        'current_resume_data_shokumukeirekisho',
        'current_resume_data_default',
      ];
      for (const key of legacyKeys) {
        const legacy = await storage.getLegacyItem<ResumeData>(key);
        if (legacy) {
          const migrated = migrateResumeDataToEditorState(legacy, extractTemplateSlug(key));
          await storage.saveState(migrated);
          // Cleanup legacy keys
          for (const k of legacyKeys) await storage.removeLegacyItem(k);
          setState(migrated);
          return;
        }
      }

      // 3. Fallback to sample if nothing found
      const slug = templateId || 'classic';
      const sampleState = getSampleStateForTemplate(slug);
      setState(sampleState);
      setIsSample(true);
    }
    load();
  }, [templateId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save
  useEffect(() => {
    if (state.version !== 2) return;
    const timer = setTimeout(() => {
      storage.saveState(state);

      const currentPhoto = state.personal.photo?.url;
      if (currentPhoto !== lastSavedPhotoRef.current) {
        if (currentPhoto) {
          storage.savePhoto(currentPhoto);
        } else {
          storage.removePhoto();
        }
        lastSavedPhotoRef.current = currentPhoto;
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [state]);

  const openImportFile = useCallback(() => fileInputRef.current?.click(), []);

  return { openImportFile, fileInputRef };
}
