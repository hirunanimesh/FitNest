import StripePlanData from '../../models/stripe_plan_data.js'
import StripeCustomer from '../../models/stripe_customer.js'
import StripeAccount from '../../models/stripe_account.js';
import StripeSession from '../../models/stripe_session.js';

function addPlanData ({plan_id,product_id,price_id}){

    const plan_data = new StripePlanData({
        plan_id,
        product_id,
        price_id
    })

    plan_data.save()
    .then(savedPlan => {
      console.log('📦 Plan saved:', savedPlan);
    })
    .catch(err => console.error('❌ Save error:', err));
}

async function deletePlanData (plan_id){

    const deletedPlan = await StripePlanData.findOneAndDelete({plan_id})
    .then(deletedPlan => {
      console.log('📦 User deleted:', deletedPlan);
    })
    .catch(err => console.error('❌ Delete error:', err));
}

async function updatePlanPrice({plan_id,new_price_id}) {
    try {
        const updatedPlan = await StripePlanData.findOneAndUpdate(
            { plan_id },
            { price_id: new_price_id },
            { new: true }
        );
        console.log('📦 Plan updated:', updatedPlan);
        return updatedPlan;
    } catch (err) {
        console.error('❌ Update error:', err);
        throw err;
    }
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

async function findStripePriceId ({planId}){
    const stripe_plan = await StripePlanData.findOne({plan_id:planId})
    return stripe_plan;
}

async function findPlansByProductId({product_id}){
    const plans = await StripePlanData.find({
        product_id: { $in: product_id },
      });
    return plans;
}

async function findPlansByPlanIds({plan_ids}){
    const plans = await StripePlanData.find({
        plan_id: { $in: plan_ids },
      });
    return plans;
}

async function findCustomerByStripeId({stripe_customer_id}){
    const customer = await StripeCustomer.findOne({stripe_customer_id})
    return customer;
}

async function addSession({session_id,product_id,price_id}){
    const session = new StripeSession({
        session_id,
        price_id,
        product_id
    })
    session.save()
    .then(savedSession => {
      console.log('📦 Session saved:', savedSession);
    })
    .catch(err => console.error('❌ Save error:', err));
}

export { addPlanData, findStripeCustomerId, addStripeCustomer,addStripeAccount,findStripeAccount,deletePlanData, 
    findStripePriceId,findPlansByProductId,findPlansByPlanIds,findCustomerByStripeId,updatePlanPrice,addSession};
