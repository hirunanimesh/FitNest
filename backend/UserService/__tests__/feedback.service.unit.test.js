const service = require('../services/feedback.service');

// Mock supabase client used by the service
jest.mock('../database/supabase.js', () => ({ supabase: { from: jest.fn() } }));
const { supabase } = require('../database/supabase.js');

describe('feedback.service unit tests (mocked supabase)', () => {
  afterEach(() => jest.clearAllMocks());

  test('addFeedback returns inserted feedback on success', async () => {
    const feedback = { id: 'f1', customer_id: '1', message: 'Great' };
    supabase.from.mockReturnValueOnce({ insert: () => ({ select: async () => ({ data: [feedback], error: null }) }) });

    const res = await service.addFeedback(feedback);
    expect(res).toEqual(feedback);
    expect(supabase.from).toHaveBeenCalledWith('feedback');
  });

  test('addFeedback throws when supabase returns error', async () => {
    supabase.from.mockReturnValueOnce({ insert: () => ({ select: async () => ({ data: null, error: { message: 'insert err' } }) }) });

    await expect(service.addFeedback({})).rejects.toThrow('insert err');
  });
});
