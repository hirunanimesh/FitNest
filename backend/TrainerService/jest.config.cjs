module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  transform: {
    '^.+\\.js$': ['babel-jest', { presets: [['@babel/preset-env', { targets: { node: 'current' }, modules: false }]] }],
  },
  setupFilesAfterEnv: ['<rootDir>/test-setup.js'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.js$',
  moduleFileExtensions: ['js', 'json', 'node'],
  // Force Jest to use Node's ESM resolver where needed
  resolver: undefined,
};
