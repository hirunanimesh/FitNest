import stripe from '../../lib/stripe.js';

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:3000';

export default async function webhook(req, res) {
  // Ensure event is an object even if body parsing failed
  let event = req.body || {};

  // If you configure STRIPE_WEBHOOK_SECRET, verify the signature (optional here based on existing setup)
  // const sig = req.headers['stripe-signature'];
  // event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        // On success, mark booked=true and clear lock on TrainerService
        let trainerSessionId = session?.metadata?.trainer_session_id;
        let appCustomerId = session?.metadata?.app_customer_id;
        if ((!trainerSessionId || !appCustomerId) && session?.payment_intent) {
          const pi = await stripe.paymentIntents.retrieve(session.payment_intent);
          trainerSessionId = trainerSessionId || pi?.metadata?.trainer_session_id;
          appCustomerId = appCustomerId || pi?.metadata?.app_customer_id;
        }
        if (trainerSessionId && appCustomerId) {
          try {
            await fetch(`${API_GATEWAY_URL}/api/trainer/booksession`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId: trainerSessionId, customerId: appCustomerId })
            });
          } catch (e) {
            console.error('Failed to finalize booking on success:', e);
          }
        }
        return res.json({ received: true });
      }
      case 'checkout.session.expired':
      case 'payment_intent.payment_failed':
      case 'charge.refunded':
      case 'checkout.session.async_payment_failed': {
        // Release the session on failure/expiry
        const obj = event.data.object;
        let trainerSessionId = obj?.metadata?.trainer_session_id;
        if (!trainerSessionId && obj?.payment_intent) {
          const pi = await stripe.paymentIntents.retrieve(obj.payment_intent);
          trainerSessionId = pi?.metadata?.trainer_session_id;
        }
        if (trainerSessionId) {
          try {
            await fetch(`${API_GATEWAY_URL}/api/trainer/releasesession`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId: trainerSessionId })
            });
          } catch (e) {
            console.error('Failed to release session from webhook:', e);
          }
        }
        return res.json({ received: true });
      }
      default:
        return res.json({ received: true });
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).json({ error: 'Webhook error' });
  }
}
