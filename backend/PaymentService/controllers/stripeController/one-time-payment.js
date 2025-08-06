import stripe from "../../lib/stripe.js";
import {findStripeCustomerId} from '../../controllers/mongoController/add-plan-data.js'
import {addStripeCustomer} from '../../controllers/mongoController/add-plan-data.js'

export default async function handler(req, res) {
    const { priceId, destinationAccountId, customer_id } = req.body;

    var customerId;

    const stripeCustomer = await findStripeCustomerId({customer_id})
    if(stripeCustomer){
      customerId = stripeCustomer.stripe_customer_id;
    }else{
      const customer = await stripe.customers.create({ metadata: { customer_id } });
      customerId = customer.id;
      addStripeCustomer({
        customer_id: customer_id,
        stripe_customer_id:customerId
      })
    }
  
    // need to check database customer id exist or not if not create ( after DB created)
    const customer = await stripe.customers.create({
      metadata: { customer_id },
    });
  
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId, 
          quantity: 1,
        },
      ],
      payment_intent_data: {
        transfer_data: {
          destination: destinationAccountId, 
        },
      },
      success_url: `${process.env.DOMAIN}/success`,
      cancel_url: `${process.env.DOMAIN}/cancel`,
    });
  
    res.status(200).json({ url: session.url });
  }