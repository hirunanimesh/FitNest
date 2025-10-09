process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321/mock';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-key';

// Support both CJS and ESM Jest environments
let J;
try {
	// ESM: import jest from @jest/globals
	const mod = await import('@jest/globals');
	J = mod.jest;
} catch (e) {
	// Fallback to global jest (CJS)
	// eslint-disable-next-line no-undef
	J = typeof jest !== 'undefined' ? jest : undefined;
}

if (J) {
	J.spyOn(console, 'error').mockImplementation(() => {});
	J.spyOn(console, 'warn').mockImplementation(() => {});
}
