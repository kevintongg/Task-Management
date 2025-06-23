import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    // Enable jsdom environment for React components
    environment: 'jsdom',

    // Setup files to run before each test
    setupFiles: ['./src/test/setup.ts'],

    // Global test configuration
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.config.js',
        '**/*.config.ts',
        'dist/',
        'build/',
        'coverage/',
        '**/*.d.ts',
        'src/main.jsx',
        'src/App.jsx',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },

    // Test file patterns
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}', 'tests/**/*.{test,spec}.{js,jsx,ts,tsx}'],

    // Exclude patterns
    exclude: ['node_modules', 'dist', 'build', '.git', '.cache'],

    // Watch options
    watchExclude: ['node_modules/**', 'dist/**', 'build/**'],

    // Timeout settings
    testTimeout: 10000,
    hookTimeout: 10000,

    // Reporter configuration
    reporter: ['verbose', 'json', 'html'],

    // Pool options for parallel testing
    pool: 'threads',
    poolOptions: {
      threads: {
        minThreads: 1,
        maxThreads: 4,
      },
    },

    // Mock configuration
    clearMocks: true,
    restoreMocks: true,

    // Define global variables for tests
    define: {
      __TEST__: true,
    },
  },

  // Resolve configuration for tests
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/pages': resolve(__dirname, './src/pages'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/hooks': resolve(__dirname, './src/hooks'),
      '@/styles': resolve(__dirname, './src/styles'),
      '@/test': resolve(__dirname, './src/test'),
    },
  },
})
