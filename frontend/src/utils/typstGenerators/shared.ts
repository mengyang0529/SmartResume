import { TemplateSettings } from '../../types/resume'

export function escapeTypstContent(text: string): string {
  if (!text) return ''
  return text
    .replace(/\\/g, '\\\\')
    .replace(/#/g, '\\#')
    .replace(/\*/g, '\\*')
    .replace(/_/g, '\\_')
    .replace(/</g, '\\<')
    .replace(/>/g, '\\>')
    .replace(/"/g, '\\"')
    .replace(/@/g, '\\@')
}

export function escapeTypstString(text: string): string {
  if (!text) return ''
  return text.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

export function dataUrlToTypstBytes(dataUrl: string): string {
  const base64 = dataUrl.split(',')[1]
  if (!base64) return '0x00'
  const binaryStr = atob(base64)
  const parts: string[] = []
  for (let i = 0; i < binaryStr.length; i++) {
    parts.push('0x' + binaryStr.charCodeAt(i).toString(16).toUpperCase().padStart(2, '0'))
  }
  const lines: string[] = []
  for (let i = 0; i < parts.length; i += 16) {
    lines.push('    ' + parts.slice(i, i + 16).join(', '))
  }
  return lines.join(',\n') + ','
}

export function getAccentColor(settings: TemplateSettings): string {
  if (settings.colorScheme.startsWith('#')) return settings.colorScheme
  const colorMap: Record<string, string> = {
    'awesome-red': '#DC3522',
    'awesome-skyblue': '#0395DE',
    'awesome-emerald': '#00A388',
    'awesome-orange': '#FF6138',
  }
  return colorMap[settings.colorScheme] || '#DC3522'
}
