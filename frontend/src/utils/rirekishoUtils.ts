import type { RichTextBlock } from '../types/richText';
import { generateId } from './id';

// Convert a section (e.g. 志望の動機, 本人希望記入欄) into RichTextBlocks
// for inclusion in skillsBlocks: h1 for title, paragraph for content.
export function sectionToRirekiBlocks(section: {
  title: string;
  entries: { description?: string }[];
}): RichTextBlock[] {
  const blocks: RichTextBlock[] = [];
  blocks.push({ id: generateId('blk'), type: 'h1', content: section.title });
  const desc = section.entries
    .map(e => e.description || '')
    .filter(Boolean)
    .join('\n');
  if (desc) {
    blocks.push({ id: generateId('blk'), type: 'paragraph', content: desc });
  }
  return blocks;
}

// Separate rirekisho-specific sections (志望の動機, 本人希望記入欄) from regular sections
// and return blocks for appending to skillsBlocks.
export function separateRirekiSections<
  T extends { title: string; entries: { description?: string }[] },
>(
  sections: T[]
): {
  regularSections: T[];
  extraBlocks: RichTextBlock[];
} {
  const regularSections: T[] = [];
  const extraBlocks: RichTextBlock[] = [];
  for (const sec of sections) {
    if (/志望の動機|自己PR/i.test(sec.title) || /本人希望記入欄/i.test(sec.title)) {
      extraBlocks.push(...sectionToRirekiBlocks(sec));
    } else {
      regularSections.push(sec);
    }
  }
  return { regularSections, extraBlocks };
}
