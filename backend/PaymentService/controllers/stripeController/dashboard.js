import stripe from "../../lib/stripe.js";

export default async function getDashboardLink(req,res){
    const {account_id} = req.body

    const loginLink = await stripe.accounts.createLoginLink(account_id);
    if (!loginLink || !loginLink.url) {
        return res.status(500).json({ error: 'Failed to create dashboard link.' });
    }
    res.json({ url: loginLink.url });
}