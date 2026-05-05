import { PersonalInfo } from '@app-types/resume';
import { TemplateSettings } from '@app-types/template';
import { RichTextBlock } from '@app-types/richText';
import { escapeTypstContent, escapeTypstString, formatDateRangeJapanese } from './shared';

export function generateShokumuKeirekishoTypst(
  personal: PersonalInfo,
  contentBlocks: RichTextBlock[],
  supplementaryBlocks: RichTextBlock[],
  _settings: TemplateSettings,
  _templateSlug: string
): string {
  let typst = `#import "shokumukeirekisho.typ": *

#show: resume.with(
  author: (
    name: "${escapeTypstString(personal.lastName)} ${escapeTypstString(personal.firstName)}",
    birth: "${escapeTypstString(personal.birth || '')}",
  ),
  date: datetime.today().display(),
)

`;

  // Process contentBlocks
  contentBlocks.forEach(block => {
    if (block.type === 'h1') {
      typst += `#section-title[${escapeTypstContent(block.content)}]\n\n`;
    } else if (block.type === 'h2') {
      const rightContent = block.rightContent
        ? escapeTypstString(formatDateRangeJapanese(block.rightContent))
        : '';
      typst += `#work-header("${escapeTypstString(block.content)}", "${rightContent}")\n`;
    } else if (block.type === 'h3') {
      typst += `*${escapeTypstContent(block.content)}*\\n`;
    } else if (block.type === 'bullet') {
      typst += `- ${escapeTypstContent(block.content)}\n`;
    } else if (block.type === 'paragraph') {
      typst += `${escapeTypstContent(block.content)}\\n`;
    }
  });

  // Process supplementaryBlocks
  supplementaryBlocks.forEach(block => {
    if (block.type === 'h1') {
      typst += `#section-title[${escapeTypstContent(block.content)}]\n\n`;
    } else if (block.type === 'bullet') {
      typst += `- ${escapeTypstContent(block.content)}\n`;
    } else {
      typst += `${escapeTypstContent(block.content)}\\n`;
    }
  });

  return typst;
}
