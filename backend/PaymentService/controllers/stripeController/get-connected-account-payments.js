import stripe from "../../lib/stripe.js";

// this is for get account payment that they receive
export default async function getConnectedAccountPayments(req,res){
    const account_id = req.body;
    console.log("Accoun ID: ",account_id.account_id)
    try {
        const charges = await stripe.charges.list(
          { limit: 10 },   
          { stripeAccount: account_id.account_id }  
        );
        if(!charges){
            return res.json({message:"No charges for this account"})
        }else{
            return res.json({message:"Success fetching charges", data: charges.data})
        }
      } catch (err) {
        console.error("❌ Error fetching charges:", err);
        throw err;
      }
}