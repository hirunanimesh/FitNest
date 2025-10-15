jest.mock('axios');

describe('serviceHealth utils', () => {
  const axios = require('axios');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('checkServiceHealth sets service true on 200', async () => {
    const { serviceHealth, checkServiceHealth } = require('../utils/serviceHealth');
    axios.get.mockResolvedValueOnce({ status: 200, data: { status: 'ok' } });

    await checkServiceHealth('auth', 'http://auth');

    expect(axios.get).toHaveBeenCalledWith('http://auth/health', expect.objectContaining({ timeout: 3000 }));
    expect(serviceHealth.auth).toBe(true);
  });

  test('checkServiceHealth sets service false on error', async () => {
    const { serviceHealth, checkServiceHealth } = require('../utils/serviceHealth');
    axios.get.mockRejectedValueOnce(new Error('down'));

    serviceHealth.auth = true; // exercise error branch
    await checkServiceHealth('auth', 'http://auth');
    expect(serviceHealth.auth).toBe(false);
  });

  test('startHealthChecks schedules initial and periodic checks', () => {
    jest.useFakeTimers();
    const { startHealthChecks } = require('../utils/serviceHealth');

    axios.get.mockResolvedValue({ status: 200 });

    startHealthChecks();

    // initial batch after 2000ms
    jest.advanceTimersByTime(2000);
    expect(axios.get).toHaveBeenCalled();

    // periodic batch after 30000ms
    jest.advanceTimersByTime(30000);
    expect(axios.get).toHaveBeenCalled();

    jest.useRealTimers();
  });
});
