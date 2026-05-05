/**
 * Detects if a line is fully wrapped in bold markdown (**text**).
 * Returns { content: string, bold: boolean }
 */
export function parseBoldLine(text: string): { content: string; bold: boolean } {
  const trimmed = text.trim();
  const boldMatch = trimmed.match(/^\*\*(.+)\*\*$/);
  if (boldMatch) {
    return { content: boldMatch[1].trim(), bold: true };
  }
  return { content: text, bold: false };
}
