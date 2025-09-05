module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.unit.test.js'],
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node'],
  testTimeout: 30000,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'model/**/*.js',
    'config/**/*.js',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!server.js',
    '!superbaseClient.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/test-setup.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  verbose: true,
  clearMocks: true
};