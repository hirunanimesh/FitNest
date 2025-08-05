import stripe from '../../lib/stripe.js'

export default async function getInvoices(req,res) {
    const {customer_id} = req.body;

    const invoices = await stripe.invoices.list({
        customer: customer_id,
        limit: 10, 
      });
    if (!invoices || invoices.data.length === 0) {
        return res.status(404).json({ error: 'No invoices found for this customer.' });
    }
    res.json({invoice_pdf:invoices.data[0].invoice_pdf, invoice_link:invoices.data[0].hosted_invoice_url});
}
