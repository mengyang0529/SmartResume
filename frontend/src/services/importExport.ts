import localforage from 'localforage'
import { ResumeData } from '../types/resume'

export const importExportService = {
  async exportAll(): Promise<string> {
    const keys = await localforage.keys()
    const dump: Record<string, any> = {}
    for (const key of keys) {
      dump[key] = await localforage.getItem(key)
    }
    return JSON.stringify(dump, null, 2)
  },

  downloadJson(data: ResumeData, filename = 'resume-backup.json') {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  },

  async importFromJsonFile(): Promise<ResumeData | null> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.onchange = async (e: Event) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) { resolve(null); return }
        try {
          const text = await file.text()
          const data = JSON.parse(text) as ResumeData
          resolve(data)
        } catch (err) { reject(err) }
      }
      input.click()
    })
  },

  async importBackup(jsonString: string): Promise<void> {
    const dump = JSON.parse(jsonString)
    for (const [key, value] of Object.entries(dump)) {
      await localforage.setItem(key, value)
    }
  },
}
