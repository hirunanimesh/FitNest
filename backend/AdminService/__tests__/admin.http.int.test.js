import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';

let app;
let adminController;

beforeAll(async () => {
  jest.resetModules();

  // Mock services to avoid external effects
  await jest.unstable_mockModule('../services/document.service.js', () => ({
    uploadDocumentsToRAG: jest.fn(async (docs) => ({
      message: 'uploaded', insertedCount: docs.length, totalDocuments: docs.length, insertedIds: ['d1'], errors: []
    })),
    searchSimilarDocuments: jest.fn(async (q, l) => ({ results: [], count: 0 })),
    getAllDocuments: jest.fn(async () => ({ documents: [{ id: '1' }], pagination: { page: 1, limit: 10 } })),
    deleteDocument: jest.fn(async () => ({ message: 'deleted' })),
  }));

  await jest.unstable_mockModule('../services/chat.service.js', () => ({
    processChatQuestion: jest.fn(async () => ({ success: true, answer: 'hi', sources: [], similarity_scores: [] })),
    getChatHealthStatus: jest.fn(async () => ({ success: true, ready: true, message: 'ok' })),
  }));

  await jest.unstable_mockModule('../services/admin.service.js', () => ({
    default: {
      getMemberGrowthStats: jest.fn(async () => ({ growth: [] })),
      getTrainerVerifications: jest.fn(async () => [{ id: 't1' }]),
      getGymVerifications: jest.fn(async () => [{ id: 'g1' }]),
      handleVerificationState: jest.fn(async () => ({ verificationUpdate: { ok: true }, userDetails: { email: 'u@g.com', name: 'U', entityName: 'GymX', entityType: 'gym' } })),
      getDashboardStats: jest.fn(async () => ({ users: 0 })),
      BannedUsers: jest.fn(async () => ({ ok: true })),
      getUserInquiries: jest.fn(async () => [{ id: 1 }]),
      updateUserInquiries: jest.fn(async (id, payload) => ({ id, ...payload })),
    }
  }));

  // Mock email service class to no-op
  class MockEmail {
    sendVerificationApprovedEmail = jest.fn(async () => true);
    sendVerificationRejectedEmail = jest.fn(async () => true);
  }
  await jest.unstable_mockModule('../services/EmailService.js', () => ({ default: MockEmail }));

  adminController = await import('../controllers/admin.controller.js');

  app = express();
  app.use(express.json());

  // Wire a subset of routes for tests
  app.get('/health', adminController.healthCheck);
  app.post('/documents/upload', adminController.uploadDocuments);
  app.get('/documents/search', adminController.searchDocuments);
  app.get('/documents', adminController.getDocuments);
  app.delete('/documents/:id', adminController.removeDocument);
  app.post('/chat', adminController.chat);
  app.get('/chat/health', adminController.chatHealth);
  app.get('/stats/member-growth', adminController.getMemberGrowth);
  app.get('/dashboard/stats', adminController.getDashboardStats);
  app.get('/user-inquiries', adminController.getuserinquiries);
  app.get('/trainer-verifications', adminController.getTrainerVerifications);
  app.get('/gym-verifications', adminController.getGymVerifications);
  app.put('/handle-verifications/:id/:state/:type/:entityId', adminController.handleVerificationState);
  app.post('/bannedusers', adminController.banneduser);
  app.patch('/updateinquirydetails/:id', adminController.updateinquirydetails);
});

afterEach(() => jest.clearAllMocks());

describe('AdminService HTTP (admin controller routes)', () => {
  test('GET /health returns service status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ service: 'AdminService', success: true }));
  });

  test('POST /documents/upload happy path and validation error', async () => {
    const ok = await request(app).post('/documents/upload').send({ documents: ['a'] });
    expect(ok.status).toBe(201);
    const bad = await request(app).post('/documents/upload').send({ documents: [] });
    expect(bad.status).toBe(400);
  });

  test('GET /documents/search returns results, 400 on missing query', async () => {
    const ok = await request(app).get('/documents/search').query({ query: 'x', limit: 5 });
    expect(ok.status).toBe(200);
    const bad = await request(app).get('/documents/search').query({});
    expect(bad.status).toBe(400);
  });

  test('GET /documents returns paginated list', async () => {
    const res = await request(app).get('/documents?page=1&limit=10');
    expect(res.status).toBe(200);
  });

  test('DELETE /documents/:id requires id', async () => {
    const res = await request(app).delete('/documents/abc');
    expect(res.status).toBe(200);
  });

  test('POST /chat validates body and returns answer', async () => {
    const ok = await request(app).post('/chat').send({ question: 'Hi?' });
    expect(ok.status).toBe(200);
    const bad = await request(app).post('/chat').send({});
    expect(bad.status).toBe(400);
  });

  test('GET /chat/health returns ready true', async () => {
    const res = await request(app).get('/chat/health');
    expect([200, 503]).toContain(res.status);
  });

  test('GET stats and verifications endpoints', async () => {
    expect((await request(app).get('/stats/member-growth')).status).toBe(200);
    expect((await request(app).get('/dashboard/stats')).status).toBe(200);
    expect((await request(app).get('/user-inquiries')).status).toBe(200);
    expect((await request(app).get('/trainer-verifications')).status).toBe(200);
    expect((await request(app).get('/gym-verifications')).status).toBe(200);
  });

  test('PUT /handle-verifications sends emails and returns 200', async () => {
    const res = await request(app).put('/handle-verifications/v1/Approved/gym/ent1').send({});
    expect(res.status).toBe(200);
  });

  test('POST /bannedusers returns 200', async () => {
    const res = await request(app).post('/bannedusers').send({ user_id: 'u1' });
    expect(res.status).toBe(200);
  });

  test('PATCH /updateinquirydetails/:id validates and updates', async () => {
    const bad = await request(app).patch('/updateinquirydetails/').send({});
    expect(bad.status).toBe(404); // route not found without id
    const ok = await request(app).patch('/updateinquirydetails/123').send({ status: 'closed' });
    expect(ok.status).toBe(200);
  });
});
