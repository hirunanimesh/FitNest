export default {
  preset: "default",
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
  transform: {}
};
