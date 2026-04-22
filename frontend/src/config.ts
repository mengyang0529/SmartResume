/// <reference types="vite/client" />

// Application configuration
export const config = {
  // Application name
  appName: 'SmartResume',

  // Base API URL (from environment or default)
  // In dev with Vite proxy, use empty string so /api routes go through proxy
  apiUrl: import.meta.env.VITE_API_URL || '',

  // Feature flags
  features: {
    enableTemplates: true,
    enableProfile: true,
    enableExport: true,
  }
} as const