import localforage from 'localforage'
import { ResumeData } from '../types/resume'

const HISTORY_KEY = 'resume_history'
const MAX_SNAPSHOTS = 20

interface ResumeSnapshot {
  id: string
  data: ResumeData
  timestamp: string
}

export const historyService = {
  async saveSnapshot(data: ResumeData): Promise<void> {
    const snapshots = await localforage.getItem<ResumeSnapshot[]>(HISTORY_KEY) ?? []
    snapshots.push({
      id: crypto.randomUUID?.() ?? `${Date.now()}`,
      data: JSON.parse(JSON.stringify(data)),
      timestamp: new Date().toISOString(),
    })
    while (snapshots.length > MAX_SNAPSHOTS) snapshots.shift()
    await localforage.setItem(HISTORY_KEY, snapshots)
  },

  async listSnapshots(): Promise<ResumeSnapshot[]> {
    return (await localforage.getItem<ResumeSnapshot[]>(HISTORY_KEY)) ?? []
  },

  async restoreSnapshot(id: string): Promise<ResumeSnapshot | null> {
    const snapshots = await localforage.getItem<ResumeSnapshot[]>(HISTORY_KEY) ?? []
    return snapshots.find(s => s.id === id) ?? null
  },

  async deleteSnapshot(id: string): Promise<void> {
    const snapshots = (await localforage.getItem<ResumeSnapshot[]>(HISTORY_KEY)) ?? []
    await localforage.setItem(HISTORY_KEY, snapshots.filter(s => s.id !== id))
  },

  async clearAll(): Promise<void> {
    await localforage.removeItem(HISTORY_KEY)
  },
}
