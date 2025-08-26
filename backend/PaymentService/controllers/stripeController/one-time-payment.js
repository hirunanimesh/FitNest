import stripe from "../../lib/stripe.js";
import {findStripeCustomerId} from '../../controllers/mongoController/add-plan-data.js'
import {addStripeCustomer} from '../../controllers/mongoController/add-plan-data.js'

export default async function oneTimePayment(req, res) {
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
  
  
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customerId,
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