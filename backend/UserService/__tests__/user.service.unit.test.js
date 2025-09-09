const service = require('../services/user.service');

// Mock supabase client used by the service
jest.mock('../database/supabase.js', () => ({ supabase: { from: jest.fn() } }));
const { supabase } = require('../database/supabase.js');

describe('user.service unit tests (mocked supabase)', () => {
  afterEach(() => jest.clearAllMocks());

  test('updateUserDetails returns updated user', async () => {
    const updated = { id: '1', name: 'Alice' };
    supabase.from.mockReturnValueOnce({ update: () => ({ eq: () => ({ select: async () => ({ data: [updated], error: null }) }) }) });
    const res = await service.updateUserDetails('1', { name: 'Alice' });
    expect(res).toEqual(updated);
  });

  test('updateUserDetails throws when supabase returns error', async () => {
    supabase.from.mockReturnValueOnce({ update: () => ({ eq: () => ({ select: async () => ({ data: null, error: { message: 'DB fail' } }) }) }) });
    await expect(service.updateUserDetails('1', {})).rejects.toThrow('DB fail');
  });

  test('addWeight returns inserted row', async () => {
    const weight = { id: 'w1', weight: 70 };
    supabase.from.mockReturnValueOnce({ insert: () => ({ select: async () => ({ data: [weight], error: null }) }) });
    const res = await service.addWeight({ customer_id: '1', weight: 70 });
    expect(res).toEqual(weight);
  });

  test('addWeight throws when supabase returns error', async () => {
    supabase.from.mockReturnValueOnce({ insert: () => ({ select: async () => ({ data: null, error: { message: 'insert fail' } }) }) });
    await expect(service.addWeight({})).rejects.toThrow('insert fail');
  });

  test('getUserById returns user when found', async () => {
    const user = { id: 'u1', email: 'a@b.com' };
    supabase.from.mockReturnValueOnce({ select: () => ({ eq: () => ({ single: async () => ({ data: user, error: null }) }) }) });
    const res = await service.getUserById('u1');
    expect(res).toEqual(user);
  });

  test('getUserById returns null when no user', async () => {
    supabase.from.mockReturnValueOnce({ select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }) });
    const res = await service.getUserById('u1');
    expect(res).toBeNull();
  });

  test('getUserById returns null when supabase returns error', async () => {
    supabase.from.mockReturnValueOnce({ select: () => ({ eq: () => ({ single: async () => ({ data: null, error: { message: 'boom' } }) }) }) });
    const res = await service.getUserById('u1');
    expect(res).toBeNull();
  });

  test('getWeightById returns weights array', async () => {
    const weights = [{ weight: 70 }, { weight: 71 }];
    supabase.from.mockReturnValueOnce({ select: () => ({ eq: () => ({ order: async () => ({ data: weights, error: null }) }) }) });
    const res = await service.getWeightById('u1');
    expect(res).toEqual(weights);
  });

  test('getWeightById throws when supabase returns error', async () => {
    supabase.from.mockReturnValueOnce({ select: () => ({ eq: () => ({ order: async () => ({ data: null, error: { message: 'fail' } }) }) }) });
    await expect(service.getWeightById('u1')).rejects.toThrow('fail');
  });

  test('getLatestWeightById returns latest row', async () => {
    const latest = { height: 170, weight: 70 };
    supabase.from.mockReturnValueOnce({ select: () => ({ eq: () => ({ order: () => ({ limit: async () => ({ data: [latest], error: null }) }) }) }) });
    const res = await service.getLatestWeightById('u1');
    expect(res).toEqual(latest);
  });

  test('getLatestWeightById returns undefined when no rows', async () => {
    supabase.from.mockReturnValueOnce({ select: () => ({ eq: () => ({ order: () => ({ limit: async () => ({ data: [], error: null }) }) }) }) });
    const res = await service.getLatestWeightById('u1');
    expect(res).toBeUndefined();
  });

  test('getLatestWeightById throws when supabase returns error', async () => {
    supabase.from.mockReturnValueOnce({ select: () => ({ eq: () => ({ order: () => ({ limit: async () => ({ data: null, error: { message: 'err' } }) }) }) }) });
    await expect(service.getLatestWeightById('u1')).rejects.toThrow('err');
  });
});
