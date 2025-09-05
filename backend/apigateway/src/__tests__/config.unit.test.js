const config = require('../config/index');

describe('Config Module Unit Tests', () => {
  // Store original env vars
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules(); // Clear module cache
    process.env = { ...originalEnv }; // Reset env vars
  });

  afterAll(() => {
    process.env = originalEnv; // Restore env vars
  });

  test('should return default port when PORT is not set', () => {
    delete process.env.PORT;
    const config = require('../config/index');
    expect(config.port).toBe(3000);
  });

  test('should return custom port when PORT is set', () => {
    process.env.PORT = '4000';
    const config = require('../config/index');
    expect(config.port).toBe('4000');
  });

  test('should return default frontend URL when FRONTEND_URL is not set', () => {
    delete process.env.FRONTEND_URL;
    const config = require('../config/index');
    expect(config.frontend.url).toBe('http://localhost:3010');
  });

  test('should return custom frontend URL when FRONTEND_URL is set', () => {
    process.env.FRONTEND_URL = 'https://myapp.com';
    const config = require('../config/index');
    expect(config.frontend.url).toBe('https://myapp.com');
  });

  test('should have all required service URLs with defaults', () => {
    const config = require('../config/index');
    expect(config.services).toHaveProperty('auth');
    expect(config.services).toHaveProperty('gym');
    expect(config.services).toHaveProperty('payment');
    expect(config.services).toHaveProperty('user');
    expect(config.services).toHaveProperty('trainer');
    
    expect(config.services.auth).toBe('http://localhost:3001');
    expect(config.services.gym).toBe('http://localhost:3002');
    expect(config.services.payment).toBe('http://localhost:3003');
    expect(config.services.user).toBe('http://localhost:3004');
    expect(config.services.trainer).toBe('http://localhost:3005');
  });

  test('should override service URLs with environment variables', () => {
    process.env.AUTH_SERVICE_URL = 'https://auth.myapp.com';
    process.env.GYM_SERVICE_URL = 'https://gym.myapp.com';
    
    // Need to require again after setting env vars
    delete require.cache[require.resolve('../config/index')];
    const config = require('../config/index');
    
    expect(config.services.auth).toBe('https://auth.myapp.com');
    expect(config.services.gym).toBe('https://gym.myapp.com');
  });

  test('should have correct CORS configuration', () => {
    const config = require('../config/index');
    expect(config.cors).toHaveProperty('origin');
    expect(config.cors).toHaveProperty('credentials', true);
    expect(config.cors).toHaveProperty('methods');
    expect(config.cors).toHaveProperty('allowedHeaders');
    
    expect(config.cors.methods).toContain('GET');
    expect(config.cors.methods).toContain('POST');
    expect(config.cors.methods).toContain('PUT');
    expect(config.cors.methods).toContain('DELETE');
    expect(config.cors.methods).toContain('PATCH');
    
    expect(config.cors.allowedHeaders).toContain('Content-Type');
    expect(config.cors.allowedHeaders).toContain('Authorization');
    expect(config.cors.allowedHeaders).toContain('Cookie');
  });

  test('should set CORS origin from FRONTEND_URL', () => {
    process.env.FRONTEND_URL = 'https://frontend.myapp.com';
    
    delete require.cache[require.resolve('../config/index')];
    const config = require('../config/index');
    
    expect(config.cors.origin).toBe('https://frontend.myapp.com');
  });
});
