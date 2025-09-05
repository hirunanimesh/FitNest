module.exports = {
  // Multi-project configuration for microservices
  projects: [
    {
      displayName: "Backend Services",
      testMatch: ["<rootDir>/backend/**/__tests__/**/*.test.js"],
      testEnvironment: "node",
      testTimeout: 30000,
      transform: {
        "^.+\\.jsx?$": "babel-jest"
      },
      // Mock environment variables for tests
      setupFilesAfterEnv: ["<rootDir>/test-setup.js"],
      collectCoverageFrom: [
        "backend/**/*.js",
        "!backend/**/node_modules/**",
        "!backend/**/__tests__/**",
        "!backend/**/jest.config.js"
      ]
    }
  ],
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  coverageReporters: ["text", "lcov", "html"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json", "node"],
  verbose: true
};