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
  return String(value ?? '').replace(/\\/g, '\\\\').replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/#/g, '\\#').replace(/@/g, '\\@');
}

function renderBulletItems(description: string, indent: number = 6): string {
  if (!description) return '';
  const lines = description.split('\n');
  const otherLines = lines.filter(l => !/使用技術[:：]/.test(l));
  let result = '';
  for (const line of otherLines) {
    if (line.trim()) {
      result += `${' '.repeat(indent)}[${escapeContentBlock(line.trim())}],\n`;
    }
  }
  return result;
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
  const summarySection = sections.find(s => /職務要約/.test(s.title));
  const summaryFromSection = summarySection?.entries?.[0]?.description || '';
  const effectiveSummary = data.summary || summaryFromSection;
  if (effectiveSummary) {
    typst += `// ── Professional Summary ──
#section-title[職務要約]
${escapeContentBlock(effectiveSummary)}

`;
  }

  // ── 職務経歴 ──
  const workSections = sections.filter(s => !/免許・資格|education|学歴|educ|職務要約/i.test(s.title));
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

        // Overall period range for this company
        const allDates = sorted.map(e => e.startDate).filter(Boolean);
        const oldest = allDates.length > 1
          ? sorted[sorted.length - 1].startDate
          : sorted[0].startDate;
        const newest = sorted[0].endDate || '現在';
        const overallPeriod = formatPeriod(oldest, newest);

        typst += `#work-header("${escapeTypstString(company)}", "${escapeTypstString(overallPeriod)}")\n`;

        // Table for this company
        typst += `#table(
  columns: (3cm, 1fr),
  inset: (x: 5pt, y: 6pt),
  stroke: 0.5pt + black,
  table.cell(fill: luma(220))[#align(center)[*期間*]],
  table.cell(fill: luma(220))[#align(center)[*業務内容*]],
`;

        for (const entry of sorted) {
          const period = formatPeriod(entry.startDate, entry.endDate);
          const subtitle = entry.subtitle ? escapeContentBlock(entry.subtitle) : '';
          const desc = renderBulletItems(entry.description || '');
          const tech = entry.technologies || '';

          typst += `  [${escapeContentBlock(period)}],
  [#text(size: 9pt)[`;

          if (subtitle) {
            typst += `${subtitle}`;
            if (desc || tech) typst += `\n    #linebreak()`;
          }

          if (desc) {
            typst += `\n    #list(\n      marker: [・],\n${desc}    )`;
          }

          if (tech) {
            typst += `\n    #linebreak()\n    #text(size: 8.5pt, fill: luma(100))[使用技術: ${escapeContentBlock(tech)}]`;
          }

          typst += `\n  ]],\n`;
        }

        typst += `)\n\n`;
      }
    }
  }

  // ── Section divider ──
  typst += `#section-divider\n\n`;

  // ── 活かせるスキル・知識 ──
  if (skills && skills.length > 0) {
    typst += `// ── Skills ──
#section-title[活かせるスキル・知識]
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
      if (bk.type === 'h1' && /志望の動機|自己PR/i.test(bk.content)) {
        const next = skillsBlocks.slice(i + 1).find(b => b.type !== 'h1');
        if (next) selfPrContent = next.content;
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

  // ── 以上 ──
  typst += `#align(right + bottom)[#text(size: 10pt)[以上]]
`;

  return typst;
}
