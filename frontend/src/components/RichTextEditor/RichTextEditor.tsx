import { useState, useCallback, useRef, useEffect } from 'react'
import type { RichTextBlock, BlockType } from '../../types/richText'
import EditableBlock from './EditableBlock'
import RichTextToolbar from './RichTextToolbar'
import { motion } from 'framer-motion'

interface RichTextEditorProps {
  blocks: RichTextBlock[]
  onChange: (blocks: RichTextBlock[]) => void
  placeholder?: string
}

export default function RichTextEditor({ blocks, onChange, placeholder }: RichTextEditorProps) {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  const activeBlock = blocks.find((b) => b.id === activeBlockId) || null
  const activeIndex = activeBlock ? blocks.findIndex((b) => b.id === activeBlockId) : -1

  const updateBlock = useCallback(
    (id: string, updates: Partial<RichTextBlock>) => {
      onChange(blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)))
    },
    [blocks, onChange]
  )

  const addBlock = useCallback(
    (afterId?: string, type: BlockType = 'paragraph') => {
      const newBlock: RichTextBlock = {
        id: `block-${crypto.randomUUID()}`,
        type,
        content: '',
      }
      if (!afterId) {
        onChange([...blocks, newBlock])
      } else {
        const idx = blocks.findIndex((b) => b.id === afterId)
        const newBlocks = [...blocks]
        newBlocks.splice(idx + 1, 0, newBlock)
        onChange(newBlocks)
      }
      // Focus the new block after render
      setTimeout(() => setActiveBlockId(newBlock.id), 0)
    },
    [blocks, onChange]
  )

  const deleteBlock = useCallback(
    (id: string) => {
      if (blocks.length <= 1) return
      const idx = blocks.findIndex((b) => b.id === id)
      const newBlocks = blocks.filter((b) => b.id !== id)
      onChange(newBlocks)
      // Move focus to previous or next block
      const nextId = newBlocks[idx] ? newBlocks[idx].id : newBlocks[idx - 1]?.id
      if (nextId) setActiveBlockId(nextId)
    },
    [blocks, onChange]
  )

  const moveBlock = useCallback(
    (id: string, direction: 'up' | 'down') => {
      const idx = blocks.findIndex((b) => b.id === id)
      const newIndex = direction === 'up' ? idx - 1 : idx + 1
      if (newIndex < 0 || newIndex >= blocks.length) return
      const newBlocks = [...blocks]
      const [moved] = newBlocks.splice(idx, 1)
      newBlocks.splice(newIndex, 0, moved)
      onChange(newBlocks)
    },
    [blocks, onChange]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, id: string) => {
      const idx = blocks.findIndex((b) => b.id === id)
      const block = blocks[idx]

      // Enter: create new block
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        const type = block.type === 'bullet' ? 'bullet' : 'paragraph'
        addBlock(id, type)
        return
      }

      // Backspace on empty block: delete it and focus previous
      if (e.key === 'Backspace' && block.content === '' && !block.rightContent) {
        e.preventDefault()
        if (blocks.length > 1) {
          deleteBlock(id)
        }
        return
      }

      // Tab in bullet: convert to paragraph or vice versa
      if (e.key === 'Tab') {
        e.preventDefault()
        if (block.type === 'bullet') {
          updateBlock(id, { type: 'paragraph' })
        } else if (block.type === 'paragraph') {
          updateBlock(id, { type: 'bullet' })
        }
        return
      }

      // Arrow up/down navigation between blocks
      if (e.key === 'ArrowUp' && idx > 0) {
        const sel = window.getSelection()
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0)
          const rect = range.getBoundingClientRect()
          const prevBlockEl = editorRef.current?.querySelector(`[data-block-id="${blocks[idx - 1].id}"]`)
          if (prevBlockEl) {
            const prevRect = prevBlockEl.getBoundingClientRect()
            if (rect.top <= prevRect.bottom + 5) {
              e.preventDefault()
              setActiveBlockId(blocks[idx - 1].id)
            }
          }
        }
      }

      if (e.key === 'ArrowDown' && idx < blocks.length - 1) {
        const sel = window.getSelection()
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0)
          const rect = range.getBoundingClientRect()
          const nextBlockEl = editorRef.current?.querySelector(`[data-block-id="${blocks[idx + 1].id}"]`)
          if (nextBlockEl) {
            const nextRect = nextBlockEl.getBoundingClientRect()
            if (rect.bottom >= nextRect.top - 5) {
              e.preventDefault()
              setActiveBlockId(blocks[idx + 1].id)
            }
          }
        }
      }
    },
    [blocks, addBlock, deleteBlock, updateBlock]
  )

  // Auto-focus first block if empty editor
  useEffect(() => {
    if (blocks.length === 0) {
      const newBlock: RichTextBlock = {
        id: `block-${crypto.randomUUID()}`,
        type: 'h1',
        content: '',
      }
      onChange([newBlock])
      setActiveBlockId(newBlock.id)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="border border-gray-800/50 rounded bg-[#050505]">
      <RichTextToolbar
        activeBlockType={activeBlock?.type || null}
        activeBlockBold={activeBlock?.bold || false}
        activeBlockColor={activeBlock?.color}
        onChangeType={(type) => activeBlockId && updateBlock(activeBlockId, { type })}
        onToggleBold={() =>
          activeBlockId && updateBlock(activeBlockId, { bold: !activeBlock?.bold })
        }
        onChangeColor={(color) => activeBlockId && updateBlock(activeBlockId, { color })}
        onAddBlock={() => addBlock(activeBlockId || undefined)}
        onDeleteBlock={() => activeBlockId && deleteBlock(activeBlockId)}
        onMoveBlock={(dir) => activeBlockId && moveBlock(activeBlockId, dir)}
        canDelete={blocks.length > 1 && !!activeBlockId}
        canMoveUp={activeIndex > 0}
        canMoveDown={activeIndex >= 0 && activeIndex < blocks.length - 1}
      />

      <div ref={editorRef} className="p-4 space-y-0.5 min-h-[200px]">
        {blocks.length === 0 && placeholder && (
          <div className="text-gray-800 text-sm italic">{placeholder}</div>
        )}
        {blocks.map((block) => (
          <div key={block.id} data-block-id={block.id}>
            <EditableBlock
              block={block}
              isActive={activeBlockId === block.id}
              onChange={updateBlock}
              onFocus={(id) => setActiveBlockId(id)}
              onBlur={() => setTimeout(() => setActiveBlockId(null), 150)}
              onKeyDown={handleKeyDown}
              onConvertType={(id, type) => updateBlock(id, { type })}
            />
          </div>
        ))}
      </div>

      {/* Add block at bottom */}
      <div className="px-4 pb-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => addBlock(undefined, 'paragraph')}
          className="w-full py-3 border border-dashed border-gray-800 text-gray-700 hover:text-gray-400 hover:border-gray-600 rounded text-[11px] font-bold uppercase tracking-widest transition-all"
        >
          + Add Block
        </motion.button>
      </div>
    </div>
  )
}
