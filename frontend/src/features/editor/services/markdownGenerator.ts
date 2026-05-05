import { PersonalInfo } from '@app-types/resume';
import { RichTextBlock } from '@app-types/richText';
import { BLOCK_TYPE_TO_MD_HEADER, SUPPLEMENTARY_HEADER } from '@constants/editor';

/**
 * P3-3: 重命名为 quoteYamlValue。
 * P0-1: 修复双引号注入。
 */
function quoteYamlValue(val: any): string {
  if (typeof val === 'boolean' || val === null) return `"${val}"`;
  const str = String(val);
  // P0-1: 如果包含特殊字符或引号，使用双引号包裹并对内部双引号转义
  if (/[:#\[\]{},"']/.test(str)) {
    return `"${str.replace(/"/g, '\\"')}"`;
  }
  return str;
}

export function generateMarkdownResume(data: {
  personal: PersonalInfo;
  contentBlocks: RichTextBlock[];
  supplementaryBlocks: RichTextBlock[];
}): string {
  const { personal, contentBlocks, supplementaryBlocks } = data;
  const lines: string[] = [];

  lines.push('---');
  
  // P2-2: 使用配置驱动的字段映射，减少手动硬编码
  const personalFields: (keyof PersonalInfo)[] = [
    'firstName', 'lastName', 'furiganaFirstName', 'furiganaLastName',
    'birth', 'position', 'email', 'mobile', 'address',
    'homepage', 'linkedin', 'github', 'gitlab', 'twitter', 'quote'
  ];

  for (const field of personalFields) {
    const val = personal[field];
    if (val) {
      // P0-3: 统一使用 quoteYamlValue 处理所有字段（包括 mobile）
      lines.push(`${field}: ${quoteYamlValue(val)}`);
    }
  }

  // 特殊处理 photoUrl
  if (personal.photo?.url && !personal.photo.url.startsWith('data:')) {
    lines.push(`photoUrl: ${quoteYamlValue(personal.photo.url)}`);
  }

  lines.push('---');
  lines.push('');

  const renderBlocks = (blocks: RichTextBlock[]) => {
    for (const block of blocks) {
      // P1-1: 使用共享的标题映射常量
      const mdHeader = BLOCK_TYPE_TO_MD_HEADER[block.type];
      if (mdHeader) {
        lines.push(`${mdHeader} ${block.content}${block.rightContent ? ` | ${block.rightContent}` : ''}`);
      } else if (block.type === 'bullet') {
        const content = block.bold ? `**${block.content}**` : block.content;
        lines.push(`- ${content}${block.rightContent ? ` | ${block.rightContent}` : ''}`);
      } else if (block.type === 'paragraph') {
        const content = block.bold ? `**${block.content}**` : block.content;
        lines.push(`${content}${block.rightContent ? ` | ${block.rightContent}` : ''}`);
      }
      lines.push('');
    }
  };

  renderBlocks(contentBlocks);

  if (supplementaryBlocks.length > 0) {
    // P1-2: 使用共享常量作为补充区标识
    lines.push(SUPPLEMENTARY_HEADER);
    lines.push('');
    renderBlocks(supplementaryBlocks);
  }

  return lines.join('\n');
}
