import { RichTextBlock } from '@app-types/richText';

/**
 * Groups blocks by H1 headers. Each group starts with an H1 block (if present)
 * followed by all blocks until the next H1.
 */
export function groupBlocksByH1(blocks: RichTextBlock[]): RichTextBlock[][] {
  const groups: RichTextBlock[][] = [];
  let currentGroup: RichTextBlock[] = [];

  for (const block of blocks) {
    if (block.type === 'h1') {
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }
      currentGroup = [block];
    } else {
      currentGroup.push(block);
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

/**
 * Groups blocks by H2 headers within a set of blocks.
 */
export function groupBlocksByH2(blocks: RichTextBlock[]): RichTextBlock[][] {
  const groups: RichTextBlock[][] = [];
  let currentGroup: RichTextBlock[] = [];

  for (const block of blocks) {
    if (block.type === 'h2') {
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }
      currentGroup = [block];
    } else {
      currentGroup.push(block);
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

/**
 * Groups child blocks by their parent header type.
 * For example, grouping all blocks under their preceding H2.
 */
export function groupUnderHeader(
  blocks: RichTextBlock[],
  headerType: 'h1' | 'h2'
): { header: RichTextBlock | null; children: RichTextBlock[] }[] {
  const result: { header: RichTextBlock | null; children: RichTextBlock[] }[] = [];
  let current: { header: RichTextBlock | null; children: RichTextBlock[] } = {
    header: null,
    children: [],
  };

  for (const block of blocks) {
    if (block.type === headerType) {
      if (current.header || current.children.length > 0) {
        result.push(current);
      }
      current = { header: block, children: [] };
    } else {
      current.children.push(block);
    }
  }

  if (current.header || current.children.length > 0) {
    result.push(current);
  }

  return result;
}
