import { type RichTextBlock, type BlockType } from '../../types/richText'
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

interface BlockSideMenuProps {
  block: RichTextBlock
  blocks: RichTextBlock[]
  activeBlockId: string | null
  activeMenu: { id: string; type: 'type' | 'color' | null }
  setActiveMenu: (menu: { id: string; type: 'type' | 'color' | null }) => void
  onUpdate: (id: string, updates: Partial<RichTextBlock>) => void
  onAdd: (afterId?: string) => void
  onDelete: (id: string) => void
  onMove: (id: string, direction: 'up' | 'down') => void
  blockTypes: { type: BlockType; label: string }[]
}

export default function BlockSideMenu({
  block, blocks, activeBlockId, activeMenu, setActiveMenu,
  onUpdate, onAdd, onDelete, onMove, blockTypes,
}: BlockSideMenuProps) {
  return (
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
      {/* Type/Heading with Popover */}
      <div className="relative">
        <button
          onClick={() => setActiveMenu(
            activeMenu.id === block.id && activeMenu.type === 'type'
              ? { id: '', type: null }
              : { id: block.id, type: 'type' }
          )}
          className={clsx(
            "w-6 h-6 flex items-center justify-center rounded-micro transition-all",
            activeMenu.id === block.id && activeMenu.type === 'type'
              ? "bg-[rgba(0,117,222,0.1)] text-[#0075de]"
              : "text-warm-300 hover:text-[rgba(0,0,0,0.95)] hover:bg-[rgba(0,0,0,0.05)]"
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
              <div className="flex items-center gap-0.5">
                {blockTypes.map((bt) => (
                  <button
                    key={bt.type}
                    onClick={() => {
                      onUpdate(block.id, { type: bt.type })
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

              <div className="h-px bg-[rgba(0,0,0,0.08)]" />

              <div className="flex items-center gap-1.5">
                <FaPalette className="text-[9px] text-warm-400 shrink-0" />
                {COLORS.map((c) => (
                  <button
                    key={c.label}
                    onClick={() => {
                      onUpdate(block.id, { color: c.value || undefined })
                      setActiveMenu({ id: '', type: null })
                    }}
                    className={clsx(
                      'w-4 h-4 rounded-full border-2 transition-all',
                      (block.color || '') === c.value ? 'border-[#0075de] scale-110' : 'border-transparent hover:border-[rgba(0,0,0,0.2)]'
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

      {/* Bold */}
      <button
        onClick={() => onUpdate(block.id, { bold: !block.bold })}
        className={clsx(
          "w-6 h-6 flex items-center justify-center rounded-micro transition-all",
          block.bold ? "bg-[rgba(0,117,222,0.1)] text-[#0075de]" : "text-warm-300 hover:text-[rgba(0,0,0,0.95)] hover:bg-[rgba(0,0,0,0.05)]"
        )}
        title="Toggle Bold"
      >
        <FaBold className="text-[10px]" />
      </button>

      {/* Color */}
      <div className="relative">
        <button
          onClick={() => setActiveMenu(
            activeMenu.id === block.id && activeMenu.type === 'color'
              ? { id: '', type: null }
              : { id: block.id, type: 'color' }
          )}
          className={clsx(
            "w-6 h-6 flex items-center justify-center rounded-micro transition-all",
            (activeMenu.id === block.id && activeMenu.type === 'color') || block.color
              ? "bg-[rgba(0,117,222,0.1)] text-[#0075de]"
              : "text-warm-300 hover:text-[rgba(0,0,0,0.95)] hover:bg-[rgba(0,0,0,0.05)]"
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
                    onUpdate(block.id, { color: c.value || undefined })
                    setActiveMenu({ id: '', type: null })
                  }}
                  className={clsx(
                    'w-4 h-4 rounded-full border-2 transition-all',
                    (block.color || '') === c.value ? 'border-[#0075de] scale-110' : 'border-transparent hover:border-[rgba(0,0,0,0.2)]'
                  )}
                  style={{ backgroundColor: c.value || '#e0dfdd' }}
                  title={c.label}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Block */}
      <button
        onClick={() => onAdd(block.id)}
        className="w-6 h-6 flex items-center justify-center rounded-micro text-warm-300 hover:text-[rgba(0,0,0,0.95)] hover:bg-[rgba(0,0,0,0.05)] transition-all"
        title="Add Block Below"
      >
        <FaPlus className="text-[10px]" />
      </button>

      {/* Move Up/Down */}
      <button
        onClick={() => onMove(block.id, 'up')}
        className="w-6 h-6 flex items-center justify-center rounded-micro text-warm-300 hover:text-[rgba(0,0,0,0.95)] hover:bg-[rgba(0,0,0,0.05)] transition-all disabled:opacity-20"
        title="Move Up"
        disabled={blocks.indexOf(block) === 0}
      >
        <FaArrowUp className="text-[10px]" />
      </button>
      <button
        onClick={() => onMove(block.id, 'down')}
        className="w-6 h-6 flex items-center justify-center rounded-micro text-warm-300 hover:text-[rgba(0,0,0,0.95)] hover:bg-[rgba(0,0,0,0.05)] transition-all disabled:opacity-20"
        title="Move Down"
        disabled={blocks.indexOf(block) === blocks.length - 1}
      >
        <FaArrowDown className="text-[10px]" />
      </button>

      {/* Delete */}
      {blocks.length > 1 && (
        <button
          onClick={() => onDelete(block.id)}
          className="w-6 h-6 flex items-center justify-center rounded-micro text-warm-300 hover:text-[#dd5b00] hover:bg-[rgba(221,91,0,0.08)] transition-all"
          title="Delete Block"
        >
          <FaTrash className="text-[10px]" />
        </button>
      )}
    </motion.div>
  )
}
