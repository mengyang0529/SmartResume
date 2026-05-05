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
  // P1-4: 消除了对下标位置的耦合，改为通过 H1 标题内容进行语义匹配
  const h1Groups = groupBlocksByH1(supplementaryBlocks);

  const renderGroupContent = (group: RichTextBlock[]) => {
    return group
      .slice(1)
      .map(b => escapeTypstContent(b.content))
      .join('\\n');
  };

  // 1. 资格/证书 (License)
  const licenseGroup = h1Groups.find(g => /免許|資格|License/i.test(g[0].content));
  if (licenseGroup) {
    typst += `#license-table(\n`;
    licenseGroup.slice(1).forEach(block => {
      const date = block.rightContent
        ? escapeTypstContent(formatDateJapanese(block.rightContent))
        : '';
      typst += `  [${date}], [${escapeTypstContent(block.content)}],\n`;
    });
    typst += `)\n\n`;
  }

  // 2. 志望动机 (Motivation)
  const motivationGroup = h1Groups.find(g => /志望動機|理由|Motivation/i.test(g[0].content));
  if (motivationGroup) {
    typst += `#motivation-block[${renderGroupContent(motivationGroup)}]\n\n`;
  }

  // 3. 本人希望栏 (Hopes)
  const hopesGroup = h1Groups.find(g => /本人希望|Hopes/i.test(g[0].content));
  if (hopesGroup) {
    typst += `#hopes-block[${renderGroupContent(hopesGroup)}]\n\n`;
  }

  // 兜底渲染：如果还有其他 H1 块没被上述特定槽位捕获，按通用格式渲染
  const processedIds = new Set([
    ...(licenseGroup?.[0] ? [licenseGroup[0].id] : []),
    ...(motivationGroup?.[0] ? [motivationGroup[0].id] : []),
    ...(hopesGroup?.[0] ? [hopesGroup[0].id] : []),
  ]);

  h1Groups
    .filter(g => !processedIds.has(g[0].id))
    .forEach(g => {
      typst += `#section-title[${escapeTypstContent(g[0].content)}]\n`;
      typst += `${renderGroupContent(g)}\n\n`;
    });

  return typst;
}
