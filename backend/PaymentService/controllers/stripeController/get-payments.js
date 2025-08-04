import stripe from "../../lib/stripe.js";

export default async function getPaymentList(req,res){
    const {customer_id} = req.body

    const payments = await stripe.paymentIntents.list({
        customer: customer_id,
        limit: 10, 
      });

    if(!payments || payments.data.length === 0){
        return res.status(404).json({ error: 'No payments found for this customer.' });
    }
    res.json(payments.data)
}