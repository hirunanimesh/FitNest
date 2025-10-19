
import stripe from '../../lib/stripe.js'
import { findPlansByProductId, findStripeCustomerId } from '../mongoController/add-plan-data.js';

export default async function getSubscriptions(req, res) {
    const { customerId } = req.params
    var customer_id;

    const customer = await findStripeCustomerId({ customer_id: customerId });
    if (customer) {
        customer_id = customer.stripe_customer_id
    } else {
        return res.status(200).json({ message: "Subscribe a plan" });
    }
  
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customer_id,
        status:'active'
      });
  
      if (!subscriptions || subscriptions.data.length === 0) {
          return res.json({ planIds: [], details: [] });
      }
  
      // Extract all product_ids
      const productIds = subscriptions.data.flatMap(sub =>
        sub.items.data.map(item => item.price.product)
      );

      const plans = await findPlansByProductId({ product_id: productIds });

      const planIds = plans.map(plan => plan.plan_id)

      // Build a map from product_id -> plan_id for quick lookup
      const productToPlanId = new Map();
      plans.forEach(plan => {
        if (plan && plan.product_id && plan.plan_id) {
          productToPlanId.set(String(plan.product_id), String(plan.plan_id));
        }
      });

      // Build details including cancellation info per subscription item
      const details = [];
      subscriptions.data.forEach(sub => {
        const cancelAtPeriodEnd = sub.cancel_at_period_end;
        const currentPeriodEnd = sub.current_period_end; // seconds
        sub.items.data.forEach(item => {
          const product = item?.price?.product;
          const planId = productToPlanId.get(String(product));
          if (planId) {
            details.push({
              plan_id: planId,
              cancel_at_period_end: cancelAtPeriodEnd,
              current_period_end: currentPeriodEnd,
            });
          }
        });
      });

      if (!planIds){
        return res.json({ planIds: [], details: [] });
      }
  
      res.json({ planIds, details });
    } catch (error) {
      res.status(500).json({ error: "Unexpected error", details: error.message });
    }
  }
  