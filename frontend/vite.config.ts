import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      "@utils": path.resolve(__dirname, './src/utils'),
      "@hooks": path.resolve(__dirname, './src/hooks'),
      "@app-types": path.resolve(__dirname, './src/types'),
      "@data/sampleResume": path.resolve(__dirname, './src/data/sampleResume.ts'),
      "@data": path.resolve(__dirname, './src/data'),
      "@constants": path.resolve(__dirname, './src/constants'),
      },  },
  server: {
    port: 3000,
    host: true,
  },
  preview: {
    port: 3000,
  },
  worker: {
    format: 'es',
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts',
      ],
    },
  },
})
