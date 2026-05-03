export type BlockType = 'h1' | 'h2' | 'h3' | 'bullet' | 'paragraph'

export interface RichTextBlock {
  id: string
  type: BlockType
  content: string
  rightContent?: string
  bold?: boolean
  color?: string
  // Optional metadata for structured entries (e.g. Shokumu Keirekisho)
  projectName?: string
  teamSize?: string
  technologies?: string
}

export interface RichTextSection {
  id: string
  title: string
  blocks: RichTextBlock[]
}
