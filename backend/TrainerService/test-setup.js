// Test setup file for TrainerService
process.env.NODE_ENV = 'test';

// Mock environment vars if needed
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test_key';

global.console = {
  ...console,
  log: () => {},
  error: () => {},
  warn: () => {},
  info: () => {},
};

global.createMockRequest = (overrides = {}) => ({
  body: {},
  headers: {},
  params: {},
  query: {},
  file: null,
  ...overrides,
});

global.createMockResponse = () => {
  const res = {};
  const makeMock = () => {
    if (typeof jest !== 'undefined' && typeof jest.fn === 'function') {
      return jest.fn().mockReturnValue(res);
    }
    // fallback simple mock that returns res
    const f = () => res;
    f.mockReturnValue = () => f;
    return f;
  };

  res.status = makeMock();
  res.json = makeMock();
  res.cookie = makeMock();
  res.send = makeMock();
  return res;
};
