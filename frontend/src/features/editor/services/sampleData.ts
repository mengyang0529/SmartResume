import { EditorState } from '@app-types/editorState';
import {
  SAMPLE_CLASSIC_CONTENT,
  SAMPLE_RIREKISHO_CONTENT,
  SAMPLE_RIREKISHO_SUPPLEMENTARY,
  SAMPLE_SHOKUMU_CONTENT,
  SAMPLE_SHOKUMU_SUPPLEMENTARY,
  SAMPLE_SKILLS_SUPPLEMENTARY,
} from '@data/sampleBlocks';
import { SAMPLE_RESUME_DATA } from '@data/sampleResume';

export function getSampleStateForTemplate(slug: string): EditorState {
  const SAMPLE_MAP: Record<string, { content: any; supplementary: any }> = {
    rirekisho: {
      content: SAMPLE_RIREKISHO_CONTENT,
      supplementary: SAMPLE_RIREKISHO_SUPPLEMENTARY,
    },
    shokumukeirekisho: {
      content: SAMPLE_SHOKUMU_CONTENT,
      supplementary: SAMPLE_SHOKUMU_SUPPLEMENTARY,
    },
  };

  const sampleConfig = SAMPLE_MAP[slug] || {
    content: SAMPLE_CLASSIC_CONTENT,
    supplementary: SAMPLE_SKILLS_SUPPLEMENTARY,
  };

  return {
    version: 2,
    personal: SAMPLE_RESUME_DATA.personal,
    contentBlocks: sampleConfig.content,
    supplementaryBlocks: sampleConfig.supplementary,
    templateSlug: slug,
  };
}
