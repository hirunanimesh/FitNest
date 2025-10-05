import stripe from '../../lib/stripe.js';

export default async function systemRevenue(req, res) {
    try {
        const startOfYear = new Date(new Date().getFullYear(), 0, 1); // Jan 1 current year
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

        let totalRevenue = 0;            // all time
        let yearTotalRevenue = 0;        // current year
        let currentMonthRevenue = 0;     // current month
        const monthlyRevenue = Array(12).fill(0); // index 0 = Jan

        // Paginate over application fees (platform's collected fees)
        let hasMore = true;
        let startingAfter = undefined;
        let pageCounter = 0;
        const MAX_PAGES = 50; // safety cap (50 * 100 = 5000 fees per request cycle)

        while (hasMore && pageCounter < MAX_PAGES) {
            pageCounter++;
            const page = await stripe.applicationFees.list({
                limit: 100,
                ...(startingAfter ? { starting_after: startingAfter } : {})
            });

            if (!page || !page.data) break;

            for (const fee of page.data) {
                const amount = fee.amount / 100; // convert cents
                totalRevenue += amount;
                const createdDate = new Date(fee.created * 1000);

                if (createdDate >= startOfYear) {
                    yearTotalRevenue += amount;
                    const monthIdx = createdDate.getMonth();
                    monthlyRevenue[monthIdx] += amount;
                    if (createdDate >= startOfMonth) {
                        currentMonthRevenue += amount;
                    }
                }
            }

            hasMore = page.has_more === true;
            if (hasMore) {
                const last = page.data[page.data.length - 1];
                startingAfter = last.id;
            }

        }

        // If there were no fees at all
        if (totalRevenue === 0) {
            return res.status(200).json({
                message: 'No application fees found',
                totalRevenue: 0,
                yearTotalRevenue: 0,
                currentMonthRevenue: 0,
                monthlyRevenue
            });
        }

        return res.status(200).json({
            message: 'System revenue summary',
            totalRevenue: Number(totalRevenue.toFixed(2)),
            yearTotalRevenue: Number(yearTotalRevenue.toFixed(2)),
            currentMonthRevenue: Number(currentMonthRevenue.toFixed(2)),
            monthlyRevenue: monthlyRevenue.map(v => Number(v.toFixed(2)))
        });
    } catch (error) {
        console.error('Error fetching system revenue:', error);
        return res.status(500).json({
            message: 'Error fetching system revenue',
            totalRevenue: 0,
            yearTotalRevenue: 0,
            currentMonthRevenue: 0,
            monthlyRevenue: Array(12).fill(0)
        });
    }
}