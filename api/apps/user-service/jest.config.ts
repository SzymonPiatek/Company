import base from '../../jest.config.base';

export default {
  ...base,
  rootDir: '../../',
  testMatch: ['<rootDir>/apps/user-service/src/**/tests/**/*.test.ts'],
};
