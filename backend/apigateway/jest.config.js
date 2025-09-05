module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node'],
  testTimeout: 30000,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.js',
    'index.js',
    '!**/node_modules/**',
    '!**/__tests__/**'
  ],
  // Setup for different test types
  testPathIgnorePatterns: ['/node_modules/'],
  verbose: true
};