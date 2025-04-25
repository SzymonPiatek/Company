import tseslint from 'typescript-eslint';

export default [
  ...tseslint.config({
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'error',
      'no-console': 'off',
    },
  }),
  {
    ignores: ['node_modules', 'dist', 'build', 'coverage'],
  },
];
