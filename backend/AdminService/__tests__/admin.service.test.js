import AdminService from '../services/admin.service.js';

jest.mock('../database/supabase.js', () => ({
  supabase: {
    rpc: jest.fn(),
    from: jest.fn(() => ({ update: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue({ data: [{ id: 1 }], error: null }) }))
  }
}));

describe('AdminService', () => {
  let supabase;
  beforeAll(async () => {
    ({ supabase } = await import('../database/supabase.js'));
  });

  beforeEach(() => { jest.clearAllMocks(); });

  test('getMemberGrowthStats - success', async () => {
    supabase.rpc.mockResolvedValueOnce({ data: [{ month: '2025-01', count: 10 }], error: null });
    const res = await AdminService.getMemberGrowthStats();
    expect(res).toEqual([{ month: '2025-01', count: 10 }]);
  });

  test('getMemberGrowthStats - error', async () => {
    supabase.rpc.mockResolvedValueOnce({ data: null, error: { message: 'boom' } });
    await expect(AdminService.getMemberGrowthStats()).rejects.toThrow('Failed to retrieve member growth stats');
  });

  test('getDashboardStats - success', async () => {
    supabase.rpc.mockResolvedValueOnce({ data: { users: 5 }, error: null });
    const res = await AdminService.getDashboardStats();
    expect(res).toEqual({ users: 5 });
  });

  test('getDashboardStats - error', async () => {
    supabase.rpc.mockResolvedValueOnce({ data: null, error: { message: 'rpc err' } });
    await expect(AdminService.getDashboardStats()).rejects.toThrow('Failed to retrieve dashboard stats');
  });

  test('getTrainerVerifications - success', async () => {
    supabase.rpc.mockResolvedValueOnce({ data: [{ id: 1 }], error: null });
    const res = await AdminService.getTrainerVerifications();
    expect(res).toEqual([{ id: 1 }]);
  });

  test('getTrainerVerifications - error', async () => {
    supabase.rpc.mockResolvedValueOnce({ data: null, error: { message: 'bad' } });
    await expect(AdminService.getTrainerVerifications()).rejects.toThrow('Failed to retrieve trainer verifications');
  });

  test('getGymVerifications - success', async () => {
    supabase.rpc.mockResolvedValueOnce({ data: [{ id: 2 }], error: null });
    const res = await AdminService.getGymVerifications();
    expect(res).toEqual([{ id: 2 }]);
  });

  test('getGymVerifications - error', async () => {
    supabase.rpc.mockResolvedValueOnce({ data: null, error: { message: 'oops' } });
    await expect(AdminService.getGymVerifications()).rejects.toThrow('Failed to retrieve gym verifications');
  });

  test('handleVerificationState - approves trainer and updates rows', async () => {
    // Prepare get_trainer_verifications
    supabase.rpc
      .mockResolvedValueOnce({ data: null, error: null }) // get_gym_verifications skipped
      .mockResolvedValueOnce({ data: [{ id: 10, applicant_email: 't@example.com', applicantname: 'T' }], error: null });

    const updateMock = jest.fn().mockReturnThis();
    const eqMock = jest.fn().mockReturnThis();
    const selectMock = jest.fn().mockResolvedValue({ data: [{ id: 10 }], error: null });

    supabase.from = jest.fn((table) => {
      return {
        update: updateMock,
        eq: eqMock,
        select: selectMock
      };
    });

    const res = await AdminService.handleVerificationState('10', 'Approved', 'trainer', 77);

    expect(res.verificationUpdate).toEqual([{ id: 10 }]);
    expect(res.userDetails.email).toBe('t@example.com');
    expect(updateMock).toHaveBeenCalled();
  });

  test('getUserInquiries - returns data', async () => {
    const selectMock = jest.fn().mockResolvedValue({ data: [{ id: 1 }], error: null });
    supabase.from = jest.fn(() => ({ select: selectMock }));
    const res = await AdminService.getUserInquiries();
    expect(res).toEqual([{ id: 1 }]);
  });

  test('getUserInquiries - error', async () => {
    const selectMock = jest.fn().mockResolvedValue({ data: null, error: { message: 'db' } });
    supabase.from = jest.fn(() => ({ select: selectMock }));
    await expect(AdminService.getUserInquiries()).rejects.toThrow('db');
  });

  test('BannedUsers - inserts and updates related tables', async () => {
    const chain = { insert: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue({ data: [{ id: 1 }], error: null }), update: jest.fn().mockReturnThis(), eq: jest.fn().mockResolvedValue({ error: null }) };
    supabase.from = jest.fn(() => chain);

    const res = await AdminService.BannedUsers({ user_id: 9, reason: 'spam', target_type: 'trainer', inquiryId: 5 });
    expect(res).toEqual({ id: 1 });
  });

  test('updateUserInquiries - success', async () => {
    const chain = { update: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), select: jest.fn().mockResolvedValue({ data: [{ id: 3 }], error: null }) };
    supabase.from = jest.fn(() => chain);
    const res = await AdminService.updateUserInquiries(3, { status: 'resolved' });
    expect(res).toEqual({ id: 3 });
  });
});
