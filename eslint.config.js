import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig } from 'eslint-define-config'

export default defineConfig([
  {
    ignores: ['dist', '**/dist/**'],
  },
  // Frontend configuration (browser environment)
  {
    files: ['**/*.{js,jsx}'],
    excludes: ['netlify/functions/**'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  // Netlify Functions configuration (Node.js environment)
  {
    files: ['netlify/functions/**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
        process: 'readonly',
      },
      sourceType: 'module',
    },
    env: {
      node: true,
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])