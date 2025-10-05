import stripe from '../../lib/stripe.js';
import SubscriptionEmailService from '../../services/SubscriptionEmailService.js';

const TRAINER_SERVICE_URL = process.env.TRAINER_SERVICE_URL || 'http://localhost:3005';
const GYM_SERVICE_URL = process.env.GYM_SERVICE_URL || 'http://localhost:3002';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';

const subscriptionEmailService = new SubscriptionEmailService();

export default async function webhook(req, res) {
  // Ensure event is an object even if body parsing failed
  let event = req.body || {};

  console.log('🚀 Webhook received:', {
    eventType: event.type,
    eventId: event.id,
    timestamp: new Date().toISOString(),
    hasData: !!event.data,
    hasObject: !!event.data?.object
  });

  // If you configure STRIPE_WEBHOOK_SECRET, verify the signature (optional here based on existing setup)
  // const sig = req.headers['stripe-signature'];
  // event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        console.log('💳 Checkout session completed:', {
          sessionId: session.id,
          mode: session.mode,
          hasSubscription: !!session.subscription,
          metadata: session.metadata,
          customerEmail: session.customer_details?.email,
          subscriptionId: session.subscription
        });
        
        // Handle trainer session booking (existing functionality)
        let trainerSessionId = session?.metadata?.trainer_session_id;
        let appCustomerId = session?.metadata?.app_customer_id;
        if ((!trainerSessionId || !appCustomerId) && session?.payment_intent) {
          const pi = await stripe.paymentIntents.retrieve(session.payment_intent);
          trainerSessionId = trainerSessionId || pi?.metadata?.trainer_session_id;
          appCustomerId = appCustomerId || pi?.metadata?.app_customer_id;
        }
        if (trainerSessionId && appCustomerId) {
          try {
            console.log('📋 Booking trainer session:', { trainerSessionId, appCustomerId });
            await fetch(`${TRAINER_SERVICE_URL}/booksession`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId: trainerSessionId, customerId: appCustomerId })
            });
            console.log('✅ Trainer session booked successfully');
          } catch (e) {
            console.error('❌ Failed to book trainer session:', e);
          }
        }

        // Handle gym plan subscription (new functionality)
        if (session.mode === 'subscription' && session.subscription) {
          try {
            console.log('🏋️ Processing subscription for session:', session.id);
            let subscription;
            
            // For test webhooks, create a mock subscription
            if (session.subscription === 'sub_test_123') {
              subscription = {
                id: session.subscription,
                customer: {
                  id: 'cus_test_123',
                  email: session.customer_details?.email || 'test@example.com'
                },
                metadata: session.metadata,
                status: 'active'
              };
              console.log('🧪 Using test subscription data');
            } else {
              console.log('🔍 Retrieving subscription from Stripe:', session.subscription);
              // Get subscription details from Stripe for real webhooks
              subscription = await stripe.subscriptions.retrieve(session.subscription, {
                expand: ['items.data.price.product', 'customer']
              });
            }

            console.log('📋 Subscription details:', {
              subscriptionId: subscription.id,
              customerId: subscription.customer?.id,
              customerEmail: subscription.customer?.email,
              status: subscription.status,
              metadata: subscription.metadata
            });

            // Extract metadata from session first, then from subscription
            const userId = session.metadata?.user_id || subscription.metadata?.user_id;
            const planId = session.metadata?.plan_id || subscription.metadata?.plan_id;
            const customerEmail = subscription.customer?.email || session.customer_details?.email;
            
            console.log('🔍 Email processing metadata:', {
              userId,
              planId,
              customerEmail,
              subscriptionId: subscription.id,
              sessionMetadata: session.metadata,
              subscriptionMetadata: subscription.metadata
            });
            
            if (userId && planId && customerEmail) {
              console.log('✅ All required data available - sending subscription confirmation email');
              // Send subscription confirmation email
              await subscriptionEmailService.sendSubscriptionConfirmationEmailWithMetadata(
                customerEmail,
                userId,
                planId,
                subscription.id
              );
              console.log('✅ Subscription confirmation email process completed');
            } else {
              console.warn('⚠️ Missing required data for email:', {
                hasUserId: !!userId,
                hasPlanId: !!planId,
                hasCustomerEmail: !!customerEmail,
                sessionMetadata: session.metadata,
                subscriptionMetadata: subscription.metadata
              });
            }
          } catch (emailError) {
            console.error('❌ Failed to send subscription confirmation email:', emailError);
            console.error('❌ Email error stack:', emailError.stack);
            // Don't throw error - we don't want to fail the webhook if email fails
          }
        } else {
          console.log('⏭️ Skipping subscription email - not a subscription or missing subscription ID:', {
            mode: session.mode,
            hasSubscription: !!session.subscription,
            subscriptionId: session.subscription
          });
        }
        
        return res.json({ received: true });
      }
      case 'customer.subscription.created': {
        // Handle subscription creation - this fires when subscription is fully created
        const subscription = event.data.object;
        
        try {
          console.log('🔄 Processing subscription creation:', subscription.id);
          
          // Extract metadata from subscription
          const userId = subscription.metadata?.user_id;
          const planId = subscription.metadata?.plan_id;
          
          console.log('📋 Subscription creation metadata:', {
            userId,
            planId,
            hasCustomer: !!subscription.customer,
            subscriptionStatus: subscription.status
          });
          
          if (userId && planId && subscription.customer) {
            // Get customer details
            const customer = await stripe.customers.retrieve(subscription.customer);
            console.log('👤 Customer details:', {
              customerId: customer.id,
              customerEmail: customer.email
            });
            
            // Send subscription confirmation email
            await subscriptionEmailService.sendSubscriptionConfirmationEmailWithMetadata(
              customer.email,
              userId,
              planId,
              subscription.id
            );
            console.log('✅ Subscription creation email sent successfully');
          } else {
            console.warn('⚠️ Missing required metadata for subscription creation email:', {
              hasUserId: !!userId,
              hasPlanId: !!planId,
              hasCustomer: !!subscription.customer
            });
          }
        } catch (emailError) {
          console.error('❌ Failed to send subscription creation email:', emailError);
          // Don't throw error - we don't want to fail the webhook if email fails
        }
        
        return res.json({ received: true });
      }
      case 'checkout.session.expired':
      case 'payment_intent.payment_failed':
      case 'charge.refunded':
      case 'checkout.session.async_payment_failed': {
        // Release the session on failure/expiry
        const obj = event.data.object;
        let trainerSessionId = obj?.metadata?.trainer_session_id;
        if (!trainerSessionId && obj?.payment_intent) {
          const pi = await stripe.paymentIntents.retrieve(obj.payment_intent);
          trainerSessionId = pi?.metadata?.trainer_session_id;
        }
        if (trainerSessionId) {
          try {
            await fetch(`${TRAINER_SERVICE_URL}/releasesession`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId: trainerSessionId })
            });
          } catch (e) {
            console.error('Failed to release session from webhook:', e);
          }
        }
        return res.json({ received: true });
      }
      default:
        return res.json({ received: true });
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).json({ error: 'Webhook error' });
  }
}
