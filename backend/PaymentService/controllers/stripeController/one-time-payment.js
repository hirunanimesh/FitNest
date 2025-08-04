import stripe from "../../lib/stripe.js";

export default async function handler(req, res) {
    const { priceId, destinationAccountId, userId } = req.body;
  
    // need to check database customer id exist or not if not create ( after DB created)
    const customer = await stripe.customers.create({
      metadata: { userId },
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