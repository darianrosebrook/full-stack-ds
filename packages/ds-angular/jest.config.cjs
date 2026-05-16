module.exports = {
  preset: "jest-preset-angular",
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/src/**/__tests__/**/*.test.ts"],
  setupFiles: ["<rootDir>/jest.setup.cjs"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.afterenv.cjs"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
