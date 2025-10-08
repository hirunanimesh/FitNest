import EmailService from '../services/EmailService.js';

describe('EmailService', () => {
  let mockMailClient;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SENDGRID_API_KEY = 'test-sg-key';
    process.env.FROM_EMAIL = 'noreply@test.com';
    mockMailClient = {
      setApiKey: jest.fn(),
      send: jest.fn(),
    };
  });

  test('sendVerificationApprovedEmail - success', async () => {
    mockMailClient.send.mockResolvedValue([
      { statusCode: 202, headers: { 'x-message-id': 'mid-123' } },
    ]);

    const svc = new EmailService(mockMailClient);
    const res = await svc.sendVerificationApprovedEmail(
      'user@example.com',
      'Alice',
      'trainer',
      'Alice Fit'
    );

    expect(mockMailClient.setApiKey).toHaveBeenCalledWith('test-sg-key');
    expect(mockMailClient.send).toHaveBeenCalledTimes(1);
    expect(res).toEqual({ success: true, messageId: 'mid-123' });
  });

  test('sendVerificationApprovedEmail - failure surfaces error', async () => {
    const err = new Error('SG failed');
    err.response = { body: { errors: [{ message: 'bad sender' }] } };
    mockMailClient.send.mockRejectedValue(err);

    const svc = new EmailService(mockMailClient);

    await expect(
      svc.sendVerificationApprovedEmail(
        'user@example.com',
        'Alice',
        'trainer',
        'Alice Fit'
      )
    ).rejects.toThrow('Failed to send verification approved email: SG failed');
  });

  test('sendVerificationRejectedEmail - success', async () => {
    mockMailClient.send.mockResolvedValue([
      { statusCode: 202, headers: { 'x-message-id': 'mid-456' } },
    ]);

    const svc = new EmailService(mockMailClient);
    const res = await svc.sendVerificationRejectedEmail(
      'user@example.com',
      'Bob',
      'gym',
      'Bob Gym',
      'Incomplete docs'
    );

    expect(mockMailClient.send).toHaveBeenCalledTimes(1);
    expect(res).toEqual({ success: true, messageId: 'mid-456' });
  });

  test('sendVerificationRejectedEmail - failure surfaces error', async () => {
    mockMailClient.send.mockRejectedValue(new Error('SMTP blocked'));

    const svc = new EmailService(mockMailClient);
    await expect(
      svc.sendVerificationRejectedEmail(
        'user@example.com',
        'Bob',
        'gym',
        'Bob Gym',
        'Incomplete docs'
      )
    ).rejects.toThrow('Failed to send verification rejected email: SMTP blocked');
  });
});
