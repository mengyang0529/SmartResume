import { useState } from 'react';
import type { BlockType } from '@app-types/richText';
import { BLOCK_TYPES, EDITOR_COLORS } from '@constants/editor';
import { FaBold, FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaPalette } from 'react-icons/fa';
import clsx from 'clsx';

interface RichTextToolbarProps {
  activeBlockType: BlockType | null;
  activeBlockBold: boolean;
  activeBlockColor: string | undefined;
  onChangeType: (type: BlockType) => void;
  onToggleBold: () => void;
  onChangeColor: (color: string) => void;
  onAddBlock: () => void;
  onDeleteBlock: () => void;
  onMoveBlock: (dir: 'up' | 'down') => void;
  canDelete: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

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
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <div className="bg-[#f6f5f4] border-b border-[rgba(0,0,0,0.1)] px-4 py-2.5 flex flex-wrap items-center gap-2">
      {/* Block type selector */}
      <div className="flex items-center gap-0.5 bg-white border border-[rgba(0,0,0,0.1)] rounded-md p-0.5">
        {BLOCK_TYPES.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => onChangeType(type)}
            className={clsx(
              'px-2.5 py-1 rounded text-xs font-medium transition-all',
              activeBlockType === type
                ? 'bg-[#0075de] text-white'
                : 'text-warm-400 hover:text-[rgba(0,0,0,0.95)] hover:bg-[rgba(0,0,0,0.04)]'
            )}
            title={`Convert to ${type}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-[rgba(0,0,0,0.1)]" />

      {/* Bold */}
      <button
        onClick={onToggleBold}
        className={clsx(
          'w-7 h-7 flex items-center justify-center rounded-md transition-all',
          activeBlockBold
            ? 'bg-[rgba(0,117,222,0.1)] text-[#0075de]'
            : 'text-warm-400 hover:text-[rgba(0,0,0,0.95)] hover:bg-[rgba(0,0,0,0.04)]'
        )}
        title="Bold"
      >
        <FaBold className="text-xs" />
      </button>

      {/* Color picker - single button */}
      <div className="relative">
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className={clsx(
            'w-7 h-7 flex items-center justify-center rounded-md transition-all',
            showColorPicker || activeBlockColor
              ? 'bg-[rgba(0,117,222,0.1)] text-[#0075de]'
              : 'text-warm-400 hover:text-[rgba(0,0,0,0.95)] hover:bg-[rgba(0,0,0,0.04)]'
          )}
          title="Text color"
        >
          <FaPalette className="text-xs" />
        </button>

        {showColorPicker && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowColorPicker(false)} />
            <div className="absolute top-8 left-0 z-50 flex items-center gap-1.5 bg-white border border-[rgba(0,0,0,0.1)] rounded-lg shadow-deep p-2">
              {EDITOR_COLORS.map(c => (
                <button
                  key={c.label}
                  onClick={() => {
                    onChangeColor(c.value || '');
                    setShowColorPicker(false);
                  }}
                  className={clsx(
                    'w-5 h-5 rounded-full border-2 transition-all',
                    activeBlockColor === (c.value || undefined)
                      ? 'border-[#0075de] scale-110'
                      : 'border-transparent hover:border-[rgba(0,0,0,0.2)]'
                  )}
                  style={{ backgroundColor: c.value || '#e0dfdd' }}
                  title={c.label}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="w-px h-5 bg-[rgba(0,0,0,0.1)]" />

      {/* Block operations */}
      <button
        onClick={onAddBlock}
        className="w-7 h-7 flex items-center justify-center rounded-md text-warm-400 hover:text-[rgba(0,0,0,0.95)] hover:bg-[rgba(0,0,0,0.04)] transition-all"
        title="Add block below"
      >
        <FaPlus className="text-xs" />
      </button>
      <button
        onClick={() => onMoveBlock('up')}
        disabled={!canMoveUp}
        className="w-7 h-7 flex items-center justify-center rounded-md text-warm-400 hover:text-[rgba(0,0,0,0.95)] hover:bg-[rgba(0,0,0,0.04)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        title="Move up"
      >
        <FaArrowUp className="text-xs" />
      </button>
      <button
        onClick={() => onMoveBlock('down')}
        disabled={!canMoveDown}
        className="w-7 h-7 flex items-center justify-center rounded-md text-warm-400 hover:text-[rgba(0,0,0,0.95)] hover:bg-[rgba(0,0,0,0.04)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        title="Move down"
      >
        <FaArrowDown className="text-xs" />
      </button>
      <button
        onClick={onDeleteBlock}
        disabled={!canDelete}
        className="w-7 h-7 flex items-center justify-center rounded-md text-warm-400 hover:text-[#dd5b00] hover:bg-[rgba(221,91,0,0.08)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        title="Delete block"
      >
        <FaTrash className="text-xs" />
      </button>
    </div>
  );
}
