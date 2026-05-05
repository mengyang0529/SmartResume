export const EDITOR_COLORS = [
  { label: 'Default', value: '' },
  { label: 'Red', value: '#DC3522' },
  { label: 'Sky', value: '#0395DE' },
  { label: 'Emerald', value: '#00A388' },
  { label: 'Orange', value: '#FF6138' },
  { label: 'White', value: '#ffffff' },
] as const;

export const BLOCK_TYPES = [
  { type: 'h1' as const, label: 'H1' },
  { type: 'h2' as const, label: 'H2' },
  { type: 'h3' as const, label: 'H3' },
  { type: 'bullet' as const, label: '•' },
  { type: 'paragraph' as const, label: '¶' },
] as const;

export const SUPPLEMENTARY_HEADER = '## Supplementary';

export const MD_HEADER_TO_BLOCK_TYPE = {
  '##': 'h1',
  '###': 'h2',
  '####': 'h3',
} as const;

export const BLOCK_TYPE_TO_MD_HEADER = Object.fromEntries(
  Object.entries(MD_HEADER_TO_BLOCK_TYPE).map(([md, type]) => [type, md])
) as Record<string, string>;

export type EditorColor = (typeof EDITOR_COLORS)[number]['value'];
