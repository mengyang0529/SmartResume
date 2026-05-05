import { PersonalInfo } from '@app-types/resume';
import { RichTextBlock, BlockType } from '@app-types/richText';
import { generateId } from '@shared/utils/id';
import { parseBoldLine } from '@shared/utils/text';
import { MD_HEADER_TO_BLOCK_TYPE, SUPPLEMENTARY_HEADER } from '@constants/editor';

/**
 * 解析扁平的 Key: Value 格式 (Frontmatter)
 * P3-1: 重命名为 parseFlatFrontmatter 以符合其实际能力
 */
function parseFlatFrontmatter(lines: string[]): Record<string, any> {
  const result: Record<string, any> = {};
  for (const line of lines) {
    // P0-2: 优化正则，允许 key 前有空格，且允许 value 中包含冒号（如 URL）
    const match = line.match(/^\s*([\w.-]+)\s*:\s*(.*)/);
    if (match) {
      const key = match[1];
      let val = match[2].replace(/^["']|["']$/g, '').trim();
      // 还原被转义的双引号
      val = val.replace(/\\"/g, '"');

      // 处理 YAML 常用布尔和空值
      if (val === 'true') result[key] = true;
      else if (val === 'false') result[key] = false;
      else if (val === 'null') result[key] = null;
      else result[key] = val;
    }
  }
  return result;
}

/**
 * P1-3: 提取 PersonalInfo 规格化逻辑，集中处理字段兼容、Fallback 和默认值
 */
function normalizePersonalInfo(raw: Record<string, any>): PersonalInfo {
  return {
    firstName: raw.firstName || '',
    lastName: raw.lastName || '',
    furiganaFirstName: raw.furiganaFirstName || '',
    furiganaLastName: raw.furiganaLastName || '',
    birth: raw.birth || '',
    position: raw.position || '',
    email: raw.email || '',
    mobile: raw.mobile || '',
    address: raw.address || '',
    // P1-3: 处理多源 Fallback 逻辑
    homepage: raw.homepage || raw.github || raw.gitlab || '',
    linkedin: raw.linkedin || '',
    github: raw.github || '',
    gitlab: raw.gitlab || '',
    twitter: raw.twitter || '',
    quote: raw.quote || '',
    photo: raw.photoUrl ? { url: raw.photoUrl, shape: 'circle' } : undefined,
  };
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
  let hasEncounteredContent = false;
  let hasEncounteredExplicitYaml = false;

  const pushHeaderBlock = (rawContent: string, type: BlockType) => {
    hasEncounteredContent = true;
    let title = rawContent;
    let rightContent = '';
    const pipeIdx = rawContent.indexOf('|');
    if (pipeIdx !== -1) {
      title = rawContent.slice(0, pipeIdx).trim();
      rightContent = rawContent.slice(pipeIdx + 1).trim();
    }
    currentTarget.push({ id: generateId('blk'), type, content: title, rightContent });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip leading empty lines if we haven't found any YAML or content
    if (!trimmed && !inYaml && !hasEncounteredContent) {
      continue;
    }

    // YAML Frontmatter 处理
    // 修改：放宽对第一行的要求，允许在文件开头有空行或空格的情况下找到第一个 ---
    if (!inYaml && yamlLines.length === 0 && trimmed === '---' && !hasEncounteredContent) {
      inYaml = true;
      hasEncounteredExplicitYaml = true;
      continue;
    }
    if (inYaml && trimmed === '---') {
      inYaml = false;
      Object.assign(personalRaw, parseFlatFrontmatter(yamlLines));
      yamlLines = []; // 清空，防止干扰
      continue;
    }
    if (inYaml) {
      yamlLines.push(line);
      continue;
    }

    // 隐式 YAML 支持：如果还没有遇到显式 YAML 且还没开始解析正文内容，
    // 且当前行符合 key: value 格式，则视为个人信息。
    if (!hasEncounteredExplicitYaml && !hasEncounteredContent) {
      const match = line.match(/^\s*([\w.-]+)\s*:\s*(.*)/);
      if (match) {
        Object.assign(personalRaw, parseFlatFrontmatter([line]));
        continue;
      }
    }

    // P1-2: 使用共享常量作为补充区标识
    if (trimmed === SUPPLEMENTARY_HEADER) {
      hasEncounteredContent = true;
      currentTarget = supplementaryBlocks;
      continue;
    }

    // P2-1: 统一 Header 解析逻辑
    const headerMatch = trimmed.match(/^(#{2,4})\s+(.+)/);
    if (headerMatch) {
      const marker = headerMatch[1] as keyof typeof MD_HEADER_TO_BLOCK_TYPE;
      const content = headerMatch[2].trim();
      const type = MD_HEADER_TO_BLOCK_TYPE[marker];
      if (type) {
        pushHeaderBlock(content, type);
        continue;
      }
    }

    // Bold header: **Title** | Right
    const boldHeaderMatch = trimmed.match(/^\*\*(.+?)\*\*\s*\|\s*(.+)$/);
    if (boldHeaderMatch) {
      hasEncounteredContent = true;
      currentTarget.push({
        id: generateId('blk'),
        type: 'h3',
        content: boldHeaderMatch[1].trim(),
        rightContent: boldHeaderMatch[2].trim(),
      });
      continue;
    }

    if (trimmed) {
      hasEncounteredContent = true;
      const isBullet = trimmed.startsWith('- ');
      let rawContent = isBullet ? trimmed.slice(2).trim() : trimmed;
      
      let title = rawContent;
      let rightContent = '';
      const pipeIdx = rawContent.indexOf('|');
      if (pipeIdx !== -1) {
        title = rawContent.slice(0, pipeIdx).trim();
        rightContent = rawContent.slice(pipeIdx + 1).trim();
      }

      const { content: finalContent, bold } = parseBoldLine(title);
      currentTarget.push({
        id: generateId('blk'),
        type: isBullet ? 'bullet' : 'paragraph',
        content: finalContent,
        rightContent,
        bold,
      });
    }
  }

  return {
    personal: normalizePersonalInfo(personalRaw),
    contentBlocks,
    supplementaryBlocks,
  };
}
