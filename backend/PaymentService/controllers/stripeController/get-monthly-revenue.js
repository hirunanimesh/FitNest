import stripe from "../../lib/stripe.js";
import { findStripeAccount } from "../mongoController/add-plan-data.js";

export default async function getCurrentMonthRevenue(req,res) {
    const {userId} = req.params
    console.log(userId)
    const accountId = await findStripeAccount({user_id:userId})
    console.log(accountId)
  // First day of current month
  const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  // Current date/time
  const endDate = new Date();

  if(!accountId){
    return res.status(200).json({ message: "Missing accountId parameter" , revenue:0});
  }
  const charges = await stripe.charges.list(
    {
      created: {
        gte: Math.floor(startDate.getTime() / 1000), // start of month
        lte: Math.floor(endDate.getTime() / 1000),   // now
      },
      limit: 100, // fetch latest 100, paginate if needed
    },
    { stripeAccount: accountId.account_id } // connected account
  );
    if (!charges || charges.data.length === 0) {
        return res.status(200).json({ message: "No charges for this account in the current month", revenue:0 });
    }
  // Sum gross revenue (only successful charges)
  const total = charges.data.reduce((sum, charge) => {
    return charge.paid && !charge.refunded ? sum + charge.amount : sum;
  }, 0);

    res.status(200).json({ message: "Success fetching current month revenue", revenue: total / 100 }); // convert cents → dollars/rupees
}
