import stripe from '../../lib/stripe.js';

const TRAINER_SERVICE_URL = process.env.TRAINER_SERVICE_URL || 'http://localhost:3005';
const DOMAIN = process.env.DOMAIN || 'http://localhost:3000';

export default async function successSessionHandler(req, res) {
  try {
    const cs = req.query.cs || req.query.session_id || req.query.checkout_session_id;
    const redirect = req.query.redirect || DOMAIN;

    if (!cs) {
      return res.status(400).json({ error: 'Missing checkout session id (cs)' });
    }

    // Retrieve the checkout session from Stripe to verify success
    const session = await stripe.checkout.sessions.retrieve(cs);

    // Confirm payment is completed/paid
    const paid = session?.payment_status === 'paid' || session?.status === 'complete';
    if (!paid) {
      // Not paid; just redirect back
      res.writeHead(302, { Location: redirect });
      return res.end();
    }

    // Get trainer session and app customer id from metadata (prefer checkout metadata; fallback to PI metadata)
    let trainerSessionId = session?.metadata?.trainer_session_id;
    let appCustomerId = session?.metadata?.app_customer_id;

    if ((!trainerSessionId || !appCustomerId) && session?.payment_intent) {
      const pi = await stripe.paymentIntents.retrieve(session.payment_intent);
      trainerSessionId = trainerSessionId || pi?.metadata?.trainer_session_id;
      appCustomerId = appCustomerId || pi?.metadata?.app_customer_id;
    }

    if (trainerSessionId && appCustomerId) {
      try {
        await fetch(`${TRAINER_SERVICE_URL}/booksession`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: trainerSessionId, customerId: appCustomerId })
        });
      } catch (e) {
        console.error('Failed to finalize booking on success callback:', e);
      }
    }

    // Redirect back to app
    res.writeHead(302, { Location: redirect });
    return res.end();
  } catch (err) {
    console.error('Success handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
