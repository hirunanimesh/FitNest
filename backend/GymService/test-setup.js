// Ensure required env vars exist to satisfy Supabase client construction in services
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321/mock';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-role-key';

// Some modules (Kafka) read CA file during import; stub fs.readFileSync when running tests
const fs = require('fs');
const originalReadFileSync = fs.readFileSync;
fs.readFileSync = function(path, options) {
  if (typeof path === 'string' && path.toLowerCase().endsWith('ca.pem')) {
    return '';
  }
  return originalReadFileSync.apply(this, arguments);
};

// Optional: prevent noisy console during tests
jest.spyOn(console, 'warn').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});
