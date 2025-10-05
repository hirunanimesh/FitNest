import stripe from '../../lib/stripe.js';
import axios from 'axios';

export default async function webhook(req, res) {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed');
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        const { planId, customer_id } = session.metadata;
        const userEmail = session.customer_details.email;

        if (!planId || !customer_id || !userEmail) {
            console.error('Missing required metadata in session');
            return res.status(400).json({ error: "Missing metadata in session." });
        }

        try {
            // 1. Get user details from UserService
            const userUrl = `http://localhost:3004/getuserbycustomerid/${customer_id}`;
            const userResponse = await axios.get(userUrl);
            const userData = userResponse.data;
            const customerObj = userData?.customer ?? userData?.user ?? userData;

            // 2. Get plan details from GymService
            const planUrl = `http://localhost:3002/getgymplanbyplanid/${planId}`;
            const planResponse = await axios.get(planUrl);
            const plan = planResponse.data?.planDetails ?? planResponse.data;

            if (customerObj && plan) {
                // 3. Call GymService to send the email
                const userNameCandidate = (
                    customerObj?.name ||
                    customerObj?.fullName ||
                    [customerObj?.first_name, customerObj?.last_name].filter(Boolean).join(' ').trim() ||
                    customerObj?.username ||
                    customerObj?.user_name ||
                    ''
                );
                const userName = userNameCandidate && userNameCandidate.length > 0 ? userNameCandidate : 'Valued Member';
                const gymName = (
                    plan?.gym_name ||
                    plan?.gymName ||
                    plan?.gym?.gym_name ||
                    plan?.gym?.name ||
                    'Your Gym'
                );
                const planPrice = plan?.price != null ? `$${plan.price}` : 'N/A';
                const planDuration = plan?.duration ?? 'N/A';
                const planDescription = plan?.description ?? '';
                const emailPayload = {
                    userEmail: userEmail,
                    userName,
                    planName: plan?.title ?? 'Selected Plan',
                    planDescription,
                    planPrice,
                    planDuration,
                    gymName
                };
                const emailUrl = 'http://localhost:3002/api/gym/send-subscription-email';
                await axios.post(emailUrl, emailPayload);
            } else {
                console.error('Failed to resolve user or plan for email');
            }
        } catch (error) {
            console.error('Error handling checkout session completion:', error?.message || error);
            if (error?.response) {
                console.error('Downstream service error status:', error.response.status);
            }
        }
    }

    res.status(200).json({ received: true });
}
