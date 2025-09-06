import stripe from "../../lib/stripe.js";
import { findStripeAccount } from "../mongoController/add-plan-data.js";

export default async function getRevenue(req, res) {
  const { userId } = req.params;
  const accountId = await findStripeAccount({ user_id: userId });

  if (!accountId) {
    return res.status(200).json({
      message: "Missing accountId",
      totalRevenue: 0,
      currentMonthRevenue: 0,
      monthlyRevenue: []
    });
  }

  // First day of current year
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);

  try {
    // Fetch all charges for this account
    const charges = await stripe.charges.list(
      { limit: 1000 }, // adjust with pagination if needed
      { stripeAccount: accountId.account_id }
    );

    if (!charges || charges.data.length === 0) {
      return res.status(200).json({
        message: "No charges found",
        totalRevenue: 0,
        currentMonthRevenue: 0,
        monthlyRevenue: []
      });
    }

    let totalRevenue = 0;
    let currentMonthRevenue = 0;

    // Initialize monthlyRevenue array with 12 months
    const monthlyRevenue = Array(12).fill(0);

    charges.data.forEach(charge => {
      if (charge.paid && !charge.refunded) {
        const chargeDate = new Date(charge.created * 1000);
        const amount = charge.amount / 100; // cents → currency

        totalRevenue += amount;

        // Current month revenue
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        if (chargeDate >= startOfMonth) {
          currentMonthRevenue += amount;
        }

        // If charge is in this year, group by month
        if (chargeDate >= startOfYear) {
          const monthIndex = chargeDate.getMonth(); // 0 = Jan, 11 = Dec
          monthlyRevenue[monthIndex] += amount;
        }
      }
    });

    res.status(200).json({
      message: "Success fetching revenue",
      totalRevenue,
      currentMonthRevenue,
      monthlyRevenue // array of 12 numbers (Jan → Dec)
    });
  } catch (error) {
    console.error("Error fetching charges:", error);
    res.status(500).json({
      message: "Error fetching revenue",
      totalRevenue: 0,
      currentMonthRevenue: 0,
      monthlyRevenue: []
    });
  }
}
