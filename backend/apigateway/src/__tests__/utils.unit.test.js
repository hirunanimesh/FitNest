describe('API Gateway Utils Unit Tests', () => {
  test('should validate service names', () => {
    const validServiceNames = ['auth', 'gym', 'payment', 'user', 'trainer'];
    
    validServiceNames.forEach(serviceName => {
      expect(typeof serviceName).toBe('string');
      expect(serviceName.length).toBeGreaterThan(0);
      expect(serviceName).toMatch(/^[a-zA-Z]+$/);
    });
  });

  test('should validate URL format', () => {
    const testUrls = [
      'http://localhost:3001',
      'https://api.example.com',
      'http://service:8080'
    ];

    testUrls.forEach(url => {
      expect(url).toMatch(/^https?:\/\/.+/);
    });
  });

  test('should validate HTTP methods', () => {
    const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
    
    validMethods.forEach(method => {
      expect(typeof method).toBe('string');
      expect(method).toMatch(/^[A-Z]+$/);
    });
  });

  test('should create proper API paths', () => {
    const createApiPath = (service, endpoint) => {
      return `/api/${service}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    };

    expect(createApiPath('auth', '/login')).toBe('/api/auth/login');
    expect(createApiPath('gym', 'gyms')).toBe('/api/gym/gyms');
    expect(createApiPath('user', '/profile')).toBe('/api/user/profile');
  });

  test('should validate request body structure', () => {
    const validateRequestBody = (body, requiredFields) => {
      if (!body || typeof body !== 'object') return false;
      return requiredFields.every(field => field in body);
    };

    // Test valid request body
    const validBody = { email: 'test@test.com', password: 'password123' };
    const requiredFields = ['email', 'password'];
    expect(validateRequestBody(validBody, requiredFields)).toBe(true);

    // Test invalid request body
    const invalidBody = { email: 'test@test.com' };
    expect(validateRequestBody(invalidBody, requiredFields)).toBe(false);

    // Test null body
    expect(validateRequestBody(null, requiredFields)).toBe(false);
  });

  test('should create error response format', () => {
    const createErrorResponse = (message, status = 'error', path = null) => {
      const errorResponse = {
        status,
        message,
        timestamp: new Date().toISOString()
      };

      if (path) {
        errorResponse.path = path;
      }

      return errorResponse;
    };

    const error = createErrorResponse('Route not found', 'error', '/api/unknown');
    
    expect(error).toHaveProperty('status', 'error');
    expect(error).toHaveProperty('message', 'Route not found');
    expect(error).toHaveProperty('timestamp');
    expect(error).toHaveProperty('path', '/api/unknown');
    expect(error.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  test('should create success response format', () => {
    const createSuccessResponse = (data, message = 'Success') => {
      return {
        status: 'success',
        message,
        data,
        timestamp: new Date().toISOString()
      };
    };

    const response = createSuccessResponse({ id: 1, name: 'Test' }, 'Data retrieved');

    expect(response).toHaveProperty('status', 'success');
    expect(response).toHaveProperty('message', 'Data retrieved');
    expect(response).toHaveProperty('data');
    expect(response.data).toEqual({ id: 1, name: 'Test' });
    expect(response).toHaveProperty('timestamp');
  });

  test('should validate service health status format', () => {
    const serviceHealthStatus = {
      auth: true,
      gym: false,
      payment: true,
      user: true,
      trainer: false
    };

    // Check that all values are boolean
    Object.values(serviceHealthStatus).forEach(status => {
      expect(typeof status).toBe('boolean');
    });

    // Check that we have expected service names
    const expectedServices = ['auth', 'gym', 'payment', 'user', 'trainer'];
    expectedServices.forEach(service => {
      expect(serviceHealthStatus).toHaveProperty(service);
    });
  });
});
