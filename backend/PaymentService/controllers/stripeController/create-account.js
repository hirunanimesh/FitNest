import stripe from '../../lib/stripe.js'

export default async function createAccount(req,res) {
    
    const account = await stripe.accounts.create({ type: 'express' });
  
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.DOMAIN}/onboarding/refresh`,
      return_url: `${process.env.DOMAIN}/onboarding/complete`,
      type: 'account_onboarding',
    });
  
    // Save `account.id` to gym in DB
    res.json({ url: accountLink.url });
  }