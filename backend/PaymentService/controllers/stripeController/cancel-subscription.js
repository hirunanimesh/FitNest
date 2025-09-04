import stripe from '../../lib/stripe.js'
import { findStripeCustomerId, findStripePriceId } from '../mongoController/add-plan-data.js';

export default async function getSubscriptionId(req, res) {
  const { customerId, planId } = req.body;

  try {
    // Step 1: Find Stripe customer_id from your DB
    const customer = await findStripeCustomerId({ customer_id: customerId });
    if (!customer) {
      return res.status(404).json({ error: "Customer not found." });
    }
    const stripeCustomerId = customer.stripe_customer_id;

    // Step 2: Find product_id from MongoDB using plan_id
    const plan = await findStripePriceId({ planId });
    if (!plan) {
      return res.status(404).json({ error: "Plan not found." });
    }
    const productId = plan.product_id;

    // Step 3: Fetch subscriptions from Stripe (no expand needed)
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
    });

    if (!subscriptions || subscriptions.data.length === 0) {
      return res
        .status(404)
        .json({ error: "No subscriptions found for this customer." });
    }

    // Step 4: Match subscription by product_id
    const subscription = subscriptions.data.find(sub =>
      sub.items.data.some(item => item.price.product === productId)
    );

    if (!subscription) {
      return res.status(404).json({ error: "No subscription found for this plan." });
    }

    const canceledSubscription = await stripe.subscriptions.del(subscription.id);

    // Step 5: Return delection confirmation
    res.json({ canceled: true, subscriptionId: canceledSubscription.id });
  } catch (error) {
    res.status(500).json({ error: "Unexpected error", details: error.message });
  }
}
