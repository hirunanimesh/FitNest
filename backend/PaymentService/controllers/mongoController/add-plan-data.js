import StripePlanData from '../../models/stripe_plan_data.js'
import StripeCustomer from '../../models/stripe_customer.js'

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

export { addPlanData, findStripeCustomerId, addStripeCustomer };
