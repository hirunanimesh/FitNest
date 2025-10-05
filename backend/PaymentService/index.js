import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'
import createPlan from './controllers/stripeController/create-plan.js';
import createAccount from './controllers/stripeController/create-account.js';
import subscribe from './controllers/stripeController/subscribe.js';
import getInvoices from './controllers/stripeController/get-invoices.js';
import getSubscriptions from './controllers/stripeController/get-subscription.js';
import getDashboardLink from './controllers/stripeController/dashboard.js';
import getPaymentList from './controllers/stripeController/get-payments.js';
import connectDatabase from './database/mongo.js';
import getConnectedAccountPayments from './controllers/stripeController/get-connected-account-payments.js';
import oneTimePayment from './controllers/stripeController/one-time-payment.js';
import getCurrentMonthRevenue from './controllers/stripeController/get-monthly-revenue.js';
import { GymPlanCreatedConsumer, GymPlanDeletedConsumer, GymPlanPriceUpdatedConsumer, TrainerSessionCreatedConsumer } from './kafka/Consumer.js';
import cancelSubscription from './controllers/stripeController/cancel-subscription.js';
import getCustomersByGymPlans from './controllers/stripeController/get-customer-ids.js';
import getMonthlyMembers from './controllers/stripeController/get-monthly-members.js';
import SessionPayment from './controllers/stripeController/session-payment.js';
import releaseSessionHandler from './controllers/stripeController/release-session.js';
import stripeWebhook from './controllers/stripeController/webhook.js';
import successSessionHandler from './controllers/stripeController/success-session.js';
import systemRevenue from './controllers/stripeController/system-revenue.js';
import SubscriptionEmailService from './services/SubscriptionEmailService.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

connectDatabase()

app.use('/create-plan',createPlan)
app.use('/create-account/:user_id', createAccount);
app.use('/subscribe',subscribe)
app.use('/cancel-subscription', cancelSubscription)
app.use('/getinvoices',getInvoices)
app.use('/getsubscription/:customerId',getSubscriptions)
app.use('/getpayments',getPaymentList)
app.get('/stripedashboard/:user_id',getDashboardLink)
app.use('/connectedaccountpayments/:userId',getConnectedAccountPayments)
app.use('/onetimepayment',oneTimePayment)
app.use('/monthlyrevenue/:userId',getCurrentMonthRevenue)
app.use('/getgymcustomerids',getCustomersByGymPlans)
app.post('/monthlymembers', getMonthlyMembers)
app.post('/sessionpayment', SessionPayment)
// cancel handler to release holds and redirect
app.get('/sessionpayment/cancel', releaseSessionHandler)
// success handler to finalize booking and redirect
app.get('/sessionpayment/success', successSessionHandler)
app.post('/webhook', stripeWebhook)
// Test endpoint for subscription webhook simulation
app.post('/test-subscription-webhook', (req, res) => {
    console.log('🧪 Test subscription webhook triggered');
    
    // Simulate a subscription webhook event
    const testEvent = {
        type: 'checkout.session.completed',
        id: 'evt_test_123',
        data: {
            object: {
                id: 'cs_test_123',
                mode: 'subscription',
                subscription: 'sub_test_123',
                metadata: {
                    user_id: req.body.user_id || 'test_user_123',
                    plan_id: req.body.plan_id || 'test_plan_123'
                },
                customer_details: {
                    email: req.body.email || 'test@example.com'
                }
            }
        }
    };
    
    // Call the webhook handler
    req.body = testEvent;
    stripeWebhook(req, res);
});

// Test endpoint to send email directly without API dependencies
app.post('/test-direct-email', async (req, res) => {
    console.log('🧪 Direct email test triggered with body:', req.body);
    
    try {
        console.log('📦 Creating SubscriptionEmailService instance...');
        const subscriptionEmailService = new SubscriptionEmailService();
        console.log('📦 SubscriptionEmailService instance created');
        
        const emailAddress = req.body.customer_email || req.body.email || 'vidura.22@cse.mrt.ac.lk';
        console.log('📧 Sending test email to:', emailAddress);
        
        await subscriptionEmailService.sendSubscriptionConfirmationEmail(
            emailAddress,
            'Test User',
            'Test Gym',
            'Premium Plan',
            '$99.99',
            '1 month',
            'sub_test_123'
        );
        
        console.log('✅ Test email sent successfully');
        res.json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('❌ Direct email test error:', error);
        console.error('❌ Error stack:', error.stack);
        res.status(500).json({ error: error.message });
    }
});
app.get('/getsystemrevenue',systemRevenue )

GymPlanCreatedConsumer()
GymPlanDeletedConsumer()
GymPlanPriceUpdatedConsumer()
TrainerSessionCreatedConsumer()


app.listen(process.env.PORT || 3003, () => {
    console.log(`Payment Service is running on port ${process.env.PORT || 3003}`);
})