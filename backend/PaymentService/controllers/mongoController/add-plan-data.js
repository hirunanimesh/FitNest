import StripePlanData from '../../models/stripe_plan_data.js'
import StripeCustomer from '../../models/stripe_customer.js'
import StripeAccount from '../../models/stripe_account.js';

function addPlanData ({plan_id,product_id,price_id}){

    const plan_data = new StripePlanData({
        plan_id,
        product_id,
        price_id
    })

    plan_data.save()
    .then(savedPlan => {
      console.log('📦 User saved:', savedPlan);
    })
    .catch(err => console.error('❌ Save error:', err));
}


async function findStripeCustomerId ({customer_id}){
    
    const stripeCustomer = await StripeCustomer.findOne({customer_id})

    return stripeCustomer
}

function addStripeCustomer ({customer_id,stripe_customer_id}){
    const stripeCustomer = new StripeCustomer({
        customer_id,
        stripe_customer_id
    })

    stripeCustomer.save()
    .then(savedCustomer => {
      console.log('📦 User saved:', savedCustomer);
    })
    .catch(err => console.error('❌ Save error:', err));
}


function addStripeAccount ({user_id, account_id}){
    const  stripeAccount = new StripeAccount({
        user_id,
        account_id
    })

    stripeAccount.save()
    .then(savedAccount => {
      console.log('📦 Stripe Account saved:', savedAccount);
    })
    .catch(err => console.error('❌ Save error:', err));
}

async function findStripeAccount ({user_id}){
    
    const stripeAccount = await StripeAccount.findOne({user_id})

    return stripeAccount;
}

export { addPlanData, findStripeCustomerId, addStripeCustomer,addStripeAccount,findStripeAccount };
