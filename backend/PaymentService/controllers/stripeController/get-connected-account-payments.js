import stripe from "../../lib/stripe.js";
import { findStripeAccount } from "../mongoController/add-plan-data.js";

// Get connected account payments with details including receipt URL
export default async function getConnectedAccountPayments(req, res) {
    const { userId } = req.params;
    const account = await findStripeAccount({ user_id: userId });
    
    if (!account) {
        return res.json({ message: "No connected account found for this user" });
    }

    try {
        const charges = await stripe.charges.list(
            { limit: 10 },
            { stripeAccount: account.account_id }
        );

        if (!charges || charges.data.length === 0) {
            return res.json({ message: "No charges for this account" });
        }

        const payments = charges.data.map(charge => ({
            id: charge.id,
            amount: charge.amount / 100, // convert from cents to dollars/rupees
            currency: charge.currency,
            status: charge.status,
            payment_method: charge.payment_method_details?.card
                ? {
                    brand: charge.payment_method_details.card.brand,
                    last4: charge.payment_method_details.card.last4,
                    exp_month: charge.payment_method_details.card.exp_month,
                    exp_year: charge.payment_method_details.card.exp_year
                }
                : charge.payment_method, // fallback if not a card
            created: new Date(charge.created * 1000).toLocaleString(), // convert Unix timestamp
            receipt_url: charge.receipt_url // link to Stripe receipt
        }));

        return res.json({ message: "Success fetching charges", payments });

    } catch (err) {
        console.error("❌ Error fetching charges:", err);
        res.status(500).json({ message: "Error fetching charges", error: err.message });
    }
}
