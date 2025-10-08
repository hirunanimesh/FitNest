import { jest } from '@jest/globals';

let sessionController;
let sessionService;

beforeAll(async () => {
  jest.resetModules();
  await jest.unstable_mockModule('../kafka/Producer.js', () => ({
    TrainerSessionCreateProducer: jest.fn()
  }));
  await jest.unstable_mockModule('../services/session.service.js', () => ({
    addsession: jest.fn(),
    getallsessions: jest.fn(),
    getsessionbysessionid: jest.fn(),
    getallsessionbytrainerid: jest.fn(),
    updatesession: jest.fn(),
    deletesession: jest.fn(),
  }));

  sessionController = await import('../controllers/session.controller.js');
  sessionService = await import('../services/session.service.js');
});

describe('SessionController negative and error-path tests', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = { params: {}, body: {} };
    mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    jest.clearAllMocks();
  });

  test('addSession - service error returns 500', async () => {
    mockReq.body = { foo: 'bar' };
    sessionService.addsession.mockRejectedValue(new Error('insert fail'));
    await sessionController.addSession(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  test('getAllSession - returns 200 when sessions (edge case array empty handled earlier)', async () => {
    const sessions = [{ session_id: 's1' }];
    sessionService.getallsessions.mockResolvedValue(sessions);
    await sessionController.getAllSession(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test('getAllSession - service error returns 500', async () => {
    sessionService.getallsessions.mockRejectedValue(new Error('read fail'));
    await sessionController.getAllSession(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  test('getSessionBySessionId - returns 404 when not found', async () => {
    mockReq.params.sessionId = 's1';
    sessionService.getsessionbysessionid.mockResolvedValue(null);
    await sessionController.getSessionBySessionId(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(404);
  });

  test('getSessionBySessionId - service error returns 500', async () => {
    mockReq.params.sessionId = 's1';
    sessionService.getsessionbysessionid.mockRejectedValue(new Error('db'));
    await sessionController.getSessionBySessionId(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  test('getallSessionByTrainerId - returns 404 when none', async () => {
    mockReq.params.trainerId = '1';
    sessionService.getallsessionbytrainerid.mockResolvedValue({ sessions: null, totalCount: 0 });
    await sessionController.getallSessionByTrainerId(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(404);
  });

  test('getallSessionByTrainerId - service error returns 500', async () => {
    mockReq.params.trainerId = '1';
    sessionService.getallsessionbytrainerid.mockRejectedValue(new Error('fail'));
    await sessionController.getallSessionByTrainerId(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  test('updatedSession - returns 404 when not found', async () => {
    mockReq.params.sessionId = 's1';
    mockReq.body = { booked: true };
    sessionService.updatesession.mockResolvedValue(null);
    await sessionController.updatedSession(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(404);
  });

  test('updatedSession - service error returns 500', async () => {
    mockReq.params.sessionId = 's1';
    sessionService.updatesession.mockRejectedValue(new Error('update fail'));
    await sessionController.updatedSession(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  test('deleteSession - returns 404 when not found', async () => {
    mockReq.params.sessionId = 's1';
    sessionService.deletesession.mockResolvedValue(null);
    await sessionController.deleteSession(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(404);
  });

  test('deleteSession - service error returns 500', async () => {
    mockReq.params.sessionId = 's1';
    sessionService.deletesession.mockRejectedValue(new Error('delete fail'));
    await sessionController.deleteSession(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });
});
