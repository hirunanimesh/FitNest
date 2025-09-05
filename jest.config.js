module.exports = {
  // Multi-project configuration for microservices
  projects: [
    {
      displayName: "API Gateway Tests",
      testMatch: ["<rootDir>/backend/apigateway/**/__tests__/**/*.test.js"],
      testEnvironment: "node",
      testTimeout: 30000,
      transform: {
        "^.+\\.jsx?$": "babel-jest"
      },
      setupFilesAfterEnv: ["<rootDir>/test-setup.js"],
      collectCoverageFrom: [
        "backend/apigateway/**/*.js",
        "!backend/apigateway/**/node_modules/**",
        "!backend/apigateway/**/__tests__/**"
      ]
    },
    {
      displayName: "AuthService Tests", 
      testMatch: ["<rootDir>/backend/AuthService/**/__tests__/**/*.unit.test.js"],
      testEnvironment: "node",
      testTimeout: 30000,
      setupFilesAfterEnv: ["<rootDir>/backend/AuthService/test-setup.js"],
      collectCoverageFrom: [
        "backend/AuthService/**/*.js",
        "!backend/AuthService/**/node_modules/**", 
        "!backend/AuthService/**/__tests__/**",
        "!backend/AuthService/server.js",
        "!backend/AuthService/superbaseClient.js"
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