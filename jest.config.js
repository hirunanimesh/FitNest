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
    ,
    {
      displayName: "TrainerService Tests",
      testMatch: [
        "<rootDir>/backend/TrainerService/**/__tests__/**/*.unit.test.js",
        "<rootDir>/backend/TrainerService/**/__tests__/**/*.test.js",
        "<rootDir>/backend/TrainerService/**/__tests__/**/*.js"
      ],
      testEnvironment: "node",
      testTimeout: 30000,
      setupFilesAfterEnv: ["<rootDir>/backend/TrainerService/test-setup.js"],
      // Run as native ESM to support jest.unstable_mockModule in these tests
      transform: undefined,
  resolver: undefined,
      collectCoverageFrom: [
        "backend/TrainerService/**/*.js",
        "!backend/TrainerService/**/node_modules/**",
        "!backend/TrainerService/**/__tests__/**"
      ]
    }
    ,
    {
      displayName: "UserService Tests",
      testMatch: ["<rootDir>/backend/UserService/**/__tests__/**/*.unit.test.js", "<rootDir>/backend/UserService/**/__tests__/**/*.test.js", "<rootDir>/backend/UserService/**/__tests__/**/*.js"],
      testEnvironment: "node",
      testTimeout: 30000,
  setupFiles: ["<rootDir>/backend/UserService/test-setup.js"],
      collectCoverageFrom: [
        "backend/UserService/**/*.js",
        "!backend/UserService/**/node_modules/**",
        "!backend/UserService/**/__tests__/**"
      ]
    }
    ,
    {
      displayName: "GymService Tests",
      testMatch: [
        "<rootDir>/backend/GymService/**/__tests__/**/*.unit.test.js",
        "<rootDir>/backend/GymService/**/__tests__/**/*.test.js",
        "<rootDir>/backend/GymService/**/__tests__/**/*.js"
      ],
      testEnvironment: "node",
      testTimeout: 30000,
      setupFilesAfterEnv: ["<rootDir>/backend/GymService/test-setup.js"],
      transform: {
        "^.+\\.jsx?$": "babel-jest"
      },
      collectCoverageFrom: [
        "backend/GymService/**/*.js",
        "!backend/GymService/**/node_modules/**",
        "!backend/GymService/**/__tests__/**"
      ]
    },
    {
      displayName: "PaymentService Tests",
      testMatch: [
        "<rootDir>/backend/PaymentService/**/__tests__/**/*.unit.test.js",
        "<rootDir>/backend/PaymentService/**/__tests__/**/*.test.js",
        "<rootDir>/backend/PaymentService/**/__tests__/**/*.js"
      ],
      testEnvironment: "node",
      testTimeout: 30000,
      setupFilesAfterEnv: ["<rootDir>/backend/PaymentService/test-setup.js"],
      transform: {
        "^.+\\.jsx?$": "babel-jest"
      },
      collectCoverageFrom: [
        "backend/PaymentService/**/*.js",
        "!backend/PaymentService/**/node_modules/**",
        "!backend/PaymentService/**/__tests__/**"
      ]
    },
    {
      displayName: "AdminService Tests",
      testMatch: [
        "<rootDir>/backend/AdminService/**/__tests__/**/*.unit.test.js",
        "<rootDir>/backend/AdminService/**/__tests__/**/*.test.js",
        "<rootDir>/backend/AdminService/**/__tests__/**/*.js"
      ],
      testEnvironment: "node",
      testTimeout: 30000,
      setupFilesAfterEnv: ["<rootDir>/backend/AdminService/test-setup.js"],
      // Run as native ESM to support jest.unstable_mockModule and ESM imports
      transform: undefined,
      resolver: undefined,
      collectCoverageFrom: [
        "backend/AdminService/**/*.js",
        "!backend/AdminService/**/node_modules/**",
        "!backend/AdminService/**/__tests__/**"
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