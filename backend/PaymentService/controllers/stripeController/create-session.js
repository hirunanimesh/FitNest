import stripe from '../../lib/stripe.js';
import { addSession } from '../mongoController/add-plan-data.js';

export default async function createSession(price,session_id){
    try{
        let stripePrice;

    // 1️⃣ Create Product
        const product = await stripe.products.create({ name:"trainer session" });
        if (!product) throw new Error('Failed to create product in Stripe');

        stripePrice = await stripe.prices.create({
            unit_amount: price * 100,
            currency: 'usd',
            product: product.id, // no recurring field!
          });

        if (!stripePrice) throw new Error('Failed to create price in Stripe');

        await addSession({
            session_id,
            price_id: stripePrice.id,
            product_id:product.id
        })
        return { productId: product.id, priceId: stripePrice.id };
    }catch(error){
        console.error(error);
        throw error;
    }

}