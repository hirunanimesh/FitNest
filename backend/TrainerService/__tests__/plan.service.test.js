import { jest } from '@jest/globals';

let planService;

beforeAll(async () => {
  await jest.unstable_mockModule('../database/supabase.js', () => ({
    supabase: {
      from: jest.fn(),
    }
  }));

  planService = await import('../services/plan.service.js');
});

describe('Plan Service Unit Tests', () => {
  let supabase;
  beforeEach(async () => {
    const db = await import('../database/supabase.js');
    supabase = db.supabase;
    jest.clearAllMocks();
  });

  test('addplan returns created plan', async () => {
    const inserted = [{ id: 'p1' }];
    const mockFrom = { insert: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue({ data: inserted }) };
    supabase.from.mockReturnValue(mockFrom);
    const res = await planService.addplan({});
    expect(res).toEqual(inserted[0]);
  });

  test('getallplans returns data', async () => {
    const data = [{ id: 'p1' }];
    const mockFrom = { select: jest.fn().mockResolvedValue({ data }) };
    supabase.from.mockReturnValue(mockFrom);
    const res = await planService.getallplans();
    expect(res).toEqual(data);
  });

  test('addplan throws when supabase returns error', async () => {
    const mockFrom = { insert: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue({ data: null, error: { message: 'insert fail' } }) };
    supabase.from.mockReturnValue(mockFrom);
    await expect(planService.addplan({})).rejects.toThrow('insert fail');
  });

  test('updateplan throws when supabase returns error', async () => {
    const mockFrom = { update: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue({ data: null, error: { message: 'update fail' } }) };
    supabase.from.mockReturnValue(mockFrom);
    await expect(planService.updateplan('p1', {})).rejects.toThrow('update fail');
  });

  test('getplanbyplanid returns null when not present', async () => {
    const mockFrom = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockResolvedValue({ data: null }) };
    supabase.from.mockReturnValue(mockFrom);
    const res = await planService.getplanbyplanid('x');
    expect(res).toBeNull();
  });

  test('getallplanbytrainerid returns empty structure when no data', async () => {
    const mockFrom = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockResolvedValue({ data: null, count: 0 }) };
    supabase.from.mockReturnValue(mockFrom);
    const res = await planService.getallplanbytrainerid('t1');
    expect(res).toEqual({ plans: [], totalCount: 0 });
  });

  test('deleteplan throws when supabase returns error', async () => {
    const mockFrom = { delete: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue({ data: null, error: { message: 'delete fail' } }) };
    supabase.from.mockReturnValue(mockFrom);
    await expect(planService.deleteplan('p1')).rejects.toThrow('delete fail');
  });

  test('getallplans returns null when no data', async () => {
    const mockFrom = { select: jest.fn().mockResolvedValue({ data: null }) };
    supabase.from.mockReturnValue(mockFrom);
    const res = await planService.getallplans();
    expect(res).toBeNull();
  });

  test('updateplan returns updated plan on success', async () => {
    const updated = [{ id: 'p1', title: 'new' }];
    const mockFrom = { update: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue({ data: updated }) };
    supabase.from.mockReturnValue(mockFrom);
    const res = await planService.updateplan('p1', { title: 'new' });
    expect(res).toEqual(updated[0]);
  });

  test('deleteplan returns deleted plan on success', async () => {
    const deleted = [{ id: 'p1' }];
    const mockFrom = { delete: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue({ data: deleted }) };
    supabase.from.mockReturnValue(mockFrom);
    const res = await planService.deleteplan('p1');
    expect(res).toEqual(deleted[0]);
  });

  test('getplanbyplanid returns null when supabase returns error or no data', async () => {
    const mockFrom = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockResolvedValue({ data: null, error: { message: 'fetch fail' } }) };
    supabase.from.mockReturnValue(mockFrom);
    const res = await planService.getplanbyplanid('p1');
    expect(res).toBeNull();
  });

  test('getallplanbytrainerid returns data when present with count', async () => {
    const plans = [{ id: 'p1' }, { id: 'p2' }];
    const mockFrom = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockResolvedValue({ data: plans, count: 2 }) };
    supabase.from.mockReturnValue(mockFrom);
    const res = await planService.getallplanbytrainerid('t1');
    expect(res).toEqual({ plans, totalCount: 2 });
  });

  test('addplan throws when Supabase returns null data (causes TypeError)', async () => {
    const mockFrom = { insert: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue({ data: null }) };
    supabase.from.mockReturnValue(mockFrom);
    await expect(planService.addplan({})).rejects.toThrow(TypeError);
  });
});
