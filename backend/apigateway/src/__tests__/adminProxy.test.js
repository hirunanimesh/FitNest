jest.mock('../utils/serviceHealth', () => ({
  serviceHealth: { auth: true, gym: true, payment: true, user: true, trainer: true, admin: true },
  startHealthChecks: jest.fn()
}));

const request = require('supertest');
const nock = require('nock');
const config = require('../config');
const app = require('../../index');

describe('Admin Proxy', () => {
  afterEach(() => nock.cleanAll());

  test('should proxy requests to admin service (health)', async () => {
    const scope = nock(config.services.admin)
      .get(/\/health$/)
      .reply(200, { status: 'ok' });

    const res = await request(app).get('/api/admin/health').expect(200);
    expect(res.body).toMatchObject({ status: 'ok' });
    expect(scope.isDone()).toBe(true);
  });

  test('should handle admin document endpoints (list)', async () => {
    const scope = nock(config.services.admin)
      .get(/\/documents$/)
      .reply(200, { documents: [] });

    const res = await request(app).get('/api/admin/documents').expect(200);
    expect(res.body).toMatchObject({ documents: [] });
    expect(scope.isDone()).toBe(true);
  });

  test('should handle POST requests to admin service (upload)', async () => {
    const testData = {
      documents: ['Test document content'],
      metadata: [{ title: 'Test Document', category: 'test' }]
    };

    const scope = nock(config.services.admin)
      .post(/\/documents\/upload$/)
      .reply(201, { uploaded: 1 });

    const res = await request(app)
      .post('/api/admin/documents/upload')
      .send(testData)
      .expect(201);
    expect(res.body).toMatchObject({ uploaded: 1 });
    expect(scope.isDone()).toBe(true);
  });

  test('returns 503 when admin service is unavailable', async () => {
    nock(config.services.admin).get(/.*/).reply(503, { error: 'down' });
    const res = await request(app).get('/api/admin/health').expect(503);
    expect(res.body).toBeDefined();
  });
});

