import { jest } from '@jest/globals';

let sessionController;
let sessionService;

beforeAll(async () => {
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

describe('SessionController Unit Tests', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = { params: {}, body: {} };
    mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    jest.clearAllMocks();
  });

  test('addSession success', async () => {
    mockReq.body = { foo: 'bar' };
    const created = { session_id: 's1' };
    sessionService.addsession.mockResolvedValue(created);

    await sessionController.addSession(mockReq, mockRes);

    expect(sessionService.addsession).toHaveBeenCalledWith(mockReq.body);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Trainer session created successfully', session: created });
  });

  test('getAllSession returns 404 when none', async () => {
    sessionService.getallsessions.mockResolvedValue([]);
    await sessionController.getAllSession(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(404);
  });

  test('getAllSession returns 200 when sessions', async () => {
    const sessions = [{ session_id: 's1' }];
    sessionService.getallsessions.mockResolvedValue(sessions);
    await sessionController.getAllSession(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Trainer session retrieved successfully', sessions });
  });

  test('getSessionBySessionId found', async () => {
    mockReq.params.sessionId = 's1';
    const s = [{ session_id: 's1' }];
    sessionService.getsessionbysessionid.mockResolvedValue(s);
    await sessionController.getSessionBySessionId(mockReq, mockRes);
    expect(sessionService.getsessionbysessionid).toHaveBeenCalledWith('s1');
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test('getallSessionByTrainerId returns sessions', async () => {
    mockReq.params.trainerId = '1';
    sessionService.getallsessionbytrainerid.mockResolvedValue({ sessions: [{ session_id: 's1' }], totalCount: 1 });
    await sessionController.getallSessionByTrainerId(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test('updatedSession success', async () => {
    mockReq.params.sessionId = 's1';
    mockReq.body = { booked: true };
    sessionService.updatesession.mockResolvedValue({ session_id: 's1' });
    await sessionController.updatedSession(mockReq, mockRes);
    expect(sessionService.updatesession).toHaveBeenCalledWith('s1', mockReq.body);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test('deleteSession success', async () => {
    mockReq.params.sessionId = 's1';
    sessionService.deletesession.mockResolvedValue({ session_id: 's1' });
    await sessionController.deleteSession(mockReq, mockRes);
    expect(sessionService.deletesession).toHaveBeenCalledWith('s1');
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});
