// Ensure required env vars exist to satisfy Supabase client construction in services
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321/mock';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-role-key';

// Some modules (Kafka) read CA file during import; stub fs.readFileSync when running tests
try {
  const fs = (await import('fs')).default || await import('fs');
  const originalReadFileSync = fs.readFileSync;
  fs.readFileSync = function(path, options) {
    if (typeof path === 'string' && path.toLowerCase().endsWith('ca.pem')) {
      return '';
    }
    return originalReadFileSync.apply(this, arguments);
  };
} catch (_) {
  // ignore in environments where fs cannot be imported
}

// Optional: prevent noisy console during tests
let J;
try {
  const mod = await import('@jest/globals');
  J = mod.jest;
} catch (_) {
  // eslint-disable-next-line no-undef
  J = typeof jest !== 'undefined' ? jest : undefined;
}
if (J) {
  J.spyOn(console, 'warn').mockImplementation(() => {});
  J.spyOn(console, 'error').mockImplementation(() => {});
}
