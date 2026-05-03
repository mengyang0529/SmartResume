import { ResumeData, TemplateSettings } from '../../types/resume'
import { RichTextBlock } from '../../types/richText'
import { generateAwesomeCvTypst } from './awesomeCv'
import { generateRirekishoTypst } from './rirekisho'
import { getAccentColor } from './shared'

export { getAccentColor }

type TypstGenerator = (
  data: ResumeData,
  settings: TemplateSettings,
  skillsBlocks?: RichTextBlock[],
) => string

const generators: Record<string, TypstGenerator> = {
  classic: generateAwesomeCvTypst,
  modern: generateAwesomeCvTypst,
  art: generateAwesomeCvTypst,
  rirekisho: generateRirekishoTypst,
}

export function generateResumeTypst(data: ResumeData, settings: TemplateSettings, skillsBlocks?: RichTextBlock[]): string {
  const slug = settings.template ?? 'classic'
  const generator = generators[slug]
  if (!generator) {
    console.warn(`Unknown template slug "${slug}", falling back to Classic`)
    return generateAwesomeCvTypst(data, settings, skillsBlocks)
  }
  return generator(data, settings, skillsBlocks)
}
