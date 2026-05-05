import { PersonalInfo } from '@app-types/resume';
import { RichTextBlock } from '@app-types/richText';

function escapeYaml(val: any): string {
  if (typeof val === 'boolean' || val === null) return `"${val}"`;
  const str = String(val);
  return /[:#\[\]{},"']/.test(str) ? `"${str}"` : str;
}

export function generateMarkdownResume(data: {
  personal: PersonalInfo;
  contentBlocks: RichTextBlock[];
  supplementaryBlocks: RichTextBlock[];
}): string {
  const { personal, contentBlocks, supplementaryBlocks } = data;
  const lines: string[] = [];

  lines.push('---');
  if (personal.firstName) lines.push(`firstName: ${escapeYaml(personal.firstName)}`);
  if (personal.lastName) lines.push(`lastName: ${escapeYaml(personal.lastName)}`);
  if (personal.furiganaFirstName)
    lines.push(`furiganaFirstName: ${escapeYaml(personal.furiganaFirstName)}`);
  if (personal.furiganaLastName)
    lines.push(`furiganaLastName: ${escapeYaml(personal.furiganaLastName)}`);
  if (personal.birth) lines.push(`birth: ${escapeYaml(personal.birth)}`);
  if (personal.position) lines.push(`position: ${escapeYaml(personal.position)}`);
  if (personal.email) lines.push(`email: ${escapeYaml(personal.email)}`);
  if (personal.mobile) lines.push(`mobile: "${personal.mobile}"`);
  if (personal.address) lines.push(`address: ${escapeYaml(personal.address)}`);
  if (personal.homepage) lines.push(`homepage: ${escapeYaml(personal.homepage)}`);
  if (personal.linkedin) lines.push(`linkedin: ${escapeYaml(personal.linkedin)}`);
  if (personal.twitter) lines.push(`twitter: ${escapeYaml(personal.twitter)}`);
  if (personal.quote) lines.push(`quote: ${escapeYaml(personal.quote)}`);
  if (personal.photo?.url && !personal.photo.url.startsWith('data:')) lines.push(`photoUrl: ${escapeYaml(personal.photo.url)}`);
  lines.push('---');
  lines.push('');

  const renderBlocks = (blocks: RichTextBlock[]) => {
    for (const block of blocks) {
      if (block.type === 'h1') {
        lines.push(`## ${block.content}${block.rightContent ? ` | ${block.rightContent}` : ''}`);
      } else if (block.type === 'h2') {
        lines.push(`### ${block.content}${block.rightContent ? ` | ${block.rightContent}` : ''}`);
      } else if (block.type === 'h3') {
        lines.push(`#### ${block.content}${block.rightContent ? ` | ${block.rightContent}` : ''}`);
      } else if (block.type === 'bullet') {
        lines.push(`- ${block.bold ? `**${block.content}**` : block.content}`);
      } else if (block.type === 'paragraph') {
        lines.push(block.bold ? `**${block.content}**` : block.content);
      }
      lines.push('');
    }
  };

  renderBlocks(contentBlocks);

  if (supplementaryBlocks.length > 0) {
    lines.push('## Supplementary');
    lines.push('');
    renderBlocks(supplementaryBlocks);
  }

  return lines.join('\n');
}
