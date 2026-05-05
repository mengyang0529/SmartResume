import { PersonalInfo } from '@app-types/resume';
import { TemplateSettings } from '@app-types/template';
import { RichTextBlock } from '@app-types/richText';
import { generateWesternResumeTypst } from './westernResume';
import { generateRirekishoTypst } from './rirekisho';
import { generateShokumuKeirekishoTypst } from './shokumukeirekisho';

export type TypstGenerator = (
  personal: PersonalInfo,
  contentBlocks: RichTextBlock[],
  supplementaryBlocks: RichTextBlock[],
  settings: TemplateSettings,
  templateSlug: string
) => string;

const generators: Record<string, TypstGenerator> = {
  classic: generateWesternResumeTypst,
  modern: generateWesternResumeTypst,
  art: generateWesternResumeTypst,
  rirekisho: generateRirekishoTypst,
  shokumukeirekisho: generateShokumuKeirekishoTypst,
};

export function generateResumeTypst(
  personal: PersonalInfo,
  contentBlocks: RichTextBlock[],
  supplementaryBlocks: RichTextBlock[],
  settings: TemplateSettings,
  templateSlug: string
): string {
  const gen = generators[templateSlug] || generateWesternResumeTypst;
  return gen(personal, contentBlocks, supplementaryBlocks, settings, templateSlug);
}

export { getAccentColor } from './shared';
