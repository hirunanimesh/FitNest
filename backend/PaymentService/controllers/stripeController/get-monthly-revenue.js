import stripe from "../../lib/stripe.js";
import { findStripeAccount } from "../mongoController/add-plan-data.js";

export default async function getRevenue(req, res) {
  const { userId } = req.params;
  const accountId = await findStripeAccount({ user_id: userId });

  if (!accountId) {
    return res.status(200).json({ message: "Missing accountId", totalRevenue: 0, currentMonthRevenue: 0 });
  }

  // First day of current month
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  try {
    // Fetch all charges for this account
    const charges = await stripe.charges.list(
      { limit: 1000 }, // adjust for pagination if needed
      { stripeAccount: accountId.account_id }
    );

    if (!charges || charges.data.length === 0) {
      return res.status(200).json({ message: "No charges found", totalRevenue: 0, currentMonthRevenue: 0 });
    }

    let totalRevenue = 0;
    let currentMonthRevenue = 0;

    charges.data.forEach(charge => {
      if (charge.paid && !charge.refunded) {
        const chargeDate = new Date(charge.created * 1000);
        totalRevenue += charge.amount / 100; // convert cents → dollars/rupees
        if (chargeDate >= startOfMonth) {
          currentMonthRevenue += charge.amount / 100;
        }
      }
    });

    res.status(200).json({
      message: "Success fetching revenue",
      totalRevenue,
      currentMonthRevenue,
    });
  } catch (error) {
    console.error("Error fetching charges:", error);
    res.status(500).json({ message: "Error fetching revenue", totalRevenue: 0, currentMonthRevenue: 0 });
  }
}
