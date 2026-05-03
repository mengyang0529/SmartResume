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

          {/* Metadata for Shokumu Keirekisho */}
          {showMetadata && block.type === 'h2' && (
            <div className={clsx(
              "mt-2 ml-1 pl-3 border-l-2 border-[rgba(0,0,0,0.05)] space-y-1.5 transition-all overflow-hidden",
              !isActive && !block.projectName && !block.teamSize && !block.technologies ? "h-0 opacity-0" : "h-auto opacity-100 py-1"
            )}>
              {(isActive || block.projectName) && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-warm-400 uppercase tracking-wider w-20 shrink-0">Project</span>
                  <input
                    className="bg-transparent outline-none w-full text-xs text-warm-700 placeholder:text-warm-300"
                    placeholder="Project Name (e.g. EC Site Renewal)"
                    value={block.projectName || ''}
                    onChange={e => onChange(block.id, { projectName: e.target.value })}
                    onFocus={() => onFocus(block.id)}
                  />
                </div>
              )}
              {(isActive || block.teamSize) && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-warm-400 uppercase tracking-wider w-20 shrink-0">Team Size</span>
                  <input
                    className="bg-transparent outline-none w-full text-xs text-warm-700 placeholder:text-warm-300"
                    placeholder="Team Size (e.g. 5 members)"
                    value={block.teamSize || ''}
                    onChange={e => onChange(block.id, { teamSize: e.target.value })}
                    onFocus={() => onFocus(block.id)}
                  />
                </div>
              )}
              {(isActive || block.technologies) && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-warm-400 uppercase tracking-wider w-20 shrink-0">Tech Stack</span>
                  <input
                    className="bg-transparent outline-none w-full text-xs text-warm-700 placeholder:text-warm-300"
                    placeholder="Technologies (e.g. React, TypeScript, Node.js)"
                    value={block.technologies || ''}
                    onChange={e => onChange(block.id, { technologies: e.target.value })}
                    onFocus={() => onFocus(block.id)}
                  />
                </div>
              )}
            </div>
          )}
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
