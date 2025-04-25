import type { Config } from "jest";

const baseConfig: Config = {
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js", "json"],
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
  moduleNameMapper: {
    "^@libs/(.*)$": "<rootDir>/libs/$1",
  },
};

export default baseConfig;
