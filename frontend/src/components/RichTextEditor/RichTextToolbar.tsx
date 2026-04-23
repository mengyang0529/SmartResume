import type { BlockType } from '../../types/richText'
import {
  FaBold,
  FaPlus,
  FaTrash,
  FaArrowUp,
  FaArrowDown,
} from 'react-icons/fa'
import clsx from 'clsx'

interface RichTextToolbarProps {
  activeBlockType: BlockType | null
  activeBlockBold: boolean
  activeBlockColor: string | undefined
  onChangeType: (type: BlockType) => void
  onToggleBold: () => void
  onChangeColor: (color: string) => void
  onAddBlock: () => void
  onDeleteBlock: () => void
  onMoveBlock: (dir: 'up' | 'down') => void
  canDelete: boolean
  canMoveUp: boolean
  canMoveDown: boolean
}

const blockTypes: { type: BlockType; label: string }[] = [
  { type: 'h1', label: 'H1' },
  { type: 'h2', label: 'H2' },
  { type: 'h3', label: 'H3' },
  { type: 'bullet', label: '•' },
  { type: 'paragraph', label: '¶' },
]

const colors = [
  { label: 'Default', value: undefined },
  { label: 'Red', value: '#DC3522' },
  { label: 'Sky', value: '#0395DE' },
  { label: 'Emerald', value: '#00A388' },
  { label: 'Orange', value: '#FF6138' },
  { label: 'White', value: '#ffffff' },
]

export default function RichTextToolbar({
  activeBlockType,
  activeBlockBold,
  activeBlockColor,
  onChangeType,
  onToggleBold,
  onChangeColor,
  onAddBlock,
  onDeleteBlock,
  onMoveBlock,
  canDelete,
  canMoveUp,
  canMoveDown,
}: RichTextToolbarProps) {
  return (
    <div className="bg-[#26262c] border-b border-gray-700/50 px-4 py-3 flex flex-wrap items-center gap-2 transition-all duration-300">
      {/* Block type selector */}
      <div className="flex items-center gap-1 bg-[#32323a] rounded p-1">
        {blockTypes.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => onChangeType(type)}
            className={clsx(
              'px-3 py-1.5 rounded text-[11px] font-bold transition-all',
              activeBlockType === type
                ? 'bg-red-600 text-gray-300'
                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
            )}
            title={`Convert to ${type}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-gray-800" />

      {/* Formatting */}
      <button
        onClick={onToggleBold}
        className={clsx(
          'w-8 h-8 flex items-center justify-center rounded transition-all',
          activeBlockBold
            ? 'bg-red-600/20 text-red-500'
            : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
        )}
        title="Bold"
      >
        <FaBold className="text-[10px]" />
      </button>

      {/* Color picker */}
      <div className="flex items-center gap-1">
        {colors.map((c) => (
          <button
            key={c.label}
            onClick={() => onChangeColor(c.value || '')}
            className={clsx(
              'w-5 h-5 rounded-full border-2 transition-all',
              activeBlockColor === c.value
                ? 'border-white scale-110'
                : 'border-transparent hover:border-gray-500'
            )}
            style={{ backgroundColor: c.value || '#444444' }}
            title={c.label}
          />
        ))}
      </div>

      <div className="w-px h-6 bg-gray-800" />

      {/* Block operations */}
      <button
        onClick={onAddBlock}
        className="w-8 h-8 flex items-center justify-center rounded text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-all"
        title="Add block below"
      >
        <FaPlus className="text-[10px]" />
      </button>
      <button
        onClick={() => onMoveBlock('up')}
        disabled={!canMoveUp}
        className="w-8 h-8 flex items-center justify-center rounded text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        title="Move up"
      >
        <FaArrowUp className="text-[10px]" />
      </button>
      <button
        onClick={() => onMoveBlock('down')}
        disabled={!canMoveDown}
        className="w-8 h-8 flex items-center justify-center rounded text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        title="Move down"
      >
        <FaArrowDown className="text-[10px]" />
      </button>
      <button
        onClick={onDeleteBlock}
        disabled={!canDelete}
        className="w-8 h-8 flex items-center justify-center rounded text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        title="Delete block"
      >
        <FaTrash className="text-[10px]" />
      </button>
    </div>
  )
}
