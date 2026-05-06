import { ResumeData } from '@app-types/resume';
import { RichTextBlock } from '@app-types/richText';
import { EditorState } from '@app-types/editorState';
import { generateId } from '@shared/utils/id';

export function migrateResumeDataToEditorState(
  data: ResumeData,
  templateSlug: string
): EditorState {
  const contentBlocks: RichTextBlock[] = [];
  const supplementaryBlocks: RichTextBlock[] = [];

  // summary → contentBlocks (at the very beginning)
  if (data.summary) {
    contentBlocks.push({ id: generateId('h1'), type: 'h1', content: 'Professional Summary' });
    contentBlocks.push({ id: generateId('p'), type: 'paragraph', content: data.summary });
  }

  // education (if separate)
  if (data.education?.length) {
    contentBlocks.push({ id: generateId('h1'), type: 'h1', content: 'Education' });
    for (const edu of data.education) {
      contentBlocks.push({
        id: generateId('h2'),
        type: 'h2',
        content: edu.school,
        rightContent: edu.rightContent || '',
      });
      contentBlocks.push({
        id: generateId('h3'),
        type: 'h3',
        content: edu.degree || '',
        rightContent: `${edu.startDate}${edu.endDate ? ' -- ' + edu.endDate : ''}`,
      });
      if (edu.description) {
        for (const line of edu.description.split('\n')) {
          if (line.trim()) {
            contentBlocks.push({ id: generateId('b'), type: 'bullet', content: line.trim() });
          }
        }
      }
    }
  }

  // sections → contentBlocks
  for (const section of data.sections) {
    contentBlocks.push({
      id: generateId('h1'),
      type: 'h1',
      content: section.title,
      rightContent: section.rightContent || '',
    });
    for (const entry of section.entries) {
      if (entry.title) {
        contentBlocks.push({
          id: generateId('h2'),
          type: 'h2',
          content: entry.title,
          rightContent: entry.rightContent || '',
        });
      }
      if (entry.subtitle || entry.startDate) {
        contentBlocks.push({
          id: generateId('h3'),
          type: 'h3',
          content: entry.subtitle || '',
          rightContent: entry.endDate ? `${entry.startDate} -- ${entry.endDate}` : entry.startDate,
        });
      }
      if (entry.description) {
        for (const line of entry.description.split('\n')) {
          if (line.trim()) {
            contentBlocks.push({ id: generateId('b'), type: 'bullet', content: line.trim() });
          }
        }
      }
    }
  }

  // skills → supplementaryBlocks
  if (data.skills?.length) {
    supplementaryBlocks.push({ id: generateId('h1'), type: 'h1', content: 'Skills' });
    const byCategory: Record<string, string[]> = {};
    for (const s of data.skills) {
      if (!byCategory[s.category]) byCategory[s.category] = [];
      byCategory[s.category].push(s.name);
    }
    for (const [cat, names] of Object.entries(byCategory)) {
      supplementaryBlocks.push({ id: generateId('h2'), type: 'h2', content: cat });
      for (const name of names) {
        supplementaryBlocks.push({ id: generateId('h3'), type: 'h3', content: name });
      }
    }
  }

  // supplementaryBlocks (if already exists in old format)
  if (data.supplementaryBlocks?.length) {
    supplementaryBlocks.push(...data.supplementaryBlocks);
  }

  return { version: 2, personal: data.personal, contentBlocks, supplementaryBlocks, templateSlug };
}

export function extractTemplateSlug(storageKey: string): string {
  if (!storageKey) return 'classic';
  const slug = storageKey.replace('current_resume_data_', '');
  return slug === 'default' ? 'classic' : slug || 'classic';
}
