import { ResumeData, TemplateSettings } from '../../types/resume';
import { RichTextBlock } from '../../types/richText';
import {
  escapeTypstContent,
  escapeTypstString,
  dataUrlToTypstBytes,
  getAccentColor,
} from './shared';

function renderFormattedText(content: string, bold?: boolean, color?: string): string {
  let text = escapeTypstContent(content);
  if (bold) text = `*${text}*`;
  if (color) text = `#text(fill: rgb("${color}"))[${text}]`;
  return text;
}

function renderBlocksAsEntries(
  blocks: RichTextBlock[],
  template?: string,
  accentColor?: string
): string {
  let typst = '';
  let currentEntry: {
    title?: string;
    location?: string;
    date?: string;
    description?: string;
    items: string[];
  } | null = null;

  const flush = () => {
    if (currentEntry) {
      typst += `#resume-entry(
  title: [${currentEntry.title || ''}],
  location: [${currentEntry.location || ''}],
  date: [${currentEntry.date || ''}],
  description: [${currentEntry.description || ''}],
)\n`;
      if (currentEntry.items.length > 0) {
        typst += `#resume-item[\n`;
        currentEntry.items.forEach(item => {
          typst += `  - ${item}\n`;
        });
        typst += `]\n\n`;
      }
    }
    currentEntry = null;
  };

  blocks.forEach(block => {
    if (block.type === 'h1') {
      flush();
      if (template === 'art' && accentColor) {
        const first3 = escapeTypstContent(block.content.slice(0, 3));
        const rest = escapeTypstContent(block.content.slice(3));
        typst += `= #text(fill: rgb("${accentColor}"))[${first3}]#text(fill: black)[${rest}]\n\n`;
      } else {
        typst += `= ${renderFormattedText(block.content, block.bold ?? false, block.color)}\n\n`;
      }
    } else if (block.type === 'h2') {
      flush();
      currentEntry = {
        title: renderFormattedText(block.content, block.bold, block.color),
        location: block.rightContent ? escapeTypstContent(block.rightContent) : '',
        items: [],
      };
    } else if (block.type === 'h3') {
      if (!currentEntry) currentEntry = { items: [] };
      currentEntry.description = renderFormattedText(block.content, block.bold, block.color);
      currentEntry.date = block.rightContent ? escapeTypstContent(block.rightContent) : '';
    } else if (block.type === 'bullet' || block.type === 'paragraph') {
      if (!currentEntry) currentEntry = { items: [] };
      currentEntry.items.push(renderFormattedText(block.content, block.bold, block.color));
    }
  });

  flush();
  return typst;
}

export function generateAwesomeCvTypst(
  data: ResumeData,
  settings: TemplateSettings,
  skillsBlocks?: RichTextBlock[]
): string {
  const { personal, education, sections, skills, summary } = data;

  const accentColor = getAccentColor(settings);
  const paperSize = settings.paperSize === 'letterpaper' ? 'us-letter' : 'a4';

  const authorEntries: string[] = [];
  authorEntries.push(`    firstname: "${escapeTypstString(personal.firstName)}",`);
  authorEntries.push(`    lastname: "${escapeTypstString(personal.lastName)}",`);
  authorEntries.push(`    positions: ("${escapeTypstString(personal.position)}",),`);
  authorEntries.push(`    email: "${escapeTypstString(personal.email)}",`);
  if (personal.mobile) authorEntries.push(`    phone: "${escapeTypstString(personal.mobile)}",`);
  if (personal.address)
    authorEntries.push(`    address: "${escapeTypstString(personal.address)}",`);
  if (personal.homepage)
    authorEntries.push(`    homepage: "${escapeTypstString(personal.homepage)}",`);

  const photoUrl = personal.photo?.url;
  let photoEntry: string;
  if (photoUrl) {
    photoEntry = `profile-picture: image(bytes((
${dataUrlToTypstBytes(photoUrl)}
)), height: 4cm, fit: "cover"),`;
  } else {
    photoEntry = 'profile-picture: none,';
  }

  const templateFiles: Record<string, string> = {
    classic: 'awesome-cv-classic.typ',
    modern: 'awesome-cv-modern.typ',
    art: 'awesome-cv-art.typ',
  };
  const templateFile = templateFiles[settings.template ?? 'classic'] || 'awesome-cv-classic.typ';
  const authorBlock = authorEntries.join('\n');

  let typst = `#import "${templateFile}": *

#show: resume.with(
  author: (
${authorBlock}
  ),
  ${photoEntry}
  date: datetime.today().display(),
  paper-size: "${paperSize}",
  accent-color: "${accentColor}",
  colored-headers: ${settings.sectionColorHighlight},
  language: "en",
  font: ("Noto Sans CJK SC", "Noto Sans CJK JP", "Source Sans 3"),
)

`;

  if (summary) {
    if (settings.template === 'art') {
      typst += `#block(sticky: true, above: 1em)[
  #set text(size: 16pt, weight: "regular")
  #align(left)[
    #text(fill: rgb("${accentColor}"))[*Sum*]#text(fill: black)[*mary*]
    #box(width: 1fr, line(length: 100%))
  ]
]\n\n#resume-item[\n  ${escapeTypstContent(summary)}\n]\n\n`;
    } else {
      typst += `#block(sticky: true, above: 1em)[
  #set text(size: 16pt, weight: "regular")
  #align(left)[
    #text(fill: black)[*Summary*]
    #box(width: 1fr, line(length: 100%))
  ]
]\n\n#resume-item[\n  ${escapeTypstContent(summary)}\n]\n\n`;
    }
  }

  // 1. Education
  if (education && education.length > 0) {
    if (education[0].blocks && education[0].blocks.length > 0) {
      typst += renderBlocksAsEntries(education[0].blocks, settings.template, accentColor);
    } else {
      if (settings.template === 'art') {
        typst += `= #text(fill: rgb("${accentColor}"))[Edu]#text(fill: black)[cation]\n\n`;
      } else {
        typst += `= Education\n\n`;
      }
      education.forEach(edu => {
        typst += `#resume-entry(
  title: "${escapeTypstString(edu.school)}",
  location: "${escapeTypstString(edu.location || '')}",
  date: "${escapeTypstString(edu.startDate)} -- ${escapeTypstString(edu.endDate || '')}",
  description: "${escapeTypstString(edu.degree)}",
)\n`;
        if (edu.description)
          typst += `#resume-item[\n  - ${escapeTypstContent(edu.description)}\n]\n\n`;
      });
    }
  }

  // 2. Dynamic Sections
  sections.forEach(sec => {
    if (sec.blocks && sec.blocks.length > 0) {
      typst += renderBlocksAsEntries(sec.blocks, settings.template, accentColor);
    } else if (sec.entries && sec.entries.length > 0) {
      if (settings.template === 'art') {
        const first3 = escapeTypstContent(sec.title.slice(0, 3));
        const rest = escapeTypstContent(sec.title.slice(3));
        typst += `= #text(fill: rgb("${accentColor}"))[${first3}]#text(fill: black)[${rest}]\n\n`;
      } else {
        typst += `= ${sec.title}\n\n`;
      }
      sec.entries.forEach(entry => {
        typst += `#resume-entry(
  title: "${escapeTypstString(entry.title)}",
  location: "${escapeTypstString(entry.location || '')}",
  date: "${escapeTypstString(entry.startDate)}${entry.endDate ? ' -- ' + entry.endDate : ''}",
  description: "${escapeTypstString(entry.subtitle)}",
)\n`;
        if (entry.description) {
          typst += `#resume-item[\n`;
          entry.description.split('\n').forEach(line => {
            if (line.trim()) typst += `  - ${escapeTypstContent(line.trim())}\n`;
          });
          typst += `]\n\n`;
        }
      });
    }
  });

  // 3. Skills
  if (skills && skills.length > 0) {
    const skillsHeading = skillsBlocks?.find(b => b.type === 'h1')?.content;
    if (skillsHeading) {
      if (settings.template === 'art') {
        const first3 = escapeTypstContent(skillsHeading.slice(0, 3));
        const rest = escapeTypstContent(skillsHeading.slice(3));
        typst += `= #text(fill: rgb("${accentColor}"))[${first3}]#text(fill: black)[${rest}]\n\n`;
      } else {
        typst += `= ${escapeTypstContent(skillsHeading)}\n\n`;
      }
    }
    const byCategory: Record<string, string[]> = {};
    skills.forEach(s => {
      if (!byCategory[s.category]) byCategory[s.category] = [];
      byCategory[s.category].push(s.name);
    });
    Object.entries(byCategory).forEach(([cat, names]) => {
      const namesList =
        names.length === 1
          ? `("${escapeTypstString(names[0])}",)`
          : `("${names.map(escapeTypstString).join('", "')}")`;
      typst += `#resume-skill-item("${escapeTypstString(cat)}", ${namesList})\n`;
    });
  }

  return typst;
}
