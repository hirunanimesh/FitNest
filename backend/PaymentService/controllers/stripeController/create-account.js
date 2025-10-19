import stripe from '../../lib/stripe.js'
import {findStripeAccount} from '../../controllers/mongoController/add-plan-data.js'
import {addStripeAccount} from '../../controllers/mongoController/add-plan-data.js'

export default async function createAccount(req,res) {

    const {user_id} = req.params;
    var accountId;
    const stripeAccount = await findStripeAccount({user_id})
    if(stripeAccount){
        accountId = stripeAccount.account_id
    }else{
      const account = await stripe.accounts.create({ type: 'express' });
      accountId = account.id;
      const saveAccount =  addStripeAccount({        // Save `account.id` to gym in DB
        user_id,
        account_id: accountId
      })
      console.log('📦 Stripe Account saved:', saveAccount);
    }
  
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.DOMAIN}`,
      return_url: `${process.env.DOMAIN}`,
      type: 'account_onboarding',
    });

    
    if(accountLink){
      res.json({ url: accountLink.url });
    }else{
      res.status(500).json({ error: 'Failed to create account link' });
    }
   
  }