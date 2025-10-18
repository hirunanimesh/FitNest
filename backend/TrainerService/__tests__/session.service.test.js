import { jest } from '@jest/globals';

let sessionService;

beforeAll(async () => {
  jest.resetModules();
  await jest.unstable_mockModule('../database/supabase.js', () => ({
    supabase: {
      from: jest.fn(),
    }
  }));

  sessionService = await import('../services/session.service.js');
});

describe('Session Service Unit Tests', () => {
  let supabase;
  beforeEach(async () => {
    const db = await import('../database/supabase.js');
    supabase = db.supabase;
    jest.clearAllMocks();
  });

  test('addsession returns created session', async () => {
    const inserted = [{ session_id: 's1' }];
    const mockFrom = { insert: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue({ data: inserted }) };
    supabase.from.mockReturnValue(mockFrom);
    const res = await sessionService.addsession({});
    expect(res).toEqual(inserted[0]);
  });

  test('getallsessions returns data', async () => {
    const data = [{ session_id: 's1' }];
    const mockFrom = { select: jest.fn().mockResolvedValue({ data }) };
    supabase.from.mockReturnValue(mockFrom);
    const res = await sessionService.getallsessions();
    expect(res).toEqual(data);
  });

  test('getsessionbysessionid returns data', async () => {
    const data = [{ session_id: 's1' }];
    const mockFrom = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockResolvedValue({ data }) };
    supabase.from.mockReturnValue(mockFrom);
    const res = await sessionService.getsessionbysessionid('s1');
    expect(res).toEqual(data);
  });

  test('addsession throws when supabase returns error', async () => {
    const mockFrom = { insert: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue({ data: null, error: { message: 'insert fail' } }) };
    supabase.from.mockReturnValue(mockFrom);
    await expect(sessionService.addsession({})).rejects.toThrow('insert fail');
  });

  test('updatesession throws when supabase returns error', async () => {
    const mockFrom = { update: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue({ data: null, error: { message: 'update fail' } }) };
    supabase.from.mockReturnValue(mockFrom);
    await expect(sessionService.updatesession('s1', {})).rejects.toThrow('update fail');
  });

  test('getallsessionbytrainerid returns empty structure when no data', async () => {
    const mockFrom = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockResolvedValue({ data: null, count: 0 }) };
    supabase.from.mockReturnValue(mockFrom);
    const res = await sessionService.getallsessionbytrainerid('t1');
    expect(res).toEqual({ sessions: [], totalCount: 0 });
  });

  test('deletesession throws when supabase returns error', async () => {
    const mockFrom = { delete: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue({ data: null, error: { message: 'delete fail' } }) };
    supabase.from.mockReturnValue(mockFrom);
    await expect(sessionService.deletesession('s1')).rejects.toThrow('delete fail');
  });

  test('getallsessions returns null when no data', async () => {
    const mockFrom = { select: jest.fn().mockResolvedValue({ data: null }) };
    supabase.from.mockReturnValue(mockFrom);
    const res = await sessionService.getallsessions();
    expect(res).toBeNull();
  });

  test('updatesession returns updated session on success', async () => {
    const updated = [{ session_id: 's1', booked: true }];
    const mockFrom = { update: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue({ data: updated }) };
    supabase.from.mockReturnValue(mockFrom);
    const res = await sessionService.updatesession('s1', { booked: true });
    expect(res).toEqual(updated[0]);
  });

  test('deletesession returns deleted session on success', async () => {
    const deleted = [{ session_id: 's1' }];
    const mockFrom = { delete: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue({ data: deleted }) };
    supabase.from.mockReturnValue(mockFrom);
    const res = await sessionService.deletesession('s1');
    expect(res).toEqual(deleted[0]);
  });

  test('getsessionbysessionid returns null when supabase returns error or no data', async () => {
    const mockFrom = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockResolvedValue({ data: null, error: { message: 'fetch fail' } }) };
    supabase.from.mockReturnValue(mockFrom);
    const res = await sessionService.getsessionbysessionid('s1');
    expect(res).toBeNull();
  });

  test('getallsessionbytrainerid returns data when present with count', async () => {
    const sessions = [{ session_id: 's1' }];
    const mockFrom = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockResolvedValue({ data: sessions, count: 1 }) };
    supabase.from.mockReturnValue(mockFrom);
    const res = await sessionService.getallsessionbytrainerid('t1');
    expect(res).toEqual({ sessions, totalCount: 1 });
  });

  test('deletesession throws TypeError when supabase returns null data unexpectedly', async () => {
    const mockFrom = { delete: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue({ data: null }) };
    supabase.from.mockReturnValue(mockFrom);
    await expect(sessionService.deletesession('s1')).rejects.toThrow(TypeError);
  });
});
