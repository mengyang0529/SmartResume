import type { Skill, Education } from '../types/resume';
import type { RichTextBlock } from '../types/richText';
import { generateId } from './id';

export function skillsToBlocks(skills: Skill[]): RichTextBlock[] {
  const byCategory: Record<string, string[]> = {};
  skills.forEach(s => {
    if (!byCategory[s.category]) byCategory[s.category] = [];
    byCategory[s.category].push(s.name);
  });
  const blocks: RichTextBlock[] = [];
  if (Object.keys(byCategory).length > 0) {
    blocks.push({ id: generateId('blk'), type: 'h1', content: 'Skills' });
  }
  Object.entries(byCategory).forEach(([cat, names]) => {
    if (cat) blocks.push({ id: generateId('blk'), type: 'h2', content: cat });
    names.forEach(name => {
      if (name.trim()) blocks.push({ id: generateId('blk'), type: 'h3', content: name.trim() });
    });
  });
  return blocks;
}

export function blocksToSkills(blocks: RichTextBlock[]): Skill[] {
  const skills: Skill[] = [];
  let currentCategory = '';
  blocks.forEach((block, i) => {
    if (block.type === 'h2') {
      currentCategory = block.content;
    } else if (block.type === 'h3' || block.type === 'bullet' || block.type === 'paragraph') {
      if (block.content.trim()) {
        skills.push({ id: `sk-${i}`, category: currentCategory, name: block.content.trim() });
      }
    }
  });
  return skills;
}

export function educationToBlocks(education: Education[]): RichTextBlock[] {
  const blocks: RichTextBlock[] = [];
  blocks.push({ id: generateId('blk'), type: 'h1', content: 'Education' });
  education.forEach(edu => {
    blocks.push({
      id: generateId('blk'),
      type: 'h2',
      content: edu.school,
      rightContent: edu.location || '',
    });
    blocks.push({
      id: generateId('blk'),
      type: 'h3',
      content: edu.degree,
      rightContent: `${edu.startDate}${edu.endDate ? ' -- ' + edu.endDate : ''}`,
    });
    if (edu.description) {
      edu.description
        .split('\n')
        .filter(l => l.trim())
        .forEach(line => {
          blocks.push({ id: generateId('blk'), type: 'bullet', content: line.trim() });
        });
    }
  });
  return blocks;
}
