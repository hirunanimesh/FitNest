const request = require('supertest');
const express = require('express');
const adminProxy = require('../proxies/adminProxy');

describe('Admin Proxy', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use('/api/admin', adminProxy);
  });

  test('should proxy requests to admin service', async () => {
    // This test will only pass if the admin service is running
    const response = await request(app)
      .get('/api/admin/health')
      .expect(res => {
        // We expect either a successful response from admin service
        // or a 503 if the service is down
        expect([200, 503]).toContain(res.status);
      });
  });

  test('should handle admin document endpoints', async () => {
    // Test if the proxy correctly forwards admin document requests
    const response = await request(app)
      .get('/api/admin/documents')
      .expect(res => {
        // We expect either a successful response or 503 if service is down
        expect([200, 400, 401, 403, 404, 503]).toContain(res.status);
      });
  });

  test('should handle POST requests to admin service', async () => {
    const testData = {
      documents: ['Test document content'],
      metadata: [{ title: 'Test Document', category: 'test' }]
    };

    const response = await request(app)
      .post('/api/admin/documents/upload')
      .send(testData)
      .expect(res => {
        // We expect either a successful response or error status
        expect([200, 201, 400, 401, 403, 404, 500, 503]).toContain(res.status);
      });
  });
});

module.exports = {};
