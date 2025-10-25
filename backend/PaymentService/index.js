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

dotenv.config();

const app = express();

connectDatabase()

app.use(cors());
// IMPORTANT: Stripe webhook must be defined BEFORE any JSON body parsing
app.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Now enable JSON/urlencoded parsing for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.get('/', (req, res) => {
    res.send('Payment Service is running')
})
app.get('/getsystemrevenue',systemRevenue )

GymPlanCreatedConsumer()
GymPlanDeletedConsumer()
GymPlanPriceUpdatedConsumer()
TrainerSessionCreatedConsumer()


app.listen(process.env.PORT || 3003, () => {
    console.log(`Payment Service is running on port ${process.env.PORT || 3003}`);
})