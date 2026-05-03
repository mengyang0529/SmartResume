import { ResumeData, TemplateSettings } from '../../types/resume';
import { RichTextBlock } from '../../types/richText';
import { escapeTypstContent, escapeTypstString } from './shared';

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

function renderDescription(description: string, indent: number = 4): string {
  if (!description) return '';
  const lines = description.split('\n');
  const otherLines = lines.filter(l => !/使用技術[:：]/.test(l));
  let result = '';
  for (const line of otherLines) {
    if (line.trim()) {
      result += `${' '.repeat(indent)}- ${escapeTypstContent(line.trim())}\n`;
    }
  }
  return result;
}

function extractTechnologies(description: string): string {
  if (!description) return '';
  const lines = description.split('\n');
  const techLine = lines.find(l => /使用技術[:：]/.test(l));
  if (techLine) {
    return techLine.replace(/使用技術[:：]\s*/, '').trim();
  }
  return '';
}

export function generateShokumuKeirekishoTypst(
  data: ResumeData,
  _settings: TemplateSettings,
  skillsBlocks?: RichTextBlock[]
): string {
  const { personal, education, sections, skills } = data;

  const authorEntries: string[] = [];
  authorEntries.push(`    firstname: "${escapeTypstString(personal.firstName)}",`);
  authorEntries.push(`    lastname: "${escapeTypstString(personal.lastName)}",`);
  if (personal.birth) authorEntries.push(`    birth: "${escapeTypstString(personal.birth)}",`);
  if (personal.address) authorEntries.push(`    address: "${escapeTypstString(personal.address)}",`);
  if (personal.mobile) authorEntries.push(`    phone: "${escapeTypstString(personal.mobile)}",`);
  authorEntries.push(`    email: "${escapeTypstString(personal.email)}",`);
  if (personal.furiganaFirstName || personal.furiganaLastName) {
    authorEntries.push(`    furigana: "${escapeTypstString((personal.furiganaLastName || '') + ' ' + (personal.furiganaFirstName || ''))}",`);
  }

  const authorBlock = authorEntries.join('\n');

  let typst = `#import "shokumukeirekisho/shokumukeirekisho.typ": *

#show: resume.with(
  author: (
${authorBlock}
  ),
  language: "ja",
  font: ("Noto Sans CJK JP", "Noto Sans CJK SC"),
)

`;

  // ── 基本情報 ──
  typst += `// ── Basic Info ──
#section-title[基本情報]
#grid(
  columns: (auto, 1fr),
  gutter: (x: 8pt, y: 2pt),
`;

  const nameKana = personal.furiganaLastName || personal.furiganaFirstName
    ? `（${escapeTypstContent([personal.furiganaLastName, personal.furiganaFirstName].filter(Boolean).join(' '))}）`
    : '';
  typst += `  [#text(size: 9pt, weight: "bold")[氏名]], [#text(size: 9pt)[${escapeTypstContent(personal.lastName + ' ' + personal.firstName)}${nameKana}]],\n`;

  if (personal.birth) {
    typst += `  [#text(size: 9pt, weight: "bold")[生年月日]], [#text(size: 9pt)[${escapeTypstContent(personal.birth)}]],\n`;
  }

  // Final education for 最終学歴
  const lastEdu = education && education.length > 0 ? education[education.length - 1] : null;
  if (lastEdu) {
    typst += `  [#text(size: 9pt, weight: "bold")[最終学歴]], [#text(size: 9pt)[${escapeTypstContent(lastEdu.school)}${lastEdu.degree ? ' ' + lastEdu.degree : ''}]],\n`;
  }

  if (personal.address) {
    typst += `  [#text(size: 9pt, weight: "bold")[現住所]], [#text(size: 9pt)[${escapeTypstContent(personal.address)}]],\n`;
  }
  typst += `  [#text(size: 9pt, weight: "bold")[連絡先]], [#text(size: 9pt)[TEL: ${escapeTypstContent(personal.mobile || '')}  Email: ${escapeTypstContent(personal.email)}]],\n`;
  typst += `)\n\n`;

  // ── 職務要約 ──
  if (data.summary) {
    typst += `// ── Professional Summary ──
#section-title[職務要約]
${escapeTypstContent(data.summary)}

`;
  }

  // ── 職務経歴 ──
  const workSections = sections.filter(s => !/免許・資格|education|学歴|educ/i.test(s.title));
  if (workSections.length > 0) {
    typst += `// ── Work Experience ──
#section-title[職務経歴]
`;
    for (const sec of workSections) {
      // Sort entries by startDate descending (newest first)
      const sorted = [...(sec.entries || [])].sort((a, b) => {
        return (b.startDate || '').localeCompare(a.startDate || '');
      });

      for (const entry of sorted) {
        const period = formatPeriod(entry.startDate, entry.endDate);
        const tech = entry.technologies || extractTechnologies(entry.description || '');
        const desc = renderDescription(entry.description || '');

        typst += `#exp-header("${escapeTypstString(entry.title)}", "${escapeTypstString(period)}")\n`;

        if (entry.subtitle) {
          typst += `#exp-row("役割", "${escapeTypstString(entry.subtitle)}")\n`;
        }
        if (entry.projectName) {
          typst += `#exp-row("案件", "${escapeTypstString(entry.projectName)}")\n`;
        }
        if (entry.teamSize) {
          typst += `#exp-row("規模", "${escapeTypstString(entry.teamSize)}")\n`;
        }
        if (tech) {
          typst += `#exp-row("使用技術", "${escapeTypstString(tech)}")\n`;
        }
        if (desc) {
          typst += `#block-separator\n#bullet-items(\n${desc})\n`;
        }
        typst += '\n';
      }
    }
  }

  // ── 活かせるスキル・知識 ──
  if (skills && skills.length > 0) {
    typst += `// ── Skills ──
#section-title[活かせるスキル・知識]
`;
    const byCategory: Record<string, string[]> = {};
    for (const s of skills) {
      if (!byCategory[s.category]) byCategory[s.category] = [];
      byCategory[s.category].push(s.name);
    }
    for (const [cat, names] of Object.entries(byCategory)) {
      typst += `#skill-category("${escapeTypstString(cat)}", "${escapeTypstString(names.join('、'))}")\n`;
    }
    typst += '\n';
  }

  // ── 資格 ──
  const certSection = sections.find(s => /免許・資格/.test(s.title));
  if (certSection && certSection.entries.length > 0) {
    typst += `// ── Certifications ──
#section-title[資格]
`;
    for (const entry of certSection.entries) {
      if (entry.title) {
        const certName = [entry.title, entry.description].filter(Boolean).join(': ');
        typst += `- ${escapeTypstContent(certName)}\n`;
      }
    }
    typst += '\n';
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
${escapeTypstContent(selfPrContent)}

`;
  }

  return typst;
}
