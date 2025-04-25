import base from "./jest.config.base";

export default {
  ...base,
  rootDir: "./",
  testMatch: ["<rootDir>/libs/tests/**/*.test.ts"],
};
