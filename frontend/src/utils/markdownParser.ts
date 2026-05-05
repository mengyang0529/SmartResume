import { PersonalInfo } from '@app-types/resume';
import { RichTextBlock } from '@app-types/richText';
import { generateId } from './id';
import { parseBoldLine } from './text';

function parseYaml(lines: string[]): Record<string, any> {
  const result: Record<string, any> = {};
  for (const line of lines) {
    const m = line.match(/^(\w+):\s*(.+)/);
    if (m) {
      let val = m[2].replace(/^["']|["']$/g, '').trim();
      // Handle YAML reserved words
      if (val === 'true') result[m[1]] = true;
      else if (val === 'false') result[m[1]] = false;
      else if (val === 'null') result[m[1]] = null;
      else result[m[1]] = val;
    }
  }
  return result;
}

export function parseMarkdownResume(md: string): {
  personal: PersonalInfo;
  contentBlocks: RichTextBlock[];
  supplementaryBlocks: RichTextBlock[];
} {
  const lines = md.split('\n');
  const personalRaw: Record<string, any> = {};
  const contentBlocks: RichTextBlock[] = [];
  const supplementaryBlocks: RichTextBlock[] = [];

  let inYaml = false;
  let yamlLines: string[] = [];
  let currentTarget = contentBlocks;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (i === 0 && trimmed === '---') {
      inYaml = true;
      continue;
    }
    if (inYaml && trimmed === '---') {
      inYaml = false;
      Object.assign(personalRaw, parseYaml(yamlLines));
      continue;
    }
    if (inYaml) {
      yamlLines.push(line);
      continue;
    }

    if (trimmed === '## Skills') {
      currentTarget = supplementaryBlocks;
      continue;
    }

    // Markdown headers
    const h2Match = trimmed.match(/^##\s+(.+)/);
    if (h2Match) {
      const content = h2Match[1].trim();
      let title = content;
      let rightContent = '';
      const pipeIdx = content.indexOf('|');
      if (pipeIdx !== -1) {
        title = content.slice(0, pipeIdx).trim();
        rightContent = content.slice(pipeIdx + 1).trim();
      }
      currentTarget.push({ id: generateId('blk'), type: 'h1', content: title, rightContent });
      continue;
    }

    const h3Match = trimmed.match(/^###\s+(.+)/);
    if (h3Match) {
      const content = h3Match[1].trim();
      let title = content;
      let rightContent = '';
      const pipeIdx = content.indexOf('|');
      if (pipeIdx !== -1) {
        title = content.slice(0, pipeIdx).trim();
        rightContent = content.slice(pipeIdx + 1).trim();
      }
      currentTarget.push({ id: generateId('blk'), type: 'h2', content: title, rightContent });
      continue;
    }

    const h4Match = trimmed.match(/^####\s+(.+)/);
    if (h4Match) {
      const content = h4Match[1].trim();
      let title = content;
      let rightContent = '';
      const pipeIdx = content.indexOf('|');
      if (pipeIdx !== -1) {
        title = content.slice(0, pipeIdx).trim();
        rightContent = content.slice(pipeIdx + 1).trim();
      }
      currentTarget.push({ id: generateId('blk'), type: 'h3', content: title, rightContent });
      continue;
    }

    // Bold header: **Title** | Right
    const boldHeaderMatch = trimmed.match(/^\*\*(.+?)\*\*\s*\|\s*(.+)$/);
    if (boldHeaderMatch) {
      currentTarget.push({
        id: generateId('blk'),
        type: 'h3',
        content: boldHeaderMatch[1].trim(),
        rightContent: boldHeaderMatch[2].trim(),
      });
      continue;
    }

    if (trimmed) {
      const isBullet = trimmed.startsWith('- ');
      const content = isBullet ? trimmed.slice(2).trim() : trimmed;
      const { content: finalContent, bold } = parseBoldLine(content);
      currentTarget.push({
        id: generateId('blk'),
        type: isBullet ? 'bullet' : 'paragraph',
        content: finalContent,
        bold,
      });
    }
  }

  return {
    personal: {
      firstName: personalRaw.firstName || '',
      lastName: personalRaw.lastName || '',
      furiganaFirstName: personalRaw.furiganaFirstName || '',
      furiganaLastName: personalRaw.furiganaLastName || '',
      birth: personalRaw.birth || '',
      position: personalRaw.position || '',
      email: personalRaw.email || '',
      mobile: personalRaw.mobile || '',
      address: personalRaw.address || '',
      homepage: personalRaw.homepage || personalRaw.github || '',
      linkedin: personalRaw.linkedin || '',
      twitter: personalRaw.twitter || '',
      quote: personalRaw.quote || '',
      photo: personalRaw.photoUrl ? { url: personalRaw.photoUrl, shape: 'circle' } : undefined,
    },
    contentBlocks,
    supplementaryBlocks,
  };
}
