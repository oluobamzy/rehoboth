import { NextRequest, NextResponse } from 'next/server';
import { 
  handlePaymentSuccess, 
  handlePaymentFailure, 
  handlePaymentRefund 
} from '@/services/server/paymentHooks.server';
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
        
        result = await handlePaymentSuccess(
          paymentIntent.id,
          paymentIntent.amount
        );
        
        // Log the payment success for tracking
        console.info(`Payment processed successfully: ${JSON.stringify({
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          registrationId: paymentIntent.metadata?.registrationId,
          eventId: paymentIntent.metadata?.eventId,
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
