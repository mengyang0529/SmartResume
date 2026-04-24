import { useState, useEffect } from 'react'
import { FaHistory, FaUndo, FaTrash, FaTimes } from 'react-icons/fa'
import { historyService } from '../services/historyService'
import type { ResumeData } from '../types/resume'

interface HistorySnapshot {
  id: string
  data: ResumeData
  timestamp: string
}

interface Props {
  open: boolean
  onClose: () => void
  onRestore: (data: ResumeData) => void
}

export default function HistoryPanel({ open, onClose, onRestore }: Props) {
  const [snapshots, setSnapshots] = useState<HistorySnapshot[]>([])

  useEffect(() => {
    if (open) historyService.listSnapshots().then(setSnapshots)
  }, [open])

  const handleRestore = async (id: string) => {
    const snap = await historyService.restoreSnapshot(id)
    if (snap) {
      onRestore(snap.data)
      onClose()
    }
  }

  const handleDelete = async (id: string) => {
    await historyService.deleteSnapshot(id)
    setSnapshots(prev => prev.filter(s => s.id !== id))
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40">
      <div className="card w-[480px] max-h-[80vh] flex flex-col p-0 overflow-hidden shadow-deep">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-3">
            <FaHistory className="text-[#0075de] text-sm" />
            <span className="text-caption font-semibold text-[rgba(0,0,0,0.95)]">Time Machine</span>
          </div>
          <button onClick={onClose} className="text-warm-300 hover:text-[rgba(0,0,0,0.95)] transition-colors">
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {snapshots.length === 0 && (
            <p className="text-caption-light text-warm-500 text-center py-12">
              No history snapshots yet. Snapshots are created automatically after successful compilation.
            </p>
          )}
          {[...snapshots].reverse().map((snap) => (
            <div
              key={snap.id}
              className="flex items-center justify-between p-4 rounded-standard hover:bg-[rgba(0,0,0,0.03)] group border border-transparent hover:border-[rgba(0,0,0,0.1)] transition-all"
            >
              <p className="text-caption text-warm-500">
                {new Date(snap.timestamp).toLocaleString()}
              </p>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleRestore(snap.id)}
                  className="p-2 text-warm-300 hover:text-[#2a9d99] transition-colors rounded-micro hover:bg-[rgba(42,157,153,0.08)]"
                  title="Restore this version"
                >
                  <FaUndo className="text-xs" />
                </button>
                <button
                  onClick={() => handleDelete(snap.id)}
                  className="p-2 text-warm-300 hover:text-[#dd5b00] transition-colors rounded-micro hover:bg-[rgba(221,91,0,0.08)]"
                  title="Delete snapshot"
                >
                  <FaTrash className="text-xs" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
