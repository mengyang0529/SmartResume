import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock crypto.randomUUID for testing environment
if (!global.crypto) {
  Object.defineProperty(global, 'crypto', {
    value: {
      randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(2, 9),
    },
  })
}
