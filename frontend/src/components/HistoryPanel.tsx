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
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#26262c] border border-gray-700/50 rounded-lg w-[480px] max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/30">
          <div className="flex items-center space-x-3">
            <FaHistory className="text-red-500 text-sm" />
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-300">Time Machine</span>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-red-500 transition-colors">
            <FaTimes />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
          {snapshots.length === 0 && (
            <p className="text-gray-600 text-[11px] font-mono text-center py-12">
              No history snapshots yet. Snapshots are created automatically after successful compilation.
            </p>
          )}
          {[...snapshots].reverse().map((snap: HistorySnapshot) => (
            <div key={snap.id} className="flex items-center justify-between bg-[#3a3a44] p-4 rounded group hover:border-red-600/30 border border-transparent transition-all">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono text-gray-500">
                  {new Date(snap.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleRestore(snap.id)}
                  className="p-2 text-gray-500 hover:text-emerald-500 transition-colors"
                  title="Restore this version"
                >
                  <FaUndo className="text-xs" />
                </button>
                <button
                  onClick={() => handleDelete(snap.id)}
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors"
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
