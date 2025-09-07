module.exports = {
  testEnvironment: 'node',
  // When Jest is run with this config, rootDir will be the repo root; keep patterns relative to the package
  testMatch: ['<rootDir>/backend/UserService/__tests__/**/*.js', '<rootDir>/backend/UserService/__tests__/**/*.test.js', '<rootDir>/backend/UserService/__tests__/**/*.unit.test.js'],
  testTimeout: 30000,
};
