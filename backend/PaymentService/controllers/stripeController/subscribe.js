import stripe from '../../lib/stripe.js';
import { findStripeAccount, findStripeCustomerId, findStripePriceId } from '../../controllers/mongoController/add-plan-data.js';
import { addStripeCustomer } from '../../controllers/mongoController/add-plan-data.js';

export default async function subscribe(req, res) {
    const { planId, customer_id, user_id, email } = req.body;

    try {
        let customerId;
        let priceId;
        let account_id;

        const stripeCustomer = await findStripeCustomerId({ customer_id });
        if (stripeCustomer) {
            customerId = stripeCustomer.stripe_customer_id;
        } else {
            const customer = await stripe.customers.create({
                email: email,
                metadata: { customer_id },
            });
            customerId = customer.id;
            await addStripeCustomer({
                customer_id: customer_id,
                stripe_customer_id: customerId
            });
        }

        const stripePriceId = await findStripePriceId({ planId });
        if (!stripePriceId) {
            return res.status(404).json({ error: 'Price ID not found for the given planId' });
        }
        priceId = stripePriceId.price_id;

        const targetStripeAccount = await findStripeAccount({ user_id });
        if (!targetStripeAccount) {
            return res.status(404).json({ error: 'Stripe Account not found for the given user_id' });
        }
        account_id = targetStripeAccount.account_id;

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            customer: customerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            subscription_data: {
                transfer_data: {
                    destination: account_id,
                },
                application_fee_percent: 10,
            },
            metadata: {
                planId: planId,
                customer_id: customer_id,
            },
            success_url: `${process.env.DOMAIN}/dashboard/user`,
            cancel_url: `${process.env.DOMAIN}/dashboard/user`,
        });
        console.log(session.subscription)
        res.json({ url: session.url });
    } catch (error) {
        res.status(500).json({ error: 'An unexpected error occurred' });
    }
}