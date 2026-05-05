import { PersonalInfo } from '@app-types/resume';
import { TemplateSettings } from '@app-types/template';
import { RichTextBlock } from '@app-types/richText';
import { escapeTypstContent, escapeTypstString, formatDateJapanese } from './shared';
import { dataUrlToTypstBytes } from '@utils/photo';
import { groupBlocksByH1 } from './helpers';

export function generateRirekishoTypst(
  personal: PersonalInfo,
  contentBlocks: RichTextBlock[],
  supplementaryBlocks: RichTextBlock[],
  _settings: TemplateSettings,
  _templateSlug: string
): string {
  const photoUrl = personal.photo?.url;
  let photoEntry: string;
  if (photoUrl) {
    photoEntry = `photo: image(bytes((
${dataUrlToTypstBytes(photoUrl)}
)), height: 4cm, fit: "cover"),`;
  } else {
    photoEntry = 'photo: none,';
  }

  let typst = `#import "rirekisho.typ": *

#show: resume.with(
  personal: (
    name: "${escapeTypstString(personal.lastName)} ${escapeTypstString(personal.firstName)}",
    furigana: "${escapeTypstString(personal.furiganaLastName || '')} ${escapeTypstString(personal.furiganaFirstName || '')}",
    birth: "${escapeTypstString(personal.birth || '')}",
    address: "${escapeTypstString(personal.address || '')}",
    phone: "${escapeTypstString(personal.mobile || '')}",
    email: "${escapeTypstString(personal.email || '')}",
  ),
  ${photoEntry}
)

`;

  // Process contentBlocks (Education & Work)
  let inTable = false;
  contentBlocks.forEach(block => {
    if (block.type === 'h1') {
      if (inTable) typst += `)\n\n`;
      typst += `#section-title[${escapeTypstContent(block.content)}]\n#rireki-table(\n`;
      inTable = true;
    } else if (
      block.type === 'h2' ||
      block.type === 'h3' ||
      block.type === 'bullet' ||
      block.type === 'paragraph'
    ) {
      if (!inTable) {
        typst += `#rireki-table(\n`;
        inTable = true;
      }
      const date = block.rightContent
        ? escapeTypstContent(formatDateJapanese(block.rightContent))
        : '';
      const content = escapeTypstContent(block.content);
      typst += `  [${date}], [${content}],\n`;
    }
  });
  if (inTable) typst += `)\n\n`;

  // Process supplementaryBlocks (License, Motivation, Hopes)
  // Mapping the first 3 H1 blocks to the specific slots in rirekisho if they exist
  const h1Groups = groupBlocksByH1(supplementaryBlocks);

  const renderGroupContent = (group: RichTextBlock[]) => {
    return group
      .slice(1)
      .map(b => escapeTypstContent(b.content))
      .join('\\n');
  };

  if (h1Groups.length > 0) {
    typst += `#license-table(\n`;
    h1Groups[0].slice(1).forEach(block => {
      const date = block.rightContent
        ? escapeTypstContent(formatDateJapanese(block.rightContent))
        : '';
      typst += `  [${date}], [${escapeTypstContent(block.content)}],\n`;
    });
    typst += `)\n\n`;
  }

  if (h1Groups.length > 1) {
    typst += `#motivation-block[${renderGroupContent(h1Groups[1])}]\n\n`;
  }

  if (h1Groups.length > 2) {
    typst += `#hopes-block[${renderGroupContent(h1Groups[2])}]\n\n`;
  }

  return typst;
}
