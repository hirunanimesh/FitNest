import stripe from '../../lib/stripe.js';
import { addPlanData } from '../mongoController/add-plan-data.js';

export default async function createPlan(name, price, interval, plan_id) {
  try {
    let stripePrice;

    // 1️⃣ Create Product
    const product = await stripe.products.create({ name });
    if (!product) throw new Error('Failed to create product in Stripe');

    // 2️⃣ Create Price
    if (interval === '1 day') {
      // One-off price (no recurring)
      stripePrice = await stripe.prices.create({
        unit_amount: price * 100,
        currency: 'usd',
        product: product.id, // no recurring field!
      });
      console.log('Created one-time price for 1 day plan');
    } else {
      // Map intervals for recurring prices
      const map = { '1 year': 'year', '1 month': 'month', '1 week': 'week' };
      const stripeInterval = map[interval];
      stripePrice = await stripe.prices.create({
        unit_amount: price * 100,
        currency: 'usd',
        recurring: { interval: stripeInterval },
        product: product.id,
      });
      console.log(`Created recurring price with ${stripeInterval} interval`);
    }

    if (!stripePrice) throw new Error('Failed to create price in Stripe');

    // 3️⃣ Save plan in DB
    await addPlanData({
      plan_id,
      product_id: product.id,
      price_id: stripePrice.id,
    });

    return { productId: product.id, priceId: stripePrice.id };
  } catch (error) {
    console.error(error);
    throw error;
  }
}
