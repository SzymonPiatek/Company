export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  testMatch: ['**/src/models/**/tests/**/*.test.ts'],
};
