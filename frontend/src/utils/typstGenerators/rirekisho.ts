import { ResumeData, TemplateSettings } from '../../types/resume';
import { RichTextBlock } from '../../types/richText';
import { escapeTypstContent, escapeTypstString, dataUrlToTypstBytes } from './shared';

function formatDateJapanese(dateStr: string): string {
  if (!dateStr) return '';
  const monthMap: Record<string, string> = {
    jan: '1',
    feb: '2',
    mar: '3',
    apr: '4',
    may: '5',
    jun: '6',
    jul: '7',
    aug: '8',
    sep: '9',
    oct: '10',
    nov: '11',
    dec: '12',
  };
  const m = dateStr.trim().match(/^([a-zA-Z]+)\s+(\d{4})$/);
  if (m) {
    const monthNum = monthMap[m[1].toLowerCase().slice(0, 3)];
    if (monthNum) return `${m[2]}年${monthNum}月`;
  }
  const m2 = dateStr.trim().match(/^(\d{4})[-/](\d{1,2})$/);
  if (m2) return `${m2[1]}年${parseInt(m2[2])}月`;
  return dateStr;
}

export function generateRirekishoTypst(
  data: ResumeData,
  _settings: TemplateSettings,
  skillsBlocks?: RichTextBlock[]
): string {
  const { personal, education, sections, skills, summary } = data;

  const authorEntries: string[] = [];
  authorEntries.push(`    firstname: "${escapeTypstString(personal.firstName)}",`);
  authorEntries.push(`    lastname: "${escapeTypstString(personal.lastName)}",`);
  if (personal.furiganaFirstName)
    authorEntries.push(`    furigana-first: "${escapeTypstString(personal.furiganaFirstName)}",`);
  if (personal.furiganaLastName)
    authorEntries.push(`    furigana-last: "${escapeTypstString(personal.furiganaLastName)}",`);
  if (personal.birth) authorEntries.push(`    birth: "${escapeTypstString(personal.birth)}",`);
  if (personal.address)
    authorEntries.push(`    address: "${escapeTypstString(personal.address)}",`);
  if (personal.mobile) authorEntries.push(`    phone: "${escapeTypstString(personal.mobile)}",`);
  authorEntries.push(`    email: "${escapeTypstString(personal.email)}",`);

  const authorBlock = authorEntries.join('\n');

  const photoUrl = personal.photo?.url;
  const photoTypst = photoUrl
    ? `#box(height: 3.5cm, image(bytes((
${dataUrlToTypstBytes(photoUrl)}
    )), height: 3.5cm, fit: "cover"))`
    : `#text(fill: luma(160), size: 8pt)[写真]
        #linebreak()
        #text(size: 7pt)[4cm×3cm]`;

  let typst = `#import "rirekisho/rirekisho.typ": *

#show: resume.with(
  author: (
${authorBlock}
  ),
  language: "ja",
  font: ("Noto Sans CJK JP", "Noto Sans CJK SC"),
)

`;
  typst += `// Header section
#table(
  columns: (2cm, 1fr, 4cm),
  stroke: 0.5pt + black,
  rows: (auto, auto, auto, auto),
  [#align(center)[*氏名*]],
  ${
    personal.furiganaLastName || personal.furiganaFirstName
      ? `[#align(left)[
    #grid(
      columns: (auto, auto),
      row-gutter: 2pt,
      text(size: 9pt, weight: "regular")[${escapeTypstContent(personal.furiganaLastName || '')}],
      text(size: 9pt, weight: "regular")[${escapeTypstContent(personal.furiganaFirstName || '')}],
      text(size: 14pt, weight: "bold")[${escapeTypstContent(personal.lastName)}],
      text(size: 14pt, weight: "bold")[${escapeTypstContent(personal.firstName)}],
    )
  ]],`
      : `[#align(left)[
    #text(size: 14pt, weight: "bold")[${escapeTypstContent(personal.lastName + ' ' + personal.firstName)}]
  ]],`
  }
  table.cell(rowspan: 4)[#align(center + horizon)[
    #block(height: 4.5cm, stroke: 0.5pt + black, width: 100%, inset: 4pt)[
        ${photoTypst}
      ]
    ]
  ],
  [#align(center)[*生年月日*]],
  [#text(size: 9pt)[${personal.birth ? escapeTypstContent(personal.birth) : ''}]],
  [#align(center)[*現住所*]],
  [
    #text(size: 9pt)[
      ${personal.address ? escapeTypstContent(personal.address) : '（現住所）'}
      #linebreak()
      TEL: ${personal.mobile ? escapeTypstContent(personal.mobile) : ''}
      #linebreak()
      Email: ${escapeTypstContent(personal.email)}
    ]
  ],
  table.cell(colspan: 2)[#text(size: 8pt)[連絡先に○をつけてください（　　現住所　　・　　連絡先　　）]],
)
`;

  // Education & Work History
  const eduSection = sections.find(s => /education|学歴|学业|educ/i.test(s.title));
  const eduEntries = eduSection?.entries?.length
    ? eduSection.entries.map(e => ({
        date: formatDateJapanese(e.startDate || ''),
        content: `${e.title || ''}${e.subtitle ? ' ' + e.subtitle : ''}`,
        note: formatDateJapanese(e.endDate || ''),
      }))
    : education.map(e => ({
        date: formatDateJapanese(e.startDate || ''),
        content: `${e.school || ''}${e.degree ? ' ' + e.degree : ''}${e.field ? ' ' + e.field : ''}`,
        note: formatDateJapanese(e.endDate || ''),
      }));
  const workSections = eduSection
    ? sections.filter(s => s.id !== eduSection.id && !/免許・資格/.test(s.title))
    : sections.filter(s => !/免許・資格/.test(s.title));

  typst += `// Education & Work History
#table(
  columns: (2.5cm, 1fr),
  stroke: 0.5pt + black,
  [#align(center)[*年　月*]], [#align(center)[*学歴・職歴*]],
`;

  for (const e of eduEntries) {
    typst += `  [${escapeTypstContent(e.date)}], [${escapeTypstContent(e.content)}],\n`;
  }

  if (eduEntries.length > 0 && workSections.some(s => s.entries?.length)) {
    typst += `  [], [],\n`;
  }

  for (const sec of workSections) {
    if (sec.entries) {
      for (const entry of sec.entries) {
        const date = entry.startDate ? escapeTypstContent(formatDateJapanese(entry.startDate)) : '';
        const content = `${entry.title ? escapeTypstContent(entry.title) : ''}${entry.subtitle ? ' ' + escapeTypstContent(entry.subtitle) : ''}`;
        typst += `  [${date}], [${content}],\n`;
        if (entry.endDate) {
          typst += `  [${escapeTypstContent(formatDateJapanese(entry.endDate))}], [`;
          if (entry.description) typst += `${escapeTypstContent(entry.description)}`;
          typst += `],\n`;
        }
      }
    }
  }

  typst += `)\n\n`;

  // Certifications (免許・資格)
  const certSection = sections.find(s => /免許・資格/.test(s.title));
  if (certSection && certSection.entries.length > 0) {
    typst += `// Certifications
#table(
  columns: (2.5cm, 1fr),
  stroke: 0.5pt + black,
  [#align(center)[*年　月*]], [#align(center)[*免許・資格*]],
`;
    for (const entry of certSection.entries) {
      if (entry.title) {
        typst += `  [], [${escapeTypstContent(entry.title)}: ${escapeTypstContent(entry.description || '')}],\n`;
      }
    }
    typst += `)\n\n`;
  } else if (skills && skills.length > 0) {
    typst += `// Certifications
#table(
  columns: (2.5cm, 1fr),
  stroke: 0.5pt + black,
  [#align(center)[*年　月*]], [#align(center)[*免許・資格*]],
`;
    const byCategory: Record<string, string[]> = {};
    for (const s of skills) {
      if (!byCategory[s.category]) byCategory[s.category] = [];
      byCategory[s.category].push(s.name);
    }
    for (const [cat, names] of Object.entries(byCategory)) {
      typst += `  [], [${escapeTypstContent(cat)}: ${escapeTypstContent(names.join('、'))}],\n`;
    }
    typst += `)\n\n`;
  }

  // Motivation Section
  let motivationContent = summary || '';
  let requestsContent = '';
  if (skillsBlocks) {
    for (let i = 0; i < skillsBlocks.length; i++) {
      const bk = skillsBlocks[i];
      if (bk.type === 'h1' && /志望の動機|自己PR/i.test(bk.content)) {
        const next = skillsBlocks.slice(i + 1).find(b => b.type !== 'h1');
        if (next) motivationContent = next.content;
      }
      if (bk.type === 'h1' && /本人希望記入欄/i.test(bk.content)) {
        const next = skillsBlocks.slice(i + 1).find(b => b.type !== 'h1');
        if (next) requestsContent = next.content;
      }
    }
  }
  typst += `// Motivation / Self-PR
#table(
  columns: (1fr),
  stroke: 0.5pt + black,
  table.cell(colspan: 1)[#align(center)[*志望の動機、自己PR、趣味など*]],
  [#text(size: 9pt)[${escapeTypstContent(motivationContent)}]],
)

`;

  // Additional Requests
  typst += `// Additional requests
#table(
  columns: (1fr),
  stroke: 0.5pt + black,
  table.cell(colspan: 1)[#align(center)[*本人希望記入欄*]],
  [#text(size: 9pt)[${escapeTypstContent(requestsContent)}]],
)

`;

  return typst;
}
