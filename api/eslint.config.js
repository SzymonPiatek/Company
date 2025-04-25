// eslint.config.js
const config = async () => {
  const tsPlugin = await import('@typescript-eslint/eslint-plugin');
  const tsParser = await import('@typescript-eslint/parser');

  return [
    {
      files: ['**/*.ts'],
      languageOptions: {
        parser: tsParser.default,
        parserOptions: {
          ecmaVersion: 'latest',
          sourceType: 'module',
        },
      },
      plugins: {
        '@typescript-eslint': tsPlugin.default,
      },
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      },
    },
    {
      ignores: ['node_modules', 'dist', 'build', 'coverage'],
    },
  ];
};

export default config();
