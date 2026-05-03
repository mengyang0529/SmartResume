import { useRef, useEffect, useCallback } from 'react'
import type { RichTextBlock, BlockType } from '../../types/richText'
import clsx from 'clsx'

interface EditableBlockProps {
  block: RichTextBlock
  isActive: boolean
  onChange: (id: string, updates: Partial<RichTextBlock>) => void
  onFocus: (id: string) => void
  onBlur: () => void
  onKeyDown: (e: React.KeyboardEvent, id: string) => void
  headingColor?: string
  showMetadata?: boolean
}

const typeStyles: Record<BlockType, string> = {
  h1: 'text-xl font-bold text-[rgba(0,0,0,0.95)] mt-4 mb-2 px-0 py-1 border-l-[3px] border-[#0075de] pl-3',
  h2: 'text-lg font-semibold text-[rgba(0,0,0,0.95)] mt-3 mb-1',
  h3: 'text-caption font-semibold text-warm-500 mt-2 mb-1',
  bullet: 'text-sm text-[rgba(0,0,0,0.95)] pl-4 relative before:content-["•"] before:absolute before:left-0 before:text-[#0075de]',
  paragraph: 'text-sm text-[rgba(0,0,0,0.95)] leading-relaxed',
}

export default function EditableBlock({
  block,
  isActive,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  headingColor: _headingColor,
  showMetadata,
}: EditableBlockProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (contentRef.current && contentRef.current.textContent !== block.content) {
      contentRef.current.textContent = block.content
    }
  }, [block.id]) // only sync on mount / id change

  useEffect(() => {
    if (rightRef.current && rightRef.current.textContent !== (block.rightContent || '')) {
      rightRef.current.textContent = block.rightContent || ''
    }
  }, [block.id])

  const handleContentInput = useCallback(() => {
    let text = contentRef.current?.textContent || ''

    // 1. Detect whole-line bold shortcut: **text**
    if (!block.bold && text.startsWith('**') && text.endsWith('**') && text.length > 4) {
      const newContent = text.slice(2, -2)
      if (contentRef.current) contentRef.current.textContent = newContent
      onChange(block.id, { content: newContent, bold: true })
      return
    }

    // 2. Detect header shortcuts at the start of a paragraph/bullet
    if (block.type === 'paragraph' || block.type === 'bullet') {
      if (text.startsWith('# ')) {
        const newContent = text.slice(2)
        if (contentRef.current) contentRef.current.textContent = newContent
        onChange(block.id, { content: newContent, type: 'h1' })
        return
      }
      if (text.startsWith('## ')) {
        const newContent = text.slice(3)
        if (contentRef.current) contentRef.current.textContent = newContent
        onChange(block.id, { content: newContent, type: 'h2' })
        return
      }
      if (text.startsWith('### ') || text.startsWith('#### ')) {
        const offset = text.startsWith('#### ') ? 5 : 4
        const newContent = text.slice(offset)
        if (contentRef.current) contentRef.current.textContent = newContent
        onChange(block.id, { content: newContent, type: 'h3' })
        return
      }
    }

    onChange(block.id, { content: text })
  }, [block.id, block.type, block.bold, onChange])

  const handleRightInput = useCallback(() => {
    const text = rightRef.current?.textContent || ''
    onChange(block.id, { rightContent: text })
  }, [block.id, onChange])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }, [])

  const showRight = block.type === 'h2' || block.type === 'h3'

  return (
    <div
      className={clsx(
        'group/block relative rounded-micro transition-colors',
        block.type === 'h1' ? 'px-0 py-0 mb-1' : 'px-2 py-1',
        isActive ? (block.type === 'h1' ? 'bg-transparent' : 'bg-[rgba(0,0,0,0.03)]') : 'hover:bg-[rgba(0,0,0,0.02)]'
      )}
    >
      <div className="flex items-start gap-2">
        {/* Content area */}
        <div className="flex-1 min-w-0">
          <div
            ref={contentRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleContentInput}
            onFocus={() => onFocus(block.id)}
            onBlur={onBlur}
            onKeyDown={(e) => onKeyDown(e, block.id)}
            onPaste={handlePaste}
            className={clsx(
              'outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-warm-300',
              typeStyles[block.type],
              block.bold && 'font-bold',
              isActive && 'caret-[#0075de]'
            )}
            data-placeholder={getPlaceholder(block.type)}
            style={{ color: block.color || undefined }}
          />
        </div>

        {/* Right content */}
        {showRight && (
          <div
            ref={rightRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleRightInput}
            onFocus={() => onFocus(block.id)}
            onBlur={onBlur}
            onKeyDown={(e) => onKeyDown(e, block.id)}
            onPaste={handlePaste}
            className={clsx(
              'outline-none text-xs text-warm-400 font-mono text-right shrink-0 max-w-[200px] min-w-[80px]',
              'empty:before:content-[attr(data-placeholder)] empty:before:text-warm-300',
              isActive && 'caret-[#0075de]'
            )}
            data-placeholder="right..."
          />
        )}
      </div>
    </div>
  )
}

function getPlaceholder(type: BlockType): string {
  switch (type) {
    case 'h1':
      return 'Section Title'
    case 'h2':
      return 'Main title (e.g. company, school)'
    case 'h3':
      return 'Subtitle (e.g. role, degree)'
    case 'bullet':
      return 'Bullet point...'
    case 'paragraph':
      return 'Type here...'
  }
}
