import '@testing-library/jest-dom';

if (!global.crypto) {
  Object.defineProperty(global, 'crypto', {
    value: {
      randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(2, 9),
    },
    writable: true,
  });
}
