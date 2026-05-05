import { useState, useCallback, useRef, useEffect } from 'react';
import type { RichTextBlock, BlockType } from '@app-types/richText';
import { BLOCK_TYPES } from '@constants/editor';
import { generateId } from '@shared/utils/id';
import EditableBlock from './EditableBlock';
import RichTextToolbar from './RichTextToolbar';
import BlockSideMenu from './BlockSideMenu';
import { motion } from 'framer-motion';

interface RichTextEditorProps {
  blocks: RichTextBlock[];
  onChange: (blocks: RichTextBlock[]) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  blocks,
  onChange,
  placeholder,
}: RichTextEditorProps) {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<{ id: string; type: 'type' | 'color' | null }>({
    id: '',
    type: null,
  });
  const editorRef = useRef<HTMLDivElement>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActiveIdRef = useRef<string | null>(null);

  const targetBlockId = activeBlockId || lastActiveIdRef.current;

  const activeBlock = blocks.find(b => b.id === targetBlockId) || null;
  const activeIndex = activeBlock ? blocks.findIndex(b => b.id === targetBlockId) : -1;

  const handleFocus = useCallback((id: string) => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setActiveBlockId(id);
    lastActiveIdRef.current = id;
  }, []);

  const handleBlur = useCallback(() => {
    blurTimeoutRef.current = setTimeout(() => {
      setActiveBlockId(null);
      setActiveMenu({ id: '', type: null });
    }, 200);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (activeMenu.type && editorRef.current && !editorRef.current.contains(e.target as Node)) {
        setActiveMenu({ id: '', type: null });
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    };
  }, [activeMenu.type]);

  const updateBlock = useCallback(
    (id: string, updates: Partial<RichTextBlock>) => {
      onChange(blocks.map(b => (b.id === id ? { ...b, ...updates } : b)));
    },
    [blocks, onChange]
  );

  const addBlock = useCallback(
    (afterId?: string, type: BlockType = 'paragraph') => {
      const newBlock: RichTextBlock = {
        id: generateId('block'),
        type,
        content: '',
      };
      if (!afterId) {
        onChange([...blocks, newBlock]);
      } else {
        const idx = blocks.findIndex(b => b.id === afterId);
        const newBlocks = [...blocks];
        newBlocks.splice(idx + 1, 0, newBlock);
        onChange(newBlocks);
      }
      setTimeout(() => setActiveBlockId(newBlock.id), 0);
    },
    [blocks, onChange]
  );

  const deleteBlock = useCallback(
    (id: string) => {
      if (blocks.length <= 1) return;
      const idx = blocks.findIndex(b => b.id === id);
      const newBlocks = blocks.filter(b => b.id !== id);
      onChange(newBlocks);
      const nextId = newBlocks[idx] ? newBlocks[idx].id : newBlocks[idx - 1]?.id;
      if (nextId) setActiveBlockId(nextId);
    },
    [blocks, onChange]
  );

  const moveBlock = useCallback(
    (id: string, direction: 'up' | 'down') => {
      const idx = blocks.findIndex(b => b.id === id);
      const newIndex = direction === 'up' ? idx - 1 : idx + 1;
      if (newIndex < 0 || newIndex >= blocks.length) return;
      const newBlocks = [...blocks];
      const [moved] = newBlocks.splice(idx, 1);
      newBlocks.splice(newIndex, 0, moved);
      onChange(newBlocks);
    },
    [blocks, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, id: string) => {
      const idx = blocks.findIndex(b => b.id === id);
      const block = blocks[idx];

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const type = block.type === 'bullet' ? 'bullet' : 'paragraph';
        addBlock(id, type);
        return;
      }

      if (e.key === 'Backspace' && block.content === '' && !block.rightContent) {
        e.preventDefault();
        if (blocks.length > 1) {
          deleteBlock(id);
        }
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        if (block.type === 'bullet') {
          updateBlock(id, { type: 'paragraph' });
        } else if (block.type === 'paragraph') {
          updateBlock(id, { type: 'bullet' });
        }
        return;
      }

      if (e.key === 'ArrowUp' && idx > 0) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const prevBlockEl = editorRef.current?.querySelector(
            `[data-block-id="${blocks[idx - 1].id}"]`
          );
          if (prevBlockEl) {
            const prevRect = prevBlockEl.getBoundingClientRect();
            if (rect.top <= prevRect.bottom + 5) {
              e.preventDefault();
              setActiveBlockId(blocks[idx - 1].id);
            }
          }
        }
      }

      if (e.key === 'ArrowDown' && idx < blocks.length - 1) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const nextBlockEl = editorRef.current?.querySelector(
            `[data-block-id="${blocks[idx + 1].id}"]`
          );
          if (nextBlockEl) {
            const nextRect = nextBlockEl.getBoundingClientRect();
            if (rect.bottom >= nextRect.top - 5) {
              e.preventDefault();
              setActiveBlockId(blocks[idx + 1].id);
            }
          }
        }
      }
    },
    [blocks, addBlock, deleteBlock, updateBlock]
  );

  useEffect(() => {
    if (blocks.length === 0) {
      const newBlock: RichTextBlock = {
        id: generateId('block'),
        type: 'h1',
        content: '',
      };
      onChange([newBlock]);
      setActiveBlockId(newBlock.id);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="border border-[rgba(0,0,0,0.1)] rounded-standard bg-white">
      <RichTextToolbar
        activeBlockType={activeBlock?.type || null}
        activeBlockBold={activeBlock?.bold || false}
        activeBlockColor={activeBlock?.color}
        onChangeType={type => targetBlockId && updateBlock(targetBlockId, { type })}
        onToggleBold={() =>
          targetBlockId && updateBlock(targetBlockId, { bold: !activeBlock?.bold })
        }
        onChangeColor={color => targetBlockId && updateBlock(targetBlockId, { color })}
        onAddBlock={() => addBlock(targetBlockId || undefined)}
        onDeleteBlock={() => targetBlockId && deleteBlock(targetBlockId)}
        onMoveBlock={dir => targetBlockId && moveBlock(targetBlockId, dir)}
        canDelete={blocks.length > 1 && !!targetBlockId}
        canMoveUp={activeIndex > 0}
        canMoveDown={activeIndex >= 0 && activeIndex < blocks.length - 1}
      />

      <div ref={editorRef} className="p-4 space-y-0.5 min-h-[150px]">
        {blocks.length === 0 && placeholder && (
          <div className="text-warm-300 text-sm italic">{placeholder}</div>
        )}
        {blocks.map(block => (
          <div key={block.id} data-block-id={block.id} className="group/block-row relative">
            <BlockSideMenu
              block={block}
              blocks={blocks}
              activeBlockId={activeBlockId}
              activeMenu={activeMenu}
              setActiveMenu={setActiveMenu}
              onUpdate={updateBlock}
              onAdd={addBlock}
              onDelete={deleteBlock}
              onMove={moveBlock}
              blockTypes={[...BLOCK_TYPES]}
            />

            <EditableBlock
              block={block}
              isActive={activeBlockId === block.id}
              onChange={updateBlock}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
            />
          </div>
        ))}
      </div>

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
  );
}
