// Provide a dummy Stripe secret to satisfy Stripe client construction
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_secret';

// Optional: quiet console noise in tests
let J;
try {
	const mod = await import('@jest/globals');
	J = mod.jest;
} catch (e) {
	// eslint-disable-next-line no-undef
	J = typeof jest !== 'undefined' ? jest : undefined;
}

if (J) {
	J.spyOn(console, 'error').mockImplementation(() => {});
	J.spyOn(console, 'warn').mockImplementation(() => {});
}
