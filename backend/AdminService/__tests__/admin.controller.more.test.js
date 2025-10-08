jest.mock('../services/document.service.js', () => ({
  uploadDocumentsToRAG: jest.fn(),
  searchSimilarDocuments: jest.fn(),
  getAllDocuments: jest.fn(),
  deleteDocument: jest.fn()
}));
jest.mock('../services/admin.service.js', () => ({
  __esModule: true,
  default: {
    getMemberGrowthStats: jest.fn(),
    getTrainerVerifications: jest.fn(),
    getGymVerifications: jest.fn(),
    handleVerificationState: jest.fn(),
    getDashboardStats: jest.fn(),
    BannedUsers: jest.fn(),
    getUserInquiries: jest.fn(),
    updateUserInquiries: jest.fn()
  }
}));
jest.mock('../services/EmailService.js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    sendVerificationApprovedEmail: jest.fn().mockResolvedValue({ success: true }),
    sendVerificationRejectedEmail: jest.fn().mockResolvedValue({ success: true })
  }))
}));

describe('Admin Controller (additional)', () => {
  let controllers;
  const makeRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => jest.clearAllMocks());
  beforeAll(async () => {
    controllers = await import('../controllers/admin.controller.js');
  });

  test('uploadDocuments - happy path', async () => {
    const { uploadDocumentsToRAG } = await import('../services/document.service.js');
    uploadDocumentsToRAG.mockResolvedValue({ message: 'ok', insertedCount: 1, totalDocuments: 1, insertedIds: [1], errors: [] });

    const req = { body: { documents: ['doc'], metadata: [{}] } };
    const res = makeRes();
    await controllers.uploadDocuments(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('searchDocuments - validation error', async () => {
    const req = { query: { query: '' } };
    const res = makeRes();
    await controllers.searchDocuments(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('getDocuments - happy path', async () => {
    const { getAllDocuments } = await import('../services/document.service.js');
    getAllDocuments.mockResolvedValue({ documents: [], pagination: { currentPage: 1 } });
    const req = { query: { page: '1', limit: '10' } };
    const res = makeRes();
    await controllers.getDocuments(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('removeDocument - missing id', async () => {
    const req = { params: {} };
    const res = makeRes();
    await controllers.removeDocument(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('healthCheck', async () => {
    const res = makeRes();
    await controllers.healthCheck({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('getMemberGrowth - service success', async () => {
    const AdminService = (await import('../services/admin.service.js')).default;
    AdminService.getMemberGrowthStats.mockResolvedValue([{ m: 1 }]);
    const res = makeRes();
    await controllers.getMemberGrowth({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('getTrainerVerifications - success', async () => {
    const AdminService = (await import('../services/admin.service.js')).default;
    AdminService.getTrainerVerifications.mockResolvedValue([{ id: 1 }]);
    const res = makeRes();
    await controllers.getTrainerVerifications({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('getGymVerifications - success', async () => {
    const AdminService = (await import('../services/admin.service.js')).default;
    AdminService.getGymVerifications.mockResolvedValue([{ id: 2 }]);
    const res = makeRes();
    await controllers.getGymVerifications({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('handleVerificationState - approved sends email', async () => {
    const AdminService = (await import('../services/admin.service.js')).default;
    AdminService.handleVerificationState.mockResolvedValue({
      verificationUpdate: [{ id: 1 }],
      userDetails: { email: 'u@e.com', name: 'N', entityName: 'Gym', entityType: 'gym' }
    });

    const req = { params: { id: '1', state: 'Approved', type: 'gym', entityId: '22' }, body: {} };
    const res = makeRes();
    await controllers.handleVerificationState(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('getDashboardStats - success', async () => {
    const AdminService = (await import('../services/admin.service.js')).default;
    AdminService.getDashboardStats.mockResolvedValue({ users: 1 });
    const res = makeRes();
    await controllers.getDashboardStats({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('banneduser - success', async () => {
    const AdminService = (await import('../services/admin.service.js')).default;
    AdminService.BannedUsers.mockResolvedValue({ id: 9 });
    const req = { body: { user_id: 1 } };
    const res = makeRes();
    await controllers.banneduser(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('getuserinquiries - success', async () => {
    const AdminService = (await import('../services/admin.service.js')).default;
    AdminService.getUserInquiries.mockResolvedValue([{ id: 7 }]);
    const res = makeRes();
    await controllers.getuserinquiries({}, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('updateinquirydetails - validations and success', async () => {
    const AdminService = (await import('../services/admin.service.js')).default;
    AdminService.updateUserInquiries.mockResolvedValue({ id: 5 });

    // missing id
    let req = { params: {}, body: {} };
    let res = makeRes();
    await controllers.updateinquirydetails(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    // empty body
    req = { params: { inquiryId: '12' }, body: {} };
    res = makeRes();
    await controllers.updateinquirydetails(req, res);
    expect(res.status).toHaveBeenCalledWith(400);

    // happy path
    req = { params: { inquiryId: '12' }, body: { status: 'resolved' } };
    res = makeRes();
    await controllers.updateinquirydetails(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
