import stripe from '../../lib/stripe.js';
import { findStripeAccount, findStripeCustomerId, findStripePriceId, addStripeCustomer, findstripeSessionPriceId } from '../../controllers/mongoController/add-plan-data.js';

const TRAINER_SERVICE_URL = process.env.TRAINER_SERVICE_URL || 'http://localhost:3005';
const DOMAIN = process.env.DOMAIN || 'http://localhost:3000';
const PAYMENT_SERVICE_BASE_URL = process.env.PAYMENT_SERVICE_BASE_URL || 'http://localhost:3003';

export default async function SessionPayment(req, res) {
  const { sessionId, customer_id, user_id, email } = req.body;

  try {
    // 0️⃣ Attempt to place a hold (lock=true) on the session to prevent concurrent bookings
    const holdResp = await fetch(`${TRAINER_SERVICE_URL}/holdsession`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, customerId: customer_id })
    });
    if (!holdResp.ok) {
      const msg = await holdResp.json().catch(() => ({}));
      // 409 indicates already booked
      return res.status(holdResp.status).json({ error: msg.message || 'Unable to hold session. It may already be booked.' });
    }

    let customerId;
    let priceId;
    let account_id;

    // 1️⃣ Find or create Stripe customer
    const stripeCustomer = await findStripeCustomerId({ customer_id });
    if (stripeCustomer) {
      customerId = stripeCustomer.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: email,
        metadata: { customer_id },
      });
      customerId = customer.id;
      await addStripeCustomer({
        customer_id,
        stripe_customer_id: customerId,
      });
    }

    // 2️⃣ Get Stripe price for this plan
    const stripePrice = await findstripeSessionPriceId({ sessionId });
    if (!stripePrice) {
      // Release lock if we cannot proceed
      await fetch(`${TRAINER_SERVICE_URL}/releasesession`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      }).catch(() => {});
      return res.status(200).json({ error: 'Price ID not found for this plan' });
    }
    priceId = stripePrice.price_id;

    // 3️⃣ Get connected account for transfer
    const targetStripeAccount = await findStripeAccount({ user_id });
    if (!targetStripeAccount) {
      await fetch(`${TRAINER_SERVICE_URL}/releasesession`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      }).catch(() => {});
      return res.status(200).json({ error: 'Stripe Account not found for user' });
    }
    account_id = targetStripeAccount.account_id;

    // 4️⃣ Create one-time Checkout Session
    const priceDetails = await stripe.prices.retrieve(priceId);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment', // must be 'payment' for one-off
      payment_method_types: ['card'],
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      payment_intent_data: {
        transfer_data: { destination: account_id },
        application_fee_amount: Math.floor(priceDetails.unit_amount * 0.10), // 10% fee
        metadata: {
          trainer_session_id: String(sessionId),
          app_customer_id: String(customer_id),
          trainer_user_id: String(user_id)
        }
      },
      // include metadata to identify the trainer session for webhook/audits
      metadata: {
        trainer_session_id: String(sessionId),
        app_customer_id: String(customer_id),
        trainer_user_id: String(user_id)
      },
      // Shorten expiry to auto-release holds sooner if user abandons
  // Stripe requires min 30 minutes for Checkout expiry; use 31 minutes
  expires_at: Math.floor(Date.now() / 1000) + (31 * 60),
  // On success, hit our success handler with the Checkout Session ID so we can finalize booking even without webhook
  success_url: `${PAYMENT_SERVICE_BASE_URL}/sessionpayment/success?cs={CHECKOUT_SESSION_ID}&redirect=${encodeURIComponent(`${DOMAIN}/dashboard/user`)}`,
      // Cancel goes through payment service to release the hold, then redirects to app
      cancel_url: `${PAYMENT_SERVICE_BASE_URL}/sessionpayment/cancel?sessionId=${encodeURIComponent(sessionId)}&redirect=${encodeURIComponent(`${DOMAIN}/dashboard/user`)}`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    // If creation failed, ensure we release the held session
    try {
      if (sessionId) {
        await fetch(`${TRAINER_SERVICE_URL}/releasesession`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });
      }
    } catch (e) {
      console.error('Failed to auto-release session after error:', e);
    }
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
}
