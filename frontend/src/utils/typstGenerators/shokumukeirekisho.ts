import { PersonalInfo } from '@app-types/resume';
import { TemplateSettings } from '@app-types/template';
import { RichTextBlock } from '@app-types/richText';
import { escapeTypstContent, escapeTypstString, formatDateRangeJapanese } from './shared';
import { groupUnderHeader } from './helpers';

function renderDescriptionLine(content: string): string {
  const boldMatch = content.match(/^\*\*(.+)\*\*$/);
  if (boldMatch) {
    return `  #text(size: 9pt, weight: "bold")[${escapeTypstContent(boldMatch[1])}] \\\n`;
  }
  return `  #text(size: 9pt)[${escapeTypstContent(content)}] \\\n`;
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

`;

  const sections = groupUnderHeader(contentBlocks, 'h1');

  for (const section of sections) {
    const sectionTitle = section.header?.content || '';
    if (!sectionTitle) continue;

    typst += `#section-title[${escapeTypstContent(sectionTitle)}]\n`;

    // Work experience sections get the table layout
    if (/職務経歴|職歴|経験|work experience/i.test(sectionTitle)) {
      // Group consecutive blocks by H2 (company name)
      const companies = groupUnderHeader(section.children, 'h2');

      // Merge consecutive companies with the same name into one block
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

        // Group within company by H3 (project/role)
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
    } else {
      // Non-table sections: simple list or paragraph format
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
    }
  }

  // Process supplementaryBlocks (skills, self-PR, etc.)
  const suppSections = groupUnderHeader(supplementaryBlocks, 'h1');
  for (const section of suppSections) {
    const sectionTitle = section.header?.content || '';
    if (!sectionTitle) continue;

    typst += `#section-title[${escapeTypstContent(sectionTitle)}]\n`;

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
  }

  return typst;
}
