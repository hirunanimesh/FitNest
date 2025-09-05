// Test setup file for AuthService
// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.CLOUDINARY_CLOUD_NAME = 'test_cloud';
process.env.CLOUDINARY_API_KEY = '123456789';
process.env.CLOUDINARY_API_SECRET = 'test_secret';
process.env.FRONTEND_URL = 'http://localhost:3001';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

// Global test utilities
global.createMockRequest = (overrides = {}) => ({
  body: {},
  headers: {},
  params: {},
  query: {},
  file: null,
  ...overrides
});

global.createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};
