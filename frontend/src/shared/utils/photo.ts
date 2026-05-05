/**
 * Converts a data URL (image/png or image/jpeg) to Typst-compatible byte array string.
 */
export function dataUrlToTypstBytes(dataUrl: string): string {
  const base64 = dataUrl.split(',')[1];
  if (!base64) return '0x00';
  const binaryStr = atob(base64);
  const parts: string[] = [];
  for (let i = 0; i < binaryStr.length; i++) {
    parts.push('0x' + binaryStr.charCodeAt(i).toString(16).toUpperCase().padStart(2, '0'));
  }
  const lines: string[] = [];
  for (let i = 0; i < parts.length; i += 16) {
    lines.push('    ' + parts.slice(i, i + 16).join(', '));
  }
  return lines.join(',\n') + ',';
}
