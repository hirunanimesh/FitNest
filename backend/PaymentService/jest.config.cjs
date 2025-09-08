module.exports = {
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
  transform: {
    "^.+\\.js$": "babel-jest"
  },
  globals: {
    'babel-jest': {
      useESM: true
    }
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  transformIgnorePatterns: [
    "node_modules/(?!(supertest)/)"
  ]
};