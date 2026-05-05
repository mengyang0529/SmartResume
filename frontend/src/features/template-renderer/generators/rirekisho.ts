import { PersonalInfo } from '@app-types/resume';
import { TemplateSettings } from '@app-types/template';
import { RichTextBlock } from '@app-types/richText';
import { escapeTypstContent, escapeTypstString, formatDateJapanese } from './shared';
import { dataUrlToTypstBytes } from '@shared/utils/photo';
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

  // Helper to render a single H1 group based on its content and type
  const renderGroup = (group: RichTextBlock[]) => {
    const header = group[0];
    const items = group.slice(1);
    if (!header) return '';

    const title = header.content;
    const escapedTitle = escapeTypstContent(title);

    // 1. Check for specialized "slots" (usually for Supplementary)
    if (/免許|資格|License/i.test(title)) {
      return `#license-table(\n${renderBlocksAsTableRows(items)}\n)\n\n`;
    }
    if (/志望動機|理由|Motivation|自己PR/i.test(title)) {
      return `#motivation-block[\n${renderBlocksAsContent(items)}\n]\n\n`;
    }
    if (/本人希望|Hopes|要望/i.test(title)) {
      return `#hopes-block[\n${renderBlocksAsContent(items)}\n]\n\n`;
    }

    // 2. Generic rendering (for Education, Work, or Custom sections)
    const hasDates = items.some(b => b.rightContent);
    let out = `#section-title[${escapedTitle}]\n`;
    if (hasDates) {
      out += `#rireki-table(\n${renderBlocksAsTableRows(items)}\n)\n\n`;
    } else {
      out += `[\n${renderBlocksAsContent(items)}\n]\n\n`;
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
