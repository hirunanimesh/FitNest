import stripe from '../../lib/stripe.js'
import {addPlanData} from '../mongoController/add-plan-data.js';

export default async function createPlan(req,res) {
    const { name, price, interval,plan_id } = req.body;
  
    const product = await stripe.products.create({ name });
  
    const stripePrice = await stripe.prices.create({
      unit_amount: price * 100, // in cents
      currency: 'usd',
      recurring: { interval }, // 'month' or 'year'
      product: product.id,
    });
  
    if(!product || !stripePrice) {
      return res.status(500).json({ error: 'Failed to create product or price in Stripe' });
    }
    // Save plan in DB: name, price, product.id, stripePrice.id
    res.json({ productId: product.id, priceId: stripePrice.id });
    
    addPlanData({ 
      plan_id, 
      product_id: product.id, 
      price_id: stripePrice.id 
    })
  }