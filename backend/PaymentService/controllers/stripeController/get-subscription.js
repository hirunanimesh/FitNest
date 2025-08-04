
import stripe from '../../lib/stripe.js'

export default async function getSubscriptions(req,res){
    const {customer_id} = req.body;

    const subscriptions = await stripe.subscriptions.list({
        customer: customer_id,
      });
    if (!subscriptions || subscriptions.data.length === 0) {
        return res.status(404).json({ error: 'No subscriptions found for this customer.' });
    }
    res.json(subscriptions.data);
}