export default {
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  moduleNameMapper: {
    '^@libs/(.*)$': '<rootDir>/libs/$1',
  },
  rootDir: './',
  testMatch: ['<rootDir>/libs/tests/**/*.test.ts', '<rootDir>/apps/**/src/**/tests/**/*.test.ts'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
