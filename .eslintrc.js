export default [
  {
    ignores: ['node_modules/**', 'coverage/**', 'drizzle/**'],
  },
  {
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
    },
  },
];
