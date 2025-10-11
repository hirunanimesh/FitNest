import { jest } from '@jest/globals';

let trainerService;

beforeAll(async () => {
  jest.resetModules();
  await jest.unstable_mockModule('../database/supabase.js', () => ({
    supabase: {
      from: jest.fn(),
    }
  }));

  trainerService = await import('../services/trainer.service.js');
});

describe('Trainer Service Unit Tests', () => {
  let supabase;
  beforeEach(async () => {
    const db = await import('../database/supabase.js');
    supabase = db.supabase;
    jest.clearAllMocks();
  });

  test('gettrainerbyid returns null when not present', async () => {
    const mockFrom = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: null }) };
    supabase.from.mockReturnValue(mockFrom);
    const res = await trainerService.gettrainerbyid('x');
    expect(res).toBeNull();
  });

  test('getalltrainers returns paginated result', async () => {
    const data = [{ id: 1 }];
    // mock the chain: supabase.from(...).select(...).ilike(...).range(...) -> Promise resolves to { data, error, count }
    const mockRangePromise = Promise.resolve({ data, error: null, count: 1 });
    const mockSelectObj = {
      ilike: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnValue(mockRangePromise),
    };
    const mockFrom = {
      select: jest.fn().mockReturnValue(mockSelectObj),
    };
    supabase.from.mockReturnValue(mockFrom);

    const res = await trainerService.getalltrainers(1, 10, '');
    expect(res.data).toEqual(data);
  });

  test('getmembershipGyms throws on invalid trainerId', async () => {
    await expect(trainerService.getmembershipGyms(undefined)).rejects.toThrow('trainerId is required');
    await expect(trainerService.getmembershipGyms('not-a-number')).rejects.toThrow('trainerId must be a valid number');
  });

  test('updatetrainerdetails throws when supabase returns error', async () => {
    const mockFrom = { update: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue({ data: null, error: { message: 'update fail' } }) };
    supabase.from.mockReturnValue(mockFrom);
    await expect(trainerService.updatetrainerdetails('t1', {})).rejects.toThrow('update fail');
  });

  test('getgymplanbytrainerid returns null when no plans', async () => {
  const mockFrom = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockResolvedValue({ data: null }) };
  supabase.from.mockReturnValue(mockFrom);
  const res = await trainerService.getgymplanbytrainerid('1');
  expect(res).toBeNull();
  });

  test('getfeedbackbytrainerid returns null when none', async () => {
  const mockFrom = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockResolvedValue({ data: null }) };
  supabase.from.mockReturnValue(mockFrom);
  const res = await trainerService.getfeedbackbytrainerid('1');
  expect(res).toBeNull();
  });

  test('booksession throws when supabase returns error', async () => {
    const mockFrom = {
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: { message: 'book fail' } })
    };
    supabase.from.mockReturnValue(mockFrom);
    await expect(trainerService.booksession('s1', 'c1')).rejects.toThrow('book fail');
  });

  test('getmembershipGyms returns data when present', async () => {
  const data = [{ id: 'g1' }];
  const mockFrom = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockResolvedValue({ data }) };
  supabase.from.mockReturnValue(mockFrom);
  const res = await trainerService.getmembershipGyms('1');
  expect(res).toEqual(data);
  });

  test('getfeedbackbytrainerid returns data when present', async () => {
    const data = [{ id: 'f1' }];
    const mockFrom = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockResolvedValue({ data }) };
    supabase.from.mockReturnValue(mockFrom);
    const res = await trainerService.getfeedbackbytrainerid('1');
    expect(res).toEqual(data);
  });

  test('booksession returns data on success', async () => {
    const data = { session_id: 's1', booked: true };
    const mockFrom = { update: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), select: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data }) };
    supabase.from.mockReturnValue(mockFrom);
    const res = await trainerService.booksession('s1', 'c1');
    expect(res).toEqual(data);
  });

  test('updatetrainerdetails returns updated trainer on success', async () => {
    const updated = [{ id: 't1', name: 'New' }];
    const mockFrom = { update: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue({ data: updated }) };
    supabase.from.mockReturnValue(mockFrom);
    const res = await trainerService.updatetrainerdetails('t1', { name: 'New' });
    expect(res).toEqual(updated[0]);
  });

  test('getalltrainers with search and pagination returns correct meta fields', async () => {
    const data = [{ id: 1 }, { id: 2 }];
    // simulate a Promise returned by range() with count > limit to exercise totalPages/hasNext/hasPrev
    const mockRangePromise = Promise.resolve({ data, error: null, count: 5 });
    const mockSelectObj = {
      ilike: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnValue(mockRangePromise),
    };
    const mockFrom = {
      select: jest.fn().mockReturnValue(mockSelectObj),
    };
    supabase.from.mockReturnValue(mockFrom);

    const res = await trainerService.getalltrainers(2, 2, 'bob');
    expect(mockSelectObj.ilike).toHaveBeenCalledWith('trainer_name', '%bob%');
    expect(res.total).toBe(5);
    expect(res.totalPages).toBe(Math.ceil(5 / 2));
    expect(res.hasNext).toBe(true);
    expect(res.hasPrev).toBe(true);
  });

  test('gettrainerbyid returns null when supabase returns no data (even with error)', async () => {
    const mockFrom = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }) };
    supabase.from.mockReturnValue(mockFrom);
    const res = await trainerService.gettrainerbyid('1');
    expect(res).toBeNull();
  });

  test('getgymplanbytrainerid maps Gym_plans array correctly when present', async () => {
    const rows = [{ Gym_plans: { id: 'gp1' } }, { Gym_plans: { id: 'gp2' } }];
    const mockFrom = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockResolvedValue({ data: rows }) };
    supabase.from.mockReturnValue(mockFrom);
    const res = await trainerService.getgymplanbytrainerid('1');
    expect(res).toEqual(rows.map(r => r.Gym_plans));
  });

  // Additional coverage to raise trainer.service.js metrics
  test('getalltrainers throws on supabase error', async () => {
    const mockRangePromise = Promise.resolve({ data: null, error: { message: 'db' }, count: 0 });
    const mockSelectObj = { ilike: jest.fn().mockReturnThis(), range: jest.fn().mockReturnValue(mockRangePromise) };
    const mockFrom = { select: jest.fn().mockReturnValue(mockSelectObj) };
    supabase.from.mockReturnValue(mockFrom);
    await expect(trainerService.getalltrainers(1, 10, 'x')).rejects.toThrow('db');
  });

  test('gettrainerbyid returns trainer when found', async () => {
    const trainer = { id: 't1', name: 'A' };
    const mockFrom = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: trainer, error: null })
    };
    supabase.from.mockReturnValue(mockFrom);
    const res = await trainerService.gettrainerbyid('t1');
    expect(res).toEqual(trainer);
  });

  test('gettrainerbyid throws when error present with data', async () => {
    const mockFrom = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: 't1' }, error: { message: 'boom' } })
    };
    supabase.from.mockReturnValue(mockFrom);
    await expect(trainerService.gettrainerbyid('t1')).rejects.toThrow('boom');
  });

  test('getgymplanbytrainerid throws on supabase error', async () => {
    const mockFrom = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockResolvedValue({ data: null, error: { message: 'fail' } }) };
    supabase.from.mockReturnValue(mockFrom);
    await expect(trainerService.getgymplanbytrainerid('1')).rejects.toThrow('fail');
  });

  test('getmembershipGyms returns null when empty array', async () => {
    const mockFrom = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockResolvedValue({ data: [], error: null }) };
    supabase.from.mockReturnValue(mockFrom);
    const res = await trainerService.getmembershipGyms('1');
    expect(res).toBeNull();
  });

  test('getmembershipGyms throws on supabase error', async () => {
    const mockFrom = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockResolvedValue({ data: null, error: { message: 'db' } }) };
    supabase.from.mockReturnValue(mockFrom);
    await expect(trainerService.getmembershipGyms('1')).rejects.toThrow('db');
  });

  describe('holdsession', () => {
    test('returns null when no rows updated (contention)', async () => {
      const chain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: [], error: null })
      };
      supabase.from.mockReturnValue(chain);
      const res = await trainerService.holdsession('s1', 'c1');
      expect(res).toBeNull();
    });

    test('throws when supabase returns error', async () => {
      const chain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: null, error: { message: 'lock fail' } })
      };
      supabase.from.mockReturnValue(chain);
      await expect(trainerService.holdsession('s1', 'c1')).rejects.toThrow('lock fail');
    });

    test('returns first row on success', async () => {
      const row = { session_id: 's1', lock: true };
      const chain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: [row], error: null })
      };
      supabase.from.mockReturnValue(chain);
      const res = await trainerService.holdsession('s1', 'c1');
      expect(res).toEqual(row);
    });
  });

  describe('releasesession', () => {
    test('returns first row on success', async () => {
      const row = { session_id: 's1', lock: false };
      const chain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: [row], error: null })
      };
      supabase.from.mockReturnValue(chain);
      const res = await trainerService.releasesession('s1');
      expect(res).toEqual(row);
    });

    test('returns null when no rows found', async () => {
      const chain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: [], error: null })
      };
      supabase.from.mockReturnValue(chain);
      const res = await trainerService.releasesession('s1');
      expect(res).toBeNull();
    });

    test('throws when supabase returns error', async () => {
      const chain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: null, error: { message: 'release fail' } })
      };
      supabase.from.mockReturnValue(chain);
      await expect(trainerService.releasesession('s1')).rejects.toThrow('release fail');
    });
  });

  describe('sendrequest', () => {
    test('returns inserted row on success', async () => {
      const row = { id: 'r1', trainer_id: 1 };
      const chain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: row, error: null })
      };
      supabase.from.mockReturnValue(chain);
      const res = await trainerService.sendrequest(1, 2);
      expect(res).toEqual(row);
    });

    test('throws when supabase returns error', async () => {
      const chain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { message: 'insert fail' } })
      };
      supabase.from.mockReturnValue(chain);
      await expect(trainerService.sendrequest(1, 2)).rejects.toThrow('insert fail');
    });
  });

  describe('requestTrainerVerification', () => {
    test('returns message when existing verification is Pending', async () => {
      const fromImpl = (table) => {
        if (table === 'verifications') {
          return {
            select: () => ({
              eq: () => ({ single: () => Promise.resolve({ data: { verification_state: 'Pending' }, error: null }) })
            })
          };
        }
        throw new Error('unexpected table');
      };
      supabase.from.mockImplementation(fromImpl);
      const res = await trainerService.requestTrainerVerification({ trainer_id: 1, type: 'T', status: 'Pending', email: 'a@b.com' });
      expect(res).toEqual({ message: 'Verification request already sent. Please wait for approval.' });
    });

    test('returns message when existing verification is Rejected', async () => {
      supabase.from.mockImplementation((table) => ({
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { verification_state: 'Rejected' }, error: null }) }) })
      }));
      const res = await trainerService.requestTrainerVerification({ trainer_id: 1, type: 'T', status: 'Pending', email: 'a@b.com' });
      expect(res).toEqual({ message: 'Your previous verification request was rejected. Please contact support.' });
    });

    test('returns message when existing verification is Approved', async () => {
      supabase.from.mockImplementation((table) => ({
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { verification_state: 'Approved' }, error: null }) }) })
      }));
      const res = await trainerService.requestTrainerVerification({ trainer_id: 1, type: 'T', status: 'Pending', email: 'a@b.com' });
      expect(res).toEqual({ message: 'Your trainer profile is already verified.' });
    });

    test('throws when check error is not not-found (code != PGRST116)', async () => {
      supabase.from.mockImplementation((table) => ({
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: { code: 'XYZ', message: 'oops' } }) }) })
      }));
      await expect(trainerService.requestTrainerVerification({ trainer_id: 1, type: 'T', status: 'Pending', email: 'a@b.com' })).rejects.toThrow('oops');
    });

    test('inserts new record when none exists (PGRST116) and returns success message', async () => {
      supabase.from.mockImplementation((table) => {
        if (table === 'verifications') {
          return {
            select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: { code: 'PGRST116' } }) }) }),
            insert: () => ({ select: () => Promise.resolve({ data: [{}], error: null }) })
          };
        }
        throw new Error('unexpected table');
      });
      const res = await trainerService.requestTrainerVerification({ trainer_id: 1, type: 'T', status: 'Pending', email: 'a@b.com' });
      expect(res).toEqual({ message: 'Verification request submitted successfully. You will be notified once reviewed.' });
    });

    test('throws when insert returns error', async () => {
      supabase.from.mockImplementation((table) => {
        if (table === 'verifications') {
          return {
            select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: { code: 'PGRST116' } }) }) }),
            insert: () => ({ select: () => Promise.resolve({ data: null, error: { message: 'db' } }) })
          };
        }
        throw new Error('unexpected table');
      });
      await expect(trainerService.requestTrainerVerification({ trainer_id: 1, type: 'T', status: 'Pending', email: 'a@b.com' })).rejects.toThrow('db');
    });
  });
});
