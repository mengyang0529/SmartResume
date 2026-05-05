import { PersonalInfo } from '@app-types/resume';
import { TemplateSettings } from '@app-types/template';
import { RichTextBlock } from '@app-types/richText';
import { escapeTypstContent, escapeTypstString, getAccentColor } from './shared';
import { groupUnderHeader } from './helpers';

function renderFormattedText(content: string, bold?: boolean, color?: string): string {
  let text = escapeTypstContent(content);
  if (bold) text = `*${text}*`;
  if (color) text = `#text(fill: rgb("${color}"))[${text}]`;
  return text;
}

function renderArtHeading(content: string, accentColor: string): string {
  const len = Math.max(1, Math.min(3, Math.floor(content.length / 2)));
  const part1 = escapeTypstContent(content.slice(0, len));
  const part2 = escapeTypstContent(content.slice(len));
  return `= #text(fill: rgb("${accentColor}"))[${part1}]#text(fill: black)[${part2}]\n\n`;
}

function renderBlocksAsEntries(
  blocks: RichTextBlock[],
  template?: string,
  accentColor?: string
): string {
  let typst = '';
  const sections = groupUnderHeader(blocks, 'h1');

  sections.forEach(section => {
    if (section.header) {
      if (template === 'art' && accentColor) {
        typst += renderArtHeading(section.header.content, accentColor);
      } else {
        typst += `= ${renderFormattedText(section.header.content, section.header.bold ?? false, section.header.color)}\n\n`;
      }
    }

    const entries = groupUnderHeader(section.children, 'h2');
    entries.forEach(entry => {
      if (!entry.header) {
        // Blocks before any H2 in this section
        entry.children.forEach(block => {
          typst += `${renderFormattedText(block.content, block.bold, block.color)}\n\n`;
        });
        return;
      }

      const title = renderFormattedText(
        entry.header.content,
        entry.header.bold,
        entry.header.color
      );
      const location = entry.header.rightContent
        ? escapeTypstContent(entry.header.rightContent)
        : '';

      // Look for H3 (subtitle/date) in children
      const h3 = entry.children.find(b => b.type === 'h3');
      const description = h3 ? renderFormattedText(h3.content, h3.bold, h3.color) : '';
      const date = h3 && h3.rightContent ? escapeTypstContent(h3.rightContent) : '';

      const items = entry.children
        .filter(b => b.type === 'bullet' || b.type === 'paragraph')
        .map(b => renderFormattedText(b.content, b.bold, b.color));

      typst += `#resume-entry(
  title: [${title}],
  location: [${location}],
  date: [${date}],
  description: [${description}],
)\n`;

      if (items.length > 0) {
        typst += `#resume-item[\n`;
        items.forEach(item => {
          typst += `  - ${item}\n`;
        });
        typst += `]\n\n`;
      }
    });
  });

  return typst;
}

export function generateWesternResumeTypst(
  personal: PersonalInfo,
  contentBlocks: RichTextBlock[],
  supplementaryBlocks: RichTextBlock[],
  settings: TemplateSettings,
  templateSlug: string
): string {
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
    // P0-5: Use shadow-mapped path instead of embedding huge bytes
    photoEntry = 'profile-picture: image("photo.raw", height: 4cm, fit: "cover"),';
  } else {
    photoEntry = 'profile-picture: none,';
  }

  const templateFiles: Record<string, string> = {
    classic: 'awesome-cv-classic.typ',
    modern: 'awesome-cv-modern.typ',
    art: 'awesome-cv-art.typ',
  };
  const templateFile = templateFiles[templateSlug] || 'awesome-cv-classic.typ';
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

  // 1. Content Modules
  typst += renderBlocksAsEntries(contentBlocks, templateSlug, accentColor);

  // 2. Skills
  if (supplementaryBlocks.length > 0) {
    const skillsGroups = groupUnderHeader(supplementaryBlocks, 'h1');

    skillsGroups.forEach(group => {
      if (group.header) {
        if (templateSlug === 'art') {
          typst += renderArtHeading(group.header.content, accentColor);
        } else {
          typst += `= ${escapeTypstContent(group.header.content)}\n\n`;
        }
      }

      const categoryGroups = groupUnderHeader(group.children, 'h2');
      categoryGroups.forEach(catGroup => {
        const cat = catGroup.header ? catGroup.header.content : 'General';
        const names = catGroup.children
          .filter(b => b.type !== 'h1' && b.type !== 'h2')
          .map(b => b.content);

        if (names.length > 0) {
          const namesList =
            names.length === 1
              ? `("${escapeTypstString(names[0])}",)`
              : `("${names.map(escapeTypstString).join('", "')}")`;
          typst += `#resume-skill-item("${escapeTypstString(cat)}", ${namesList})\n`;
        }
      });
    });
  }

  return typst;
}
