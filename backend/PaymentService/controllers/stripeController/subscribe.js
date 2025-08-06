import stripe from '../../lib/stripe.js'
import {findStripeCustomerId} from '../../controllers/mongoController/add-plan-data.js'
import {addStripeCustomer} from '../../controllers/mongoController/add-plan-data.js'

export default async function subscribe(req,res) {
    const { priceId,customer_id ,account_id,email} = req.body;

  var customerId;

  const stripeCustomer = await findStripeCustomerId({customer_id})
  if(stripeCustomer){
    customerId = stripeCustomer.stripe_customer_id;
  }else{
    const customer = await stripe.customers.create({
      email:email,
      metadata: { customer_id }, 
    });
    customerId = customer.id;
    addStripeCustomer({
      customer_id: customer_id,
      stripe_customer_id:customerId
    })
  }
  
  
   const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer: customerId,
    line_items: [
      {
        price: priceId, // This price should be created with `transfer_lookup_key`
        quantity: 1,
      },
    ],
    subscription_data: {
      transfer_data: {
        destination: account_id, // The gym’s Stripe account
      },
      application_fee_percent: 10, // optional: fee your platform takes
    },
    success_url: 'https://yourapp.com/success',
    cancel_url: 'https://yourapp.com/cancel',
  });
  
    res.json({ url: session.url });
  }