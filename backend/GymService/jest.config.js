module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/backend/GymService/__tests__'],
  testMatch: ['**/*.test.js'],
  moduleFileExtensions: ['js', 'json', 'node'],
  coverageDirectory: '<rootDir>/backend/GymService/coverage',
  collectCoverage: true,
  collectCoverageFrom: ['**/*.js'],
};