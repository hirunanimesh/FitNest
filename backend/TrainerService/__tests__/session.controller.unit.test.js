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

describe('SessionController Unit Tests (unit)', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = { params: {}, body: {}, query: {} };
    mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    jest.clearAllMocks();
  });

  test('addSession - success', async () => {
    mockReq.body = { foo: 'bar' };
    const created = { session_id: 's1' };
    sessionService.addsession.mockResolvedValue(created);

    await sessionController.addSession(mockReq, mockRes);

    expect(sessionService.addsession).toHaveBeenCalledWith(mockReq.body);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Trainer session created successfully', session: created });
  });

  test('addSession - service error returns 500', async () => {
    mockReq.body = {};
    sessionService.addsession.mockRejectedValue(new Error('insert fail'));

    await sessionController.addSession(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Internal server error' }));
  });

  test('getAllSession - returns 404 when none', async () => {
    sessionService.getallsessions.mockResolvedValue([]);
    await sessionController.getAllSession(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(404);
  });

  test('getAllSession - service error returns 500', async () => {
    sessionService.getallsessions.mockRejectedValue(new Error('fail'));
    await sessionController.getAllSession(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });
});
