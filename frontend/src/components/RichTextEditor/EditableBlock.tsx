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
  onConvertType: (id: string, type: BlockType) => void
}

const typeStyles: Record<BlockType, string> = {
  h1: 'text-2xl font-black text-white tracking-tight mt-4 mb-2',
  h2: 'text-lg font-bold text-gray-200 mt-3 mb-1',
  h3: 'text-sm font-semibold text-gray-300 mt-2 mb-1',
  bullet: 'text-sm text-gray-400 pl-4 relative before:content-["•"] before:absolute before:left-0 before:text-red-500',
  paragraph: 'text-sm text-gray-400 leading-relaxed',
}

export default function EditableBlock({
  block,
  isActive,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
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
    const text = contentRef.current?.textContent || ''
    onChange(block.id, { content: text })
  }, [block.id, onChange])

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
        'group/block relative rounded px-2 py-1 transition-colors',
        isActive ? 'bg-[#111111]' : 'hover:bg-[#0c0c0c]'
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
              'outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-800',
              typeStyles[block.type],
              block.bold && 'font-bold',
              isActive && 'caret-red-500'
            )}
            data-placeholder={getPlaceholder(block.type)}
            style={{ color: block.color }}
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
              'outline-none text-xs text-gray-500 font-mono text-right shrink-0 max-w-[200px] min-w-[80px]',
              'empty:before:content-[attr(data-placeholder)] empty:before:text-gray-900',
              isActive && 'caret-red-500'
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
