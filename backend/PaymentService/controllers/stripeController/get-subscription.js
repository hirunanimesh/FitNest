
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
        return res.json({ planIds: [] });
      }
  
      // Extract all product_ids
      const productIds = subscriptions.data.flatMap(sub =>
        sub.items.data.map(item => item.price.product)
      );

      const plans = await findPlansByProductId({ product_id: productIds });

      const planIds = plans.map(plan => plan.plan_id)

      if (!planIds){
        return res.json({ planIds: [] });
      }
  
      res.json({ planIds });
    } catch (error) {
      res.status(500).json({ error: "Unexpected error", details: error.message });
    }
  }
  