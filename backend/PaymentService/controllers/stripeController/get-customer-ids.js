import stripe from '../../lib/stripe.js';
import { findPlansByPlanIds, findCustomerByStripeId } from '../mongoController/add-plan-data.js';

export default async function getCustomersByGymPlans(req, res) {
  const { gymPlans } = req.body; // array of objects with { plan_id }
  console.log("gym plans",gymPlans);

  if (!gymPlans || !Array.isArray(gymPlans) || gymPlans.length === 0) {
    return res.status(400).json({ error: "gymPlans must be a non-empty array" });
  }

  try {
    // Step 1: Extract plan_ids
    const planIds = gymPlans.map(plan => plan.plan_id);

    // Step 2: Fetch product_ids from MongoDB
    const plans = await findPlansByPlanIds({ plan_ids: planIds }); 
    // expects your function to query like StripePlanData.find({ plan_id: { $in: plan_ids } })

    if (!plans || plans.length === 0) {
      return res.status(404).json({ error: "No matching plans found in DB." });
    }

    const productIds = plans.map(p => p.product_id);

    // Step 3: Fetch all active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      status: 'active',
      limit: 100,
    });

    if (!subscriptions || subscriptions.data.length === 0) {
      return res.status(404).json({ error: "No subscriptions found." });
    }

    // Step 4: Match subscriptions that contain any of the productIds
    const matchingSubscriptions = subscriptions.data.filter(sub =>
      sub.items.data.some(item => productIds.includes(item.price.product))
    );

    if (matchingSubscriptions.length === 0) {
      return res.status(404).json({ error: "No subscriptions match these plans." });
    }

    // Step 5: Collect unique Stripe customer IDs
    const stripeCustomerIds = [
      ...new Set(matchingSubscriptions.map(sub => sub.customer))
    ];

    // Step 6: Map Stripe customer IDs -> your DB customer_ids
    const customerIds = [];
    for (const stripeCustomerId of stripeCustomerIds) {
      const customer = await findCustomerByStripeId({ stripe_customer_id: stripeCustomerId });
      if (customer) {
        customerIds.push(customer.customer_id);
      }
    }

    res.json({ customerIds });
  } catch (error) {
    res.status(500).json({ error: "Unexpected error", details: error.message });
  }
}
