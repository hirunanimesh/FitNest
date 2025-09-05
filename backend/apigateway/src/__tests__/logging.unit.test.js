const loggingMiddleware = require('../middleware/logging');

describe('Logging Middleware Unit Tests', () => {
  let mockReq, mockRes, mockNext, consoleSpy;

  beforeEach(() => {
    // Mock request object
    mockReq = {
      method: 'GET',
      url: '/test-path'
    };

    // Mock response object
    mockRes = {};

    // Mock next function
    mockNext = jest.fn();

    // Spy on console.log
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    // Restore console.log
    consoleSpy.mockRestore();
  });

  test('should call next() function', () => {
    loggingMiddleware(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  test('should log request method and URL', () => {
    loggingMiddleware(mockReq, mockRes, mockNext);
    
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const logCall = consoleSpy.mock.calls[0][0];
    expect(logCall).toContain('[API Gateway]');
    expect(logCall).toContain('GET');
    expect(logCall).toContain('/test-path');
  });

  test('should log with timestamp', () => {
    const mockDate = new Date('2023-01-01T12:00:00.000Z');
    const dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(mockDate.getTime());
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    
    loggingMiddleware(mockReq, mockRes, mockNext);
    
    const logCall = consoleSpy.mock.calls[0][0];
    expect(logCall).toContain('2023-01-01T12:00:00.000Z');
    
    dateNowSpy.mockRestore();
  });

  test('should handle POST requests', () => {
    mockReq.method = 'POST';
    mockReq.url = '/api/test';
    
    loggingMiddleware(mockReq, mockRes, mockNext);
    
    const logCall = consoleSpy.mock.calls[0][0];
    expect(logCall).toContain('POST');
    expect(logCall).toContain('/api/test');
    expect(mockNext).toHaveBeenCalled();
  });

  test('should handle different URL paths', () => {
    const testCases = [
      { method: 'GET', url: '/' },
      { method: 'POST', url: '/api/auth/login' },
      { method: 'PUT', url: '/api/user/profile' },
      { method: 'DELETE', url: '/api/gym/1' }
    ];

    testCases.forEach((testCase, index) => {
      mockReq.method = testCase.method;
      mockReq.url = testCase.url;
      
      loggingMiddleware(mockReq, mockRes, mockNext);
      
      const logCall = consoleSpy.mock.calls[index][0];
      expect(logCall).toContain(testCase.method);
      expect(logCall).toContain(testCase.url);
    });

    expect(mockNext).toHaveBeenCalledTimes(testCases.length);
  });

  test('should not modify request or response objects', () => {
    const originalReq = { ...mockReq };
    const originalRes = { ...mockRes };
    
    loggingMiddleware(mockReq, mockRes, mockNext);
    
    expect(mockReq).toEqual(originalReq);
    expect(mockRes).toEqual(originalRes);
  });

  test('should work with missing properties gracefully', () => {
    mockReq = {}; // Empty request object
    
    expect(() => {
      loggingMiddleware(mockReq, mockRes, mockNext);
    }).not.toThrow();
    
    expect(mockNext).toHaveBeenCalled();
  });
});
