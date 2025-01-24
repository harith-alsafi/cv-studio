import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true, // Makes `describe`, `it`, etc. available globally
    environment: 'node', // Required for DOM-related libraries like pdfjs
    coverage: {
      provider: 'v8', // Optional: Enables test coverage
      reporter: ['text', 'json', 'html'], // Output formats
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Adjust 'src' if needed
    },
  },
});
