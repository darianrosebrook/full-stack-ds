const coverageFloors = require("../../coverage-floors.json").packages.angular;

module.exports = {
  preset: "jest-preset-angular",
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/src/**/__tests__/**/*.test.ts"],
  setupFiles: ["<rootDir>/jest.setup.cjs"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.afterenv.cjs"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  coverageProvider: "v8",
  collectCoverageFrom: ["<rootDir>/src/**/*.ts"],
  coverageDirectory: "<rootDir>/tmp/coverage-angular",
  coverageReporters: ["text", "json-summary"],
  coverageThreshold: {
    global: {
      statements: coverageFloors.statements,
      branches: coverageFloors.branches,
      functions: coverageFloors.functions,
      lines: coverageFloors.lines,
    },
  },
};
