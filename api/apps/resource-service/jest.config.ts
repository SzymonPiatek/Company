import base from '../../jest.config.base';

export default {
  ...base,
  rootDir: '../../',
  testMatch: ['<rootDir>/apps/resource-service/src/**/tests/**/*.test.ts'],
};
