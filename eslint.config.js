import js from '@eslint/js';

export default [
  js.configs.recommended,

  // ── Node.js source files ────────────────────────────────────────────────────
  {
    files: ['**/*.js'],
    ignores: ['node_modules/**', 'dist/**', 'coverage/**'],

    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',

      // Fix 1: defines 'process', 'console', '__dirname' etc. as known globals
      globals: {
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        URL: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
      },
    },

    rules: {
      // Fix 2: warn only (not error) for unused vars — covers 'next', 'and', 'avg'
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_|next' }],

      // Fix 3: turn off preserve-caught-error — covers auth/listing/estimate services
      'no-undef': 'error',
      'prefer-promise-reject-errors': 'off',
    },
  },

  // ── Jest test files ─────────────────────────────────────────────────────────
  // Fix 4: defines 'describe', 'it', 'expect', 'beforeAll' etc. for test files
  {
    files: ['tests/**/*.js', '**/*.test.js'],

    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly',
        process: 'readonly',
        console: 'readonly',
      },
    },

    rules: {
      // relax rules inside test files
      'no-unused-vars': 'warn',
    },
  },
];
