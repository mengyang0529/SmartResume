import { ResumeData, TemplateSettings } from '../../types/resume';
import { RichTextBlock } from '../../types/richText';
import { escapeTypstString } from './shared';

function formatDateJapanese(dateStr: string): string {
  if (!dateStr) return '';
  const monthMap: Record<string, string> = {
    jan: '1', feb: '2', mar: '3', apr: '4', may: '5', jun: '6',
    jul: '7', aug: '8', sep: '9', oct: '10', nov: '11', dec: '12',
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

function formatPeriod(startDate: string, endDate?: string): string {
  const start = formatDateJapanese(startDate);
  const end = endDate ? formatDateJapanese(endDate) : '現在';
  return `${start} ～ ${end}`;
}

function todayJapanese(): string {
  const d = new Date();
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function escapeContentBlock(value: string): string {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/#/g, '\\#')
    .replace(/@/g, '\\@')
    .replace(/\*/g, '\\*')
    .replace(/_/g, '\\_');
}

function renderDescriptionBody(entry: { description?: string; technologies?: string; teamSize?: string; }): string {
  const lines = String(entry.description || '').split('\n').map(line => line.trim()).filter(Boolean);
  const content: string[] = [];

  for (const line of lines) {
    if (/^[-・]\s*/.test(line)) {
      const itemText = line.replace(/^[-・]\s*/, '');
      content.push(`    #text(size: 9pt)[${escapeContentBlock('・ ' + itemText)}]`);
      continue;
    }

    if (/^【.*】/.test(line)) {
      content.push(`    #text(size: 9pt, weight: "bold")[${escapeContentBlock(line)}]`);
      continue;
    }

    content.push(`    #text(size: 9pt)[${escapeContentBlock(line)}]`);
  }

  if (entry.teamSize) {
    content.push(`    #text(size: 9pt)[チーム規模：${escapeContentBlock(entry.teamSize)}]`);
  }
  if (entry.technologies) {
    content.push(`    #text(size: 9pt)[使用技術：${escapeContentBlock(entry.technologies)}]`);
  }

  return content.join('\n');
}

export function generateShokumuKeirekishoTypst(
  data: ResumeData,
  _settings: TemplateSettings,
  skillsBlocks?: RichTextBlock[]
): string {
  const { personal, sections, skills } = data;

  const authorEntries: string[] = [];
  authorEntries.push(`    firstname: "${escapeTypstString(personal.firstName)}",`);
  authorEntries.push(`    lastname: "${escapeTypstString(personal.lastName)}",`);

  const authorBlock = authorEntries.join('\n');

  const dateStr = todayJapanese();

  let typst = `#import "shokumukeirekisho/shokumukeirekisho.typ": *

#show: resume.with(
  author: (
${authorBlock}
  ),
  date: "${dateStr}",
  language: "ja",
  font: ("Noto Sans CJK JP", "Noto Sans CJK SC"),
)

`;

  // ── Document header ──
  typst += `// ── Document Header ──
#align(center)[#text(size: 15pt, weight: "bold")[職務経歴書]]
#v(2pt)
#align(right)[
  #text(size: 9pt)[${dateStr}現在]
  #linebreak()
  #text(size: 9pt)[氏名 ${escapeContentBlock(personal.lastName + ' ' + personal.firstName)}]
]

#v(10pt)

`;

  // ── 職務要約 ──
  const summarySection = sections.find(s => /職務要約/i.test(s.title));
  const summaryFromSection = summarySection?.entries?.map(e => e.description).filter(Boolean).join('\n') || '';
  
  // Prefer the editor section content over the (potentially stale) data.summary
  let effectiveSummary = (summaryFromSection || data.summary || '').trim();

  // Fallback: search in skillsBlocks if still not found
  if (!effectiveSummary && skillsBlocks) {
    for (let i = 0; i < skillsBlocks.length; i++) {
      const bk = skillsBlocks[i];
      if (bk.type === 'h1' && /職務要約/i.test(bk.content)) {
        // Collect all subsequent blocks until next H1
        const contents: string[] = [];
        for (let j = i + 1; j < skillsBlocks.length; j++) {
          if (skillsBlocks[j].type === 'h1') break;
          contents.push(skillsBlocks[j].content);
        }
        if (contents.length > 0) {
          effectiveSummary = contents.join('\n').trim();
        }
        break;
      }
    }
  }

  if (effectiveSummary) {
    typst += `// ── Professional Summary ──
#section-title[職務要約]
${escapeContentBlock(effectiveSummary)}

`;
  }

  const skillSections = sections.filter(s => /スキル|経験|技術|知識/.test(s.title));

  for (const sec of skillSections) {
    typst += `#section-title[${escapeTypstString(sec.title)}]
#list(
  marker: [・],
`;
    for (const entry of sec.entries) {
      const content = [entry.title, entry.description].filter(Boolean).join(' : ');
      if (content) {
        typst += `  [${escapeContentBlock(content)}],\n`;
      }
    }
    typst += `)\n\n`;
  }

  if (skills && skills.length > 0) {
    typst += `#section-title[テクニカルスキル]
#list(
  marker: [・],
`;
    const byCategory: Record<string, string[]> = {};
    for (const s of skills) {
      if (!byCategory[s.category]) byCategory[s.category] = [];
      byCategory[s.category].push(s.name);
    }
    for (const [cat, names] of Object.entries(byCategory)) {
      typst += `  [${escapeContentBlock(cat)} : ${escapeContentBlock(names.join('、'))}],\n`;
    }
    typst += `)\n\n`;
  }

  // ── 職務経歴 ──
  const workSections = sections.filter(s => !/免許・資格|education|学歴|educ|職務要約|スキル|経験|技術|知識/i.test(s.title));
  if (workSections.length > 0) {
    typst += `// ── Work Experience ──
#section-title[職務経歴]
`;
    for (const sec of workSections) {
      // Group entries by company (title) for multi-role entries
      const byCompany: Record<string, typeof sec.entries> = {};
      for (const entry of (sec.entries || [])) {
        const key = entry.title;
        if (!byCompany[key]) byCompany[key] = [];
        byCompany[key].push(entry);
      }

      for (const [company, entries] of Object.entries(byCompany)) {
        // Sort entries within company by startDate descending
        const sorted = [...entries].sort((a, b) => {
          return (b.startDate || '').localeCompare(a.startDate || '');
        });

        typst += `#table(
  columns: (auto, 1fr),
  stroke: 0.5pt + black,
  inset: (x: 8pt, y: 6pt),
  table.cell(colspan: 2)[#text(size: 10pt, weight: "bold")[${escapeTypstString(company)}]],
`;

        for (const entry of sorted) {
          const projectName = entry.subtitle ? escapeTypstString(entry.subtitle) : '';
          const entryPeriod = entry.startDate ? formatPeriod(entry.startDate, entry.endDate) : '';
          const bodyContent = renderDescriptionBody(entry);

          let cellLines = '';
          if (projectName) {
            cellLines += `    #text(size: 9pt, weight: "bold")[${projectName}]\n`;
          }
          if (bodyContent) {
            cellLines += bodyContent;
          }

          typst += `  table.cell(align: left + top)[${escapeTypstString(entryPeriod)}],
  [
${cellLines}
  ],
`;
        }

        typst += `)

`;
      }
    }
  }

  // ── 資格 ──
  const certSection = sections.find(s => /免許・資格/.test(s.title));
  const hasCerts = (certSection && certSection.entries.length > 0);
  if (hasCerts) {
    typst += `// ── Certifications ──
#section-title[資格]
#list(
  marker: [・],
`;
    for (const entry of certSection!.entries) {
      if (entry.title) {
        const certName = [entry.title, entry.description].filter(Boolean).join(': ');
        typst += `  [${escapeContentBlock(certName)}],\n`;
      }
    }
    typst += `)\n\n`;
  }

  // ── 自己PR (from skillsBlocks) ──
  let selfPrContent = '';
  if (skillsBlocks) {
    for (let i = 0; i < skillsBlocks.length; i++) {
      const bk = skillsBlocks[i];
      if (bk.type === 'h1' && /志望の动机|自己PR/i.test(bk.content)) {
        const contents: string[] = [];
        for (let j = i + 1; j < skillsBlocks.length; j++) {
          if (skillsBlocks[j].type === 'h1') break;
          contents.push(skillsBlocks[j].content);
        }
        if (contents.length > 0) {
          selfPrContent = contents.join('\n').trim();
        }
        break;
      }
    }
  }
  if (selfPrContent) {
    typst += `// ── Self PR ──
#section-title[自己PR]
${escapeContentBlock(selfPrContent)}

`;
  }

  return typst;
}
