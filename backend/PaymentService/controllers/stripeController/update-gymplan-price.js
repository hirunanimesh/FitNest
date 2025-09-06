import stripe from '../../lib/stripe.js';
import { findStripePriceId, updatePlanPrice } from '../mongoController/add-plan-data.js';

export default async function updateGymPlanPrice(plan_id,price,interval){
    try{
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
        const plan = await findStripePriceId({ planId: plan_id });
        if(!plan){
            throw new Error("Plan not found.");
        }
        const stripePrice = await stripe.prices.create({
            unit_amount: price * 100,
            currency: 'usd',
            recurring: { interval },
            product: plan.product_id,
          });


        const updateDatabase = await updatePlanPrice({ plan_id: plan_id, new_price_id: stripePrice.id });
        if(updateDatabase){
            console.log('Plan price updated successfully');
        }else{
            throw new Error("Failed to update plan price in database.");
        }

    }catch(error){
        console.error('Error updating plan price:', error);
        throw error;
    }
}