import { PersonalInfo } from '@app-types/resume';
import { TemplateSettings } from '@app-types/template';
import { RichTextBlock } from '@app-types/richText';
import { escapeTypstContent, escapeTypstString, formatDateJapanese } from './shared';
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
    // P0-5: Use shadow-mapped path instead of embedding huge bytes
    // Use relative path to be safer with Typst's virtual file system
    photoEntry = 'photo: image("photo.raw", height: 4.5cm, fit: "cover"),';
  } else {
    photoEntry = 'photo: none,';
  }

  let typst = `#import "rirekisho.typ": *

#show: resume.with(
  personal: (
    name: "${escapeTypstString(personal.lastName)} ${escapeTypstString(personal.firstName)}",
    furigana: "${escapeTypstString(personal.furiganaLastName || '')} ${escapeTypstString(personal.furiganaFirstName || '')}",
    birth: "${escapeTypstString(personal.birth || '')}",
    zipcode: "",
    address: "${escapeTypstString(personal.address || '')}",
    "address-kana": "",
    phone: "${escapeTypstString(personal.mobile || '')}",
    email: "${escapeTypstString(personal.email || '')}",
  ),
  ${photoEntry}
)

`;

  // Helper to render blocks as Typst content
  const renderBlocksAsContent = (blocks: RichTextBlock[]) => {
    return blocks
      .map(b => {
        const content = escapeTypstContent(b.content);
        let prefix = '';
        if (b.type === 'bullet') prefix = '- ';
        const text = b.bold ? `*${content}*` : content;
        return `${prefix}${text}`;
      })
      .join('\n\n');
  };

  // Helper to render blocks as Table rows
  const renderBlocksAsTableRows = (blocks: RichTextBlock[]) => {
    return blocks
      .map(b => {
        const date = b.rightContent ? escapeTypstContent(formatDateJapanese(b.rightContent)) : '';
        const content = escapeTypstContent(b.content);
        return `  [${date}], [${content}],`;
      })
      .join('\n');
  };

  // Helper to render a single H1 group based on its structural content
  const renderGroup = (group: RichTextBlock[]) => {
    const header = group[0];
    const items = group.slice(1);
    if (!header) return '';

    const title = header.content;
    const escapedTitle = escapeTypstContent(title);
    const hasDates = items.some(b => b.rightContent && b.rightContent.trim() !== '');

    // Purely structural rendering: 
    // If it has dates, it's a table. Otherwise, it's a generic block.
    // This removes all "license", "motivation", etc. hardcoding.
    let out = `#section-title[${escapedTitle}]\n`;
    if (hasDates) {
      out += `#rireki-table(\n${renderBlocksAsTableRows(items)}\n)\n\n`;
    } else {
      out += `#content-block[\n${renderBlocksAsContent(items)}\n]\n\n`;
    }
    return out;
  };

  // --- Step 1: Render Resume Content (Education, Work History, etc.) ---
  const contentGroups = groupBlocksByH1(contentBlocks);
  contentGroups.forEach(group => {
    typst += renderGroup(group);
  });

  // --- Step 2: Render Supplementary Info (Licenses, Motivation, Hopes, etc.) ---
  const supplementaryGroups = groupBlocksByH1(supplementaryBlocks);
  supplementaryGroups.forEach(group => {
    typst += renderGroup(group);
  });

  return typst;
}
