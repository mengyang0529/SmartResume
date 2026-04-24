import { useState, useCallback, useRef, useEffect } from 'react'
import type { RichTextBlock, BlockType } from '../../types/richText'
import EditableBlock from './EditableBlock'
import RichTextToolbar from './RichTextToolbar'
import { motion, AnimatePresence } from 'framer-motion'
import { FaPlus, FaTrash, FaBold, FaHeading, FaArrowUp, FaArrowDown, FaPalette } from 'react-icons/fa'
import clsx from 'clsx'

const COLORS = [
  { label: 'Default', value: '' },
  { label: 'Red', value: '#DC3522' },
  { label: 'Sky', value: '#0395DE' },
  { label: 'Emerald', value: '#00A388' },
  { label: 'Orange', value: '#FF6138' },
  { label: 'White', value: '#ffffff' },
]

interface RichTextEditorProps {
  blocks: RichTextBlock[]
  onChange: (blocks: RichTextBlock[]) => void
  placeholder?: string
  headingColor?: string
}

export default function RichTextEditor({ blocks, onChange, placeholder, headingColor }: RichTextEditorProps) {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null)
  const [activeMenu, setActiveMenu] = useState<{ id: string, type: 'type' | 'color' | null }>({ id: '', type: null })
  const editorRef = useRef<HTMLDivElement>(null)
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastActiveIdRef = useRef<string | null>(null)

  const targetBlockId = activeBlockId || lastActiveIdRef.current

  const activeBlock = blocks.find((b) => b.id === targetBlockId) || null
  const activeIndex = activeBlock ? blocks.findIndex((b) => b.id === targetBlockId) : -1

  const handleFocus = useCallback((id: string) => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
      blurTimeoutRef.current = null
    }
    setActiveBlockId(id)
    lastActiveIdRef.current = id
  }, [])

  const handleBlur = useCallback(() => {
    blurTimeoutRef.current = setTimeout(() => {
      setActiveBlockId(null)
      setActiveMenu({ id: '', type: null })
    }, 200)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (activeMenu.type && editorRef.current && !editorRef.current.contains(e.target as Node)) {
        setActiveMenu({ id: '', type: null })
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current)
    }
  }, [activeMenu.type])

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

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        const type = block.type === 'bullet' ? 'bullet' : 'paragraph'
        addBlock(id, type)
        return
      }

      if (e.key === 'Backspace' && block.content === '' && !block.rightContent) {
        e.preventDefault()
        if (blocks.length > 1) {
          deleteBlock(id)
        }
        return
      }

      if (e.key === 'Tab') {
        e.preventDefault()
        if (block.type === 'bullet') {
          updateBlock(id, { type: 'paragraph' })
        } else if (block.type === 'paragraph') {
          updateBlock(id, { type: 'bullet' })
        }
        return
      }

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

  const blockTypes: { type: BlockType; label: string }[] = [
    { type: 'h1', label: 'H1' },
    { type: 'h2', label: 'H2' },
    { type: 'h3', label: 'H3' },
    { type: 'paragraph', label: 'P' },
    { type: 'bullet', label: 'L' },
  ]

  return (
    <div className="border border-[rgba(0,0,0,0.1)] rounded-standard bg-white">
      <RichTextToolbar
        activeBlockType={activeBlock?.type || null}
        activeBlockBold={activeBlock?.bold || false}
        activeBlockColor={activeBlock?.color}
        onChangeType={(type) => targetBlockId && updateBlock(targetBlockId, { type })}
        onToggleBold={() =>
          targetBlockId && updateBlock(targetBlockId, { bold: !activeBlock?.bold })
        }
        onChangeColor={(color) => targetBlockId && updateBlock(targetBlockId, { color })}
        onAddBlock={() => addBlock(targetBlockId || undefined)}
        onDeleteBlock={() => targetBlockId && deleteBlock(targetBlockId)}
        onMoveBlock={(dir) => targetBlockId && moveBlock(targetBlockId, dir)}
        canDelete={blocks.length > 1 && !!targetBlockId}
        canMoveUp={activeIndex > 0}
        canMoveDown={activeIndex >= 0 && activeIndex < blocks.length - 1}
      />

      <div ref={editorRef} className="p-4 space-y-0.5 min-h-[150px]">
        {blocks.length === 0 && placeholder && (
          <div className="text-warm-300 text-sm italic">{placeholder}</div>
        )}
        {blocks.map((block) => (
          <div key={block.id} data-block-id={block.id} className="group/block-row relative">
            {/* Side Action Menu */}
            <motion.div
              initial={{ opacity: 0, x: -5 }}
              animate={(activeBlockId === block.id || blocks.length === 1) ? { opacity: 1, x: 0 } : { opacity: 0, x: -5 }}
              transition={{ duration: 0.2 }}
              className={clsx(
                "absolute -left-10 top-0 flex flex-col items-center gap-1 z-10 py-1",
                "pointer-events-none group-hover/block-row:pointer-events-auto group-hover/block-row:opacity-100",
                (activeBlockId === block.id || blocks.length === 1) && "pointer-events-auto opacity-100"
              )}
            >
              {/* 1. Type/Heading with Popover */}
              <div className="relative">
                <button
                  onClick={() => setActiveMenu(prev =>
                    prev.id === block.id && prev.type === 'type' ? { id: '', type: null } : { id: block.id, type: 'type' }
                  )}
                  className={clsx(
                    "w-6 h-6 flex items-center justify-center rounded-micro transition-all",
                    activeMenu.id === block.id && activeMenu.type === 'type' ? "bg-[rgba(0,117,222,0.1)] text-[#0075de]" : "text-warm-300 hover:text-[rgba(0,0,0,0.95)] hover:bg-[rgba(0,0,0,0.05)]"
                  )}
                  title="Select Type"
                >
                  <FaHeading className="text-[10px]" />
                </button>

                <AnimatePresence>
                  {activeMenu.id === block.id && activeMenu.type === 'type' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, x: -10 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9, x: -10 }}
                      className="absolute left-8 top-0 flex flex-col bg-white border border-[rgba(0,0,0,0.1)] rounded-standard shadow-deep p-1.5 gap-1.5 z-50 min-w-[140px]"
                    >
                      {/* Type selector */}
                      <div className="flex items-center gap-0.5">
                        {blockTypes.map((bt) => (
                          <button
                            key={bt.type}
                            onClick={() => {
                              updateBlock(block.id, { type: bt.type })
                              setActiveMenu({ id: '', type: null })
                            }}
                            className={clsx(
                              "px-2 py-1 rounded-micro text-[10px] font-bold transition-all",
                              block.type === bt.type ? "bg-[#0075de] text-white" : "text-warm-400 hover:bg-[rgba(0,0,0,0.05)] hover:text-[rgba(0,0,0,0.95)]"
                            )}
                          >
                            {bt.label}
                          </button>
                        ))}
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-[rgba(0,0,0,0.08)]" />

                      {/* Color palette */}
                      <div className="flex items-center gap-1.5">
                        <FaPalette className="text-[9px] text-warm-400 shrink-0" />
                        {COLORS.map((c) => (
                          <button
                            key={c.label}
                            onClick={() => {
                              updateBlock(block.id, { color: c.value || undefined })
                              setActiveMenu({ id: '', type: null })
                            }}
                            className={clsx(
                              'w-4 h-4 rounded-full border-2 transition-all',
                              (block.color || '') === c.value
                                ? 'border-[#0075de] scale-110'
                                : 'border-transparent hover:border-[rgba(0,0,0,0.2)]'
                            )}
                            style={{ backgroundColor: c.value || '#e0dfdd' }}
                            title={c.label}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 2. Bold */}
              <button
                onClick={() => updateBlock(block.id, { bold: !block.bold })}
                className={clsx(
                  "w-6 h-6 flex items-center justify-center rounded-micro transition-all",
                  block.bold ? "bg-[rgba(0,117,222,0.1)] text-[#0075de]" : "text-warm-300 hover:text-[rgba(0,0,0,0.95)] hover:bg-[rgba(0,0,0,0.05)]"
                )}
                title="Toggle Bold"
              >
                <FaBold className="text-[10px]" />
              </button>

              {/* 3. Color */}
              <div className="relative">
                <button
                  onClick={() => setActiveMenu(prev =>
                    prev.id === block.id && prev.type === 'color' ? { id: '', type: null } : { id: block.id, type: 'color' }
                  )}
                  className={clsx(
                    "w-6 h-6 flex items-center justify-center rounded-micro transition-all",
                    activeMenu.id === block.id && activeMenu.type === 'color' || block.color ? "bg-[rgba(0,117,222,0.1)] text-[#0075de]" : "text-warm-300 hover:text-[rgba(0,0,0,0.95)] hover:bg-[rgba(0,0,0,0.05)]"
                  )}
                  title="Text Color"
                >
                  <FaPalette className="text-[10px]" />
                </button>

                <AnimatePresence>
                  {activeMenu.id === block.id && activeMenu.type === 'color' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, x: -10 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9, x: -10 }}
                      className="absolute left-8 top-0 flex items-center gap-1.5 bg-white border border-[rgba(0,0,0,0.1)] rounded-standard shadow-deep p-1.5 z-50"
                    >
                      {COLORS.map((c) => (
                        <button
                          key={c.label}
                          onClick={() => {
                            updateBlock(block.id, { color: c.value || undefined })
                            setActiveMenu({ id: '', type: null })
                          }}
                          className={clsx(
                            'w-4 h-4 rounded-full border-2 transition-all',
                            (block.color || '') === c.value
                              ? 'border-[#0075de] scale-110'
                              : 'border-transparent hover:border-[rgba(0,0,0,0.2)]'
                          )}
                          style={{ backgroundColor: c.value || '#e0dfdd' }}
                          title={c.label}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 4. Add Block */}
              <button
                onClick={() => addBlock(block.id)}
                className="w-6 h-6 flex items-center justify-center rounded-micro text-warm-300 hover:text-[rgba(0,0,0,0.95)] hover:bg-[rgba(0,0,0,0.05)] transition-all"
                title="Add Block Below"
              >
                <FaPlus className="text-[10px]" />
              </button>

              {/* 5. Move Up/Down */}
              <button
                onClick={() => moveBlock(block.id, 'up')}
                className="w-6 h-6 flex items-center justify-center rounded-micro text-warm-300 hover:text-[rgba(0,0,0,0.95)] hover:bg-[rgba(0,0,0,0.05)] transition-all disabled:opacity-20"
                title="Move Up"
                disabled={blocks.indexOf(block) === 0}
              >
                <FaArrowUp className="text-[10px]" />
              </button>
              <button
                onClick={() => moveBlock(block.id, 'down')}
                className="w-6 h-6 flex items-center justify-center rounded-micro text-warm-300 hover:text-[rgba(0,0,0,0.95)] hover:bg-[rgba(0,0,0,0.05)] transition-all disabled:opacity-20"
                title="Move Down"
                disabled={blocks.indexOf(block) === blocks.length - 1}
              >
                <FaArrowDown className="text-[10px]" />
              </button>

              {/* 6. Delete */}
              {blocks.length > 1 && (
                <button
                  onClick={() => deleteBlock(block.id)}
                  className="w-6 h-6 flex items-center justify-center rounded-micro text-warm-300 hover:text-[#dd5b00] hover:bg-[rgba(221,91,0,0.08)] transition-all"
                  title="Delete Block"
                >
                  <FaTrash className="text-[10px]" />
                </button>
              )}
            </motion.div>

            <EditableBlock
              block={block}
              isActive={activeBlockId === block.id}
              onChange={updateBlock}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onConvertType={(id, type) => updateBlock(id, { type })}
              headingColor={headingColor}
            />
          </div>
        ))}
      </div>

      {/* Add block at bottom */}
      <div className="px-4 pb-4">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => addBlock(undefined, 'paragraph')}
          className="w-full py-3 border border-dashed border-[rgba(0,0,0,0.15)] text-warm-300 hover:text-[#0075de] hover:border-[#0075de] rounded-standard text-caption font-semibold transition-all"
        >
          + Add Block
        </motion.button>
      </div>
    </div>
  )
}
