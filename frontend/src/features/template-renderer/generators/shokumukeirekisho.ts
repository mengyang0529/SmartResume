import { PersonalInfo } from '@app-types/resume';
import { TemplateSettings } from '@app-types/template';
import { RichTextBlock } from '@app-types/richText';
import { escapeTypstContent, escapeTypstString, formatDateRangeJapanese } from './shared';
import { groupUnderHeader } from './helpers';

// P1-5: 使用明确的 Layout 类型而非正则匹配
type SectionLayout = 'summary' | 'skills' | 'experience' | 'default';

function getSectionLayout(title: string): SectionLayout {
  const t = title.toLowerCase();
  if (/職務要約|summary/i.test(t)) return 'summary';
  if (/経験|知識|技術|スキル|skill/i.test(t)) return 'skills';
  if (/職務経歴|experience/i.test(t)) return 'experience';
  return 'default';
}

function renderDescriptionLine(content: string): string {
  const boldMatch = content.match(/^\*\*(.+)\*\*$/);
  if (boldMatch) {
    return `  #text(size: 9pt, weight: "bold")[${escapeTypstContent(boldMatch[1])}] \\\n`;
  }
  return `  #text(size: 9pt)[${escapeTypstContent(content)}] \\\n`;
}

function renderBlock(block: RichTextBlock): string {
  const text = escapeTypstContent(block.content);
  if (block.type === 'h2') {
    return `#text(size: 10pt, weight: "bold")[${text}]\n`;
  }
  if (block.type === 'h3') {
    return `#text(size: 9pt, weight: "bold")[${text}]\n`;
  }
  if (block.type === 'bullet') {
    return block.bold ? `- *${text}*\n` : `- ${text}\n`;
  }
  return block.bold ? `*${text}*\n` : `${text}\n`;
}

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

// ── Document Header ──
#align(center)[#text(size: 15pt, weight: "bold")[職務経歴书]]
#v(2pt)
#align(right)[
  #text(size: 9pt)[氏名 ${escapeTypstString(personal.lastName)} ${escapeTypstString(personal.firstName)}]
]

#v(10pt)

`;

  const sections = groupUnderHeader(contentBlocks, 'h1');

  for (const section of sections) {
    const sectionTitle = section.header?.content || '';
    if (!sectionTitle) continue;

    typst += `#section-title[${escapeTypstContent(sectionTitle)}]\n`;

    const layout = getSectionLayout(sectionTitle);

    if (layout === 'summary') {
      // 職務要約 → plain text
      for (const block of section.children) {
        if (block.type === 'h2') {
          typst += `#text(size: 10pt, weight: "bold")[${escapeTypstContent(block.content)}]\n`;
        } else if (block.type === 'bullet') {
          typst += `- ${escapeTypstContent(block.content)}\n`;
        } else {
          typst += `${escapeTypstContent(block.content)}\n`;
        }
      }
      typst += '\n';
    } else if (layout === 'skills') {
      // 活かせる経験・知识・技术 → list layout
      const categories = groupUnderHeader(section.children, 'h2');
      for (const cat of categories) {
        const catName = cat.header?.content || '';
        if (catName) {
          typst += `#text(size: 10pt, weight: "bold")[${escapeTypstContent(catName)}]\n`;
        }
        const items = cat.children.filter(b => b.type === 'h3' || b.type === 'bullet' || b.type === 'paragraph');
        if (items.length > 0) {
          typst += `#list(\n  marker: [・],\n`;
          for (const item of items) {
            typst += `  [${escapeTypstContent(item.content)}],\n`;
          }
          typst += `)\n`;
        }
      }
      typst += '\n';
    } else {
      // Default / experience: table layout
      const companies = groupUnderHeader(section.children, 'h2');
      const merged: typeof companies = [];
      for (const c of companies) {
        const prev = merged[merged.length - 1];
        if (prev && prev.header?.content === c.header?.content) {
          prev.children.push(...c.children);
        } else {
          merged.push(c);
        }
      }

      for (const company of merged) {
        const companyName = company.header?.content || '';
        if (!companyName) continue;

        typst += `#block(above: 1.2em, below: 0.3em)[#text(size: 10pt, weight: "bold")[${escapeTypstString(companyName)}]]\n`;

        const roles = groupUnderHeader(company.children, 'h3');

        typst += `#table(
  columns: (1fr),
  stroke: 0.5pt + black,
  inset: (x: 8pt, y: 6pt),
`;

        for (const role of roles) {
          const period = role.header?.rightContent
            ? formatDateRangeJapanese(role.header.rightContent)
            : '';
          const projectName = role.header?.content || '';

          let cell = '';
          if (period) {
            cell += `  #text(size: 9pt)[${escapeTypstContent(period)}] \\\n`;
          }
          if (projectName) {
            cell += `  #text(size: 9pt, weight: "bold")[${escapeTypstContent(projectName)}] \\\n`;
          }
          for (const block of role.children) {
            if (block.type === 'bullet') {
              cell += `  #text(size: 9pt)[・ ${escapeTypstContent(block.content)}] \\\n`;
            } else {
              cell += renderDescriptionLine(block.content);
            }
          }

          typst += `  [\n${cell}  ],\n`;
        }

        typst += `)\n\n`;
      }
    }
  }

  // Process supplementaryBlocks
  if (supplementaryBlocks.length > 0) {
    const suppSections = groupUnderHeader(supplementaryBlocks, 'h1');

    if (suppSections.length === 0 || (suppSections.length === 1 && !suppSections[0].header)) {
      for (const block of supplementaryBlocks) {
        typst += renderBlock(block);
      }
    } else {
      for (const section of suppSections) {
        const sectionTitle = section.header?.content || '';
        if (sectionTitle) {
          typst += `#section-title[${escapeTypstContent(sectionTitle)}]\n`;
        }
        for (const block of section.children) {
          typst += renderBlock(block);
        }
        typst += '\n';
      }
    }
  }

  return typst;
}
