import stripe from '../../lib/stripe.js';
import { findPlansByPlanIds } from '../mongoController/add-plan-data.js';

// Helper to get the last 12 months labels and ranges
function getLast12Months() {
  const months = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    d.setUTCMonth(d.getUTCMonth() - i);
    const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0));
    const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 23, 59, 59));
    const label = start.toLocaleString('en-US', { month: 'short' });
    months.push({
      key: `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, '0')}`,
      label,
      year: start.getUTCFullYear(),
      startTs: Math.floor(start.getTime() / 1000),
      endTs: Math.floor(end.getTime() / 1000),
    });
  }
  return months;
}

export default async function getMonthlyMembers(req, res) {
  try {
    const { gymPlans } = req.body; // array of { plan_id }
    if (!gymPlans || !Array.isArray(gymPlans) || gymPlans.length === 0) {
      return res.status(400).json({ error: 'gymPlans must be a non-empty array' });
    }

    // 1) Map plan_ids -> product_ids via Mongo mapping
    const planIds = gymPlans.map((p) => p.plan_id);
    const plans = await findPlansByPlanIds({ plan_ids: planIds });
    if (!plans || plans.length === 0) {
      return res.status(200).json({ data: [], message: 'No matching Stripe products for plans' });
    }
    const productIds = plans.map((p) => p.product_id);

    // Determine which plan prices are recurring (Stripe only allows filtering subscriptions by recurring prices)
    const recurringPriceIds = [];
    for (const p of plans) {
      if (!p.price_id) continue;
      try {
        const price = await stripe.prices.retrieve(p.price_id);
        if (price?.type === 'recurring' || price?.recurring) {
          recurringPriceIds.push(p.price_id);
        }
      } catch (e) {
        // ignore invalid price ids
      }
    }

    // 2) Pull subscriptions from Stripe filtered by plan price_ids to reduce scanning
    //    We'll paginate manually to avoid SDK auto-paging helpers.
    //    Note: We prefer filtering by price over product since the API supports 'price' filter.
  const priceIds = recurringPriceIds;
    const relevantSubsMap = new Map(); // id -> subscription

    async function listAllSubscriptionsByPrice(priceId) {
      let starting_after = undefined;
      // Stripe supports filtering subscriptions by price
      while (true) {
        const page = await stripe.subscriptions.list({
          limit: 100,
          price: priceId,
          ...(starting_after ? { starting_after } : {}),
        });
        for (const sub of page.data) {
          // Extra safety: ensure at least one item matches our productIds
          const matches = sub.items?.data?.some((item) => productIds.includes(item.price?.product));
          if (matches) {
            relevantSubsMap.set(sub.id, sub);
          }
        }
        if (page.has_more) {
          starting_after = page.data[page.data.length - 1]?.id;
        } else {
          break;
        }
      }
    }

  // If we don't have any recurring priceIds (one-time or unsynced), fall back to broad scan with manual pagination
  if (priceIds.length === 0) {
      let starting_after = undefined;
      while (true) {
        const page = await stripe.subscriptions.list({ limit: 100, ...(starting_after ? { starting_after } : {}) });
        for (const sub of page.data) {
          const matches = sub.items?.data?.some((item) => productIds.includes(item.price?.product));
          if (matches) {
            relevantSubsMap.set(sub.id, sub);
          }
        }
        if (page.has_more) {
          starting_after = page.data[page.data.length - 1]?.id;
        } else {
          break;
        }
      }
    } else {
      // Query per price id to limit scope and API load
      for (const priceId of priceIds) {
        await listAllSubscriptionsByPrice(priceId);
      }
    }
    const relevantSubs = Array.from(relevantSubsMap.values());

    // 3) Build monthly active member counts (unique Stripe customers per month)
    const months = getLast12Months();
    const result = months.map((m) => ({ month: m.label, year: m.year, members: 0 }));

    // For each month, count unique stripe customer ids that were active in that month
    months.forEach((m, idx) => {
      const seen = new Set();
      for (const sub of relevantSubs) {
        const created = sub.created; // unix sec
        const canceledAt = sub.canceled_at || sub.ended_at || null; // unix sec or null
        // Consider active in month if it overlaps the month window
        const overlaps = created <= m.endTs && (!canceledAt || canceledAt >= m.startTs);
        // Exclude incomplete (never paid) subscriptions
        const status = sub.status;
        const isIncomplete = status === 'incomplete' || status === 'incomplete_expired';
        if (overlaps && !isIncomplete) {
          seen.add(sub.customer);
        }
      }
      result[idx].members = seen.size;
    });

    return res.json({ data: result });
  } catch (err) {
    console.error('getMonthlyMembers error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
