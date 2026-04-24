/// <reference types="vite/client" />

export const config = {
  appName: 'Smart Resume',
  apiUrl: '',
  features: {
    enableTemplates: true,
    enableProfile: true,
    enableExport: true,
  }
} as const
