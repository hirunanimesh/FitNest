import express from 'express';
import { sendSubscriptionEmail } from '../controllers/subscription.email.controller.js';

const router = express.Router();

router.post('/send-subscription-email', sendSubscriptionEmail);

export default router;
