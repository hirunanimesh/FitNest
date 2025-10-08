import EmailService from '../services/EmailService.js';

// Mock @sendgrid/mail default export
jest.unstable_mockModule('@sendgrid/mail', () => ({
  __esModule: true,
  default: {
    setApiKey: jest.fn(),
    send: jest.fn()
  }
}));

describe('EmailService', () => {
  let sgMail;

  beforeAll(async () => {
    // Dynamic import to receive the mock
    sgMail = (await import('@sendgrid/mail')).default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SENDGRID_API_KEY = 'test-sg-key';
    process.env.FROM_EMAIL = 'noreply@test.com';
  });

  test('sendVerificationApprovedEmail - success', async () => {
    sgMail.send.mockResolvedValue([{ statusCode: 202, headers: { 'x-message-id': 'mid-123' } }]);

    const svc = new EmailService();
    const res = await svc.sendVerificationApprovedEmail('user@example.com', 'Alice', 'trainer', 'Alice Fit');

    expect(sgMail.setApiKey).toHaveBeenCalledWith('test-sg-key');
    expect(sgMail.send).toHaveBeenCalledTimes(1);
    expect(res).toEqual({ success: true, messageId: 'mid-123' });
  });

  test('sendVerificationApprovedEmail - failure surfaces error', async () => {
    const err = new Error('SG failed');
    err.response = { body: { errors: [{ message: 'bad sender' }] } };
    sgMail.send.mockRejectedValue(err);

    const svc = new EmailService();

    await expect(
      svc.sendVerificationApprovedEmail('user@example.com', 'Alice', 'trainer', 'Alice Fit')
    ).rejects.toThrow('Failed to send verification approved email: SG failed');
  });

  test('sendVerificationRejectedEmail - success', async () => {
    sgMail.send.mockResolvedValue([{ statusCode: 202, headers: { 'x-message-id': 'mid-456' } }]);

    const svc = new EmailService();
    const res = await svc.sendVerificationRejectedEmail('user@example.com', 'Bob', 'gym', 'Bob Gym', 'Incomplete docs');

    expect(sgMail.send).toHaveBeenCalledTimes(1);
    expect(res).toEqual({ success: true, messageId: 'mid-456' });
  });

  test('sendVerificationRejectedEmail - failure surfaces error', async () => {
    sgMail.send.mockRejectedValue(new Error('SMTP blocked'));

    const svc = new EmailService();
    await expect(
      svc.sendVerificationRejectedEmail('user@example.com', 'Bob', 'gym', 'Bob Gym', 'Incomplete docs')
    ).rejects.toThrow('Failed to send verification rejected email: SMTP blocked');
  });
});
