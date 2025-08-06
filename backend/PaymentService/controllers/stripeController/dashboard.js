import stripe from "../../lib/stripe.js";
import {findStripeAccount} from '../../controllers/mongoController/add-plan-data.js'

export default async function getDashboardLink(req,res){
    const {user_id} = req.body
    const stripeAccount = await findStripeAccount({user_id});
    if (!stripeAccount || !stripeAccount.account_id) {
        return res.status(404).json({ error: 'Stripe account not found.' });
    }
    const account_id = stripeAccount.account_id;

    try{

        const loginLink = await stripe.accounts.createLoginLink(account_id);
        if (!loginLink || !loginLink.url) {
            return res.status(500).json({ error: 'Failed to create dashboard link.' });
        }
        if (!loginLink.url) {
            return res.status(500).json({ error: 'account that has not completed onboarding' });
        }else{
            res.json({ url: loginLink.url });
        }

    }catch(error){
        console.error('Error creating dashboard link:', error);
        res.status(500).json({ error: 'account that has not completed onboarding' });
    }

    
    
}