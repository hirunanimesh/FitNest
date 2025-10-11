import { jest } from '@jest/globals';

// ESM-safe mock for @supabase/supabase-js
const createClientMock = jest.fn();
await jest.unstable_mockModule('@supabase/supabase-js', () => ({
  __esModule: true,
  createClient: createClientMock,
}));

describe('database/supabase.js', () => {
  let supabaseModule;
  let supabaseClient;

  beforeEach(async () => {
    jest.resetModules();
    createClientMock.mockReset();

    // Provide a minimal supabase client shape used by testConnection
    supabaseClient = {
      auth: {
        getSession: jest.fn(),
      },
    };

    createClientMock.mockReturnValue(supabaseClient);

    // Import module under test after mocks are set
    supabaseModule = await import('../database/supabase.js');
  });

  test('creates client with env vars and testConnection resolves true on success', async () => {
    supabaseClient.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });

    const { testConnection, supabase } = supabaseModule;

    // Validates createClient called with expected env values
    expect(createClientMock).toHaveBeenCalledWith(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Exported supabase should be our mock instance
    expect(supabase).toBe(supabaseClient);

    // testConnection should return true on successful call
    await expect(testConnection()).resolves.toBe(true);
  });

  test('testConnection returns false when getSession throws', async () => {
    supabaseClient.auth.getSession.mockRejectedValue(new Error('network down'));

    const { testConnection } = supabaseModule;

    await expect(testConnection()).resolves.toBe(false);
  });
});
