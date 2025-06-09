import { NextRequest, NextResponse } from 'next/server';
import { 
  handlePaymentSuccess, 
  handlePaymentFailure, 
  handlePaymentRefund 
} from '@/services/server/paymentHooks.server';
import { recordDonation } from '@/services/server/donationService.server';
import Stripe from 'stripe';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-05-28.basil'
});

// POST /api/webhooks/stripe
// Handle Stripe webhook events
export async function POST(request: NextRequest) {
  try {
    // Get the raw body and signature header
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature') || '';

    // Get the webhook endpoint secret from environment
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!endpointSecret) {
      console.error('Missing STRIPE_WEBHOOK_SECRET');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    } catch (err) {
      console.error('⚠️ Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle different event types
    let result;
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`✅ Payment succeeded for intent ${paymentIntent.id} with amount ${paymentIntent.amount}`);
        
        const metadata = paymentIntent.metadata || {};
        
        // Check if this is a donation payment
        if (metadata.donationType === 'one-time') {
          console.log(`Processing donation payment: ${paymentIntent.id}`);
          
          // Record the donation in the database
          const donationResult = await recordDonation({
            amount: paymentIntent.amount / 100, // Convert from cents to dollars
            currency: paymentIntent.currency,
            stripe_payment_id: paymentIntent.id,
            donor_email: metadata.donorEmail || undefined,
            donor_name: metadata.donorName || undefined,
            fund_designation: metadata.fundDesignation || undefined,
            is_recurring: false,
            metadata: metadata
          });
          
          if (!donationResult.success) {
            console.error(`Error recording donation: ${donationResult.error}`);
          }
        } else if (metadata.registrationId) {
          // This is an event registration payment
          result = await handlePaymentSuccess(
            paymentIntent.id,
            paymentIntent.amount
          );
        }
        
        // Log the payment success for tracking
        console.info(`Payment processed successfully: ${JSON.stringify({
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          donationType: metadata.donationType || 'unknown',
          registrationId: metadata.registrationId || undefined,
          eventId: metadata.eventId || undefined,
          timestamp: new Date().toISOString()
        })}`);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const failureMessage = paymentIntent.last_payment_error?.message;
        console.warn(`⚠️ Payment failed for intent ${paymentIntent.id}: ${failureMessage}`);
        
        result = await handlePaymentFailure(
          paymentIntent.id,
          failureMessage
        );
        
        // Log the failure details for troubleshooting
        console.warn(`Payment failure details: ${JSON.stringify({
          paymentIntentId: paymentIntent.id,
          failureMessage,
          code: paymentIntent.last_payment_error?.code,
          registrationId: paymentIntent.metadata?.registrationId,
          eventId: paymentIntent.metadata?.eventId,
          timestamp: new Date().toISOString()
        })}`);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        if (charge.payment_intent) {
          result = await handlePaymentRefund(
            typeof charge.payment_intent === 'string' 
              ? charge.payment_intent 
              : charge.payment_intent.id
          );
        }
        break;
      }
      
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`🔄 New subscription created: ${subscription.id}`);
        // The subscription is already recorded when created through our API
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`🔄 Subscription updated: ${subscription.id}`);
        
        // Get database connection
        const { serverSupabase } = await import('@/services/server/eventService.server');
        
        // Update the subscription in the database
        const { error } = await serverSupabase
          .from('recurring_donations')
          .update({ 
            status: subscription.status,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);
          
        if (error) {
          console.error(`Error updating subscription in database: ${error.message}`);
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`❌ Subscription canceled: ${subscription.id}`);
        
        // Get database connection
        const { serverSupabase } = await import('@/services/server/eventService.server');
        
        // Update the subscription status in the database
        const { error } = await serverSupabase
          .from('recurring_donations')
          .update({ 
            status: 'canceled',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);
          
        if (error) {
          console.error(`Error updating subscription in database: ${error.message}`);
        }
        break;
      }
      
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        
        // Only process if this is a subscription invoice
        // The subscription property might be a string or Subscription object, but needs to be accessed via type casting
        const subscriptionId = typeof (invoice as any).subscription === 'string' 
          ? (invoice as any).subscription 
          : (invoice as any).subscription?.id;
          
        if (subscriptionId) {
          console.log(`💰 Subscription invoice paid: ${invoice.id} for subscription ${subscriptionId}`);
          
          try {
            // Get the subscription to access metadata
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const metadata = subscription.metadata || {};
            
            // Record as a donation if it's our donation subscription
            if (metadata.donationType === 'recurring') {
              // Handle payment_intent property that might not be in the type
              const paymentIntentId = (invoice as any).payment_intent;
              
              const donationResult = await recordDonation({
                amount: invoice.amount_paid / 100, // Convert from cents to dollars
                currency: invoice.currency,
                stripe_payment_id: typeof paymentIntentId === 'string' ? paymentIntentId : paymentIntentId?.id,
                donor_email: metadata.donorEmail || undefined,
                donor_name: metadata.donorName || undefined,
                fund_designation: metadata.fundDesignation || undefined,
                is_recurring: true,
                frequency: metadata.frequency || undefined,
                stripe_subscription_id: subscriptionId,
                metadata: metadata
              });
              
              if (!donationResult.success) {
                console.error(`Error recording recurring donation: ${donationResult.error}`);
              }
              
              // Update next payment date in recurring_donations
              const { serverSupabase } = await import('@/services/server/eventService.server');
              const { error } = await serverSupabase
                .from('recurring_donations')
                .update({ 
                  next_payment_date: (subscription as any).current_period_end ? 
                    new Date((subscription as any).current_period_end * 1000).toISOString() : null,
                  updated_at: new Date().toISOString()
                })
                .eq('stripe_subscription_id', subscriptionId);
                
              if (error) {
                console.error(`Error updating next payment date: ${error.message}`);
              }
            }
          } catch (err) {
            console.error('Error processing subscription invoice:', err);
          }
        }
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        // Handle subscription property that might not be in the type
        const subscriptionId = (invoice as any).subscription;
        
        if (subscriptionId) {
          console.warn(`⚠️ Subscription invoice payment failed: ${invoice.id}`);
          
          // Get database connection
          const { serverSupabase } = await import('@/services/server/eventService.server');
          
          // Update subscription status
          const { error } = await serverSupabase
            .from('recurring_donations')
            .update({ 
              status: 'payment_failed',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', typeof subscriptionId === 'string' ? subscriptionId : subscriptionId.id);
            
          if (error) {
            console.error(`Error updating subscription status: ${error.message}`);
          }
          
          // TODO: Send notification to donor and/or admin
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
        return NextResponse.json({ received: true });
    }

    // Handle any errors from our payment hooks
    if (result && !result.success) {
      console.error(`Error processing ${event.type}:`, result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    // Return successful response
    return NextResponse.json({
      received: true,
      type: event.type,
      id: event.id
    });
  } catch (error) {
    console.error('Error in Stripe webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
