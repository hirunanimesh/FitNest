import express from 'express';
import cors from 'cors';
import createPlan from './controllers/stripeController/create-plan.js';
import createAccount from './controllers/stripeController/create-account.js';
import subscribe from './controllers/stripeController/subscribe.js';
import getInvoices from './controllers/stripeController/get-invoices.js';
import getSubscriptions from './controllers/stripeController/get-subscription.js';
import getDashboardLink from './controllers/stripeController/dashboard.js';
import getPaymentList from './controllers/stripeController/get-payments.js';
import connectDatabase from './database/mongo.js';

const app = express();

app.use(express.json());
app.use(cors());

connectDatabase()

app.use('/create-plan',createPlan)
app.use('/create-account', createAccount);
app.use('/subscribe',subscribe)
app.use('/getinvoices',getInvoices)
app.use('/getsubscription',getSubscriptions)
app.use('/getpayments',getPaymentList)
app.use('/stripedashboard',getDashboardLink)


app.listen(process.env.PORT || 3005, () => {
    console.log(`Payment Service is running on port ${process.env.PORT || 3005}`);
})