import { TemplateSettings } from '@app-types/template';

/**
 * Escapes special Typst characters in a content block.
 */
export function escapeTypstContent(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/#/g, '\\#')
    .replace(/\*/g, '\\*')
    .replace(/_/g, '\\_')
    .replace(/</g, '\\<')
    .replace(/>/g, '\\>')
    .replace(/"/g, '\\"')
    .replace(/@/g, '\\@')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\$/g, '\\$')
    .replace(/&/g, '\\&');
}

/**
 * Escapes special characters for use within a Typst string literal "xxx".
 */
export function escapeTypstString(text: string): string {
  if (!text) return '';
  return text.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * Formats a date string (YYYY-MM-DD or YYYY-MM) to Japanese format (YYYY年MM月).
 */
export function formatDateJapanese(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.trim().split(/[-/]/);
  if (parts.length >= 2) {
    const year = parts[0];
    const month = parseInt(parts[1], 10);
    return `${year}年${month}月`;
  }
  return dateStr;
}

/**
 * Formats a date range string (e.g., "2020-01 -- 2022-02") to Japanese format.
 */
export function formatDateRangeJapanese(rangeStr: string): string {
  if (!rangeStr) return '';
  // Support both "--" and "-" as separators
  const delimiter = rangeStr.includes('--') ? '--' : '-';
  const parts = rangeStr.split(delimiter);
  if (parts.length === 2) {
    const start = formatDateJapanese(parts[0]);
    const end =
      parts[1].trim().toLowerCase() === 'present' || parts[1].trim() === '現在'
        ? '現在'
        : formatDateJapanese(parts[1]);
    return `${start} 〜 ${end}`;
  }
  return formatDateJapanese(rangeStr);
}

export function getAccentColor(settings: TemplateSettings): string {
  if (settings.colorScheme.startsWith('#')) return settings.colorScheme;
  const colorMap: Record<string, string> = {
    'awesome-red': '#DC3522',
    'awesome-skyblue': '#0395DE',
    'awesome-emerald': '#00A388',
    'awesome-orange': '#FF6138',
  };
  return colorMap[settings.colorScheme] || '#DC3522';
}
