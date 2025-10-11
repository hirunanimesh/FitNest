export default {
  testEnvironment: "node",
  collectCoverage: true,
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/coverage/"
  ],
  testMatch: [
    "**/__tests__/**/*.test.js"
  ],
  verbose: true,
  setupFilesAfterEnv: [
    "<rootDir>/test-setup.js"
  ],
  transform: {
    "^.+\\.js$": "babel-jest"
  }
};
