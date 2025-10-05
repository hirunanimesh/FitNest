import stripe from '../../lib/stripe.js';
import { findStripeAccount, findStripeCustomerId, findStripePriceId, addStripeCustomer } from '../../controllers/mongoController/add-plan-data.js';

export default async function onetimePayment(req, res) {
  const { planId, customer_id, user_id, email } = req.body;

  try {
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
    const stripePrice = await findStripePriceId({ planId });
    if (!stripePrice) {
      return res.status(200).json({ error: 'Price ID not found for this plan' });
    }
    priceId = stripePrice.price_id;

    // 3️⃣ Get connected account for transfer
    const targetStripeAccount = await findStripeAccount({ user_id });
    if (!targetStripeAccount) {
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
      },
      success_url: `${process.env.DOMAIN}/dashboard/user`,
      cancel_url: `${process.env.DOMAIN}/dashboard/user`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
}
