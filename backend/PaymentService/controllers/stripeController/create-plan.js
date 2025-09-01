import stripe from '../../lib/stripe.js'
import {addPlanData} from '../mongoController/add-plan-data.js';

export default async function createPlan(name, price, interval, plan_id) {
  try {
    if(interval === '1 year'){
      interval = 'year';
    }
    else if(interval === '1 month'){
      interval = 'month';
    }
    else if(interval === '1 week'){
      interval = 'week';
    }
    else if(interval === '1 day'){
      interval = 'day';
    }
    const product = await stripe.products.create({ name });
    
    const stripePrice = await stripe.prices.create({
      unit_amount: price * 100,
      currency: 'usd',
      recurring: { interval },
      product: product.id,
    });

    if (!product || !stripePrice) {
      throw new Error('Failed to create product or price in Stripe');
    }

    // Save plan in DB
    addPlanData({ 
      plan_id, 
      product_id: product.id, 
      price_id: stripePrice.id 
    });

    return { productId: product.id, priceId: stripePrice.id };
  } catch (error) {
    throw error;
  }
}