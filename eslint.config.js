import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'
import importPlugin from 'eslint-plugin-import'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external', // 1. Third party
            'internal', // 2. @ imports (via pathGroups)
            ['parent', 'sibling'], // 3. Relative imports (../ or ./)
            'index', // 4. CSS, images, SVGs (via pathGroups)
            'type', // 5. Types
          ],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: '*.{css,scss,sass,less}',
              group: 'index',
              position: 'before',
            },
            {
              pattern: '*.{png,jpg,jpeg,gif,webp}',
              group: 'index',
              position: 'before',
            },
            {
              pattern: '*.{svg}',
              group: 'index',
              position: 'before',
            },
            {
              pattern: '**/*.types',
              group: 'type',
            },
            {
              pattern: '**/*.type',
              group: 'type',
            },
            {
              pattern: '**/types/**',
              group: 'type',
            },
          ],
          pathGroupsExcludedImportTypes: ['type'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
])
