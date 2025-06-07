// Server-side payment service functions
// This file should only be imported in server components or API routes

import Stripe from 'stripe';
import { serverSupabase } from './eventService.server';

// Initialize Stripe with the secret key (should be in .env)
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2025-05-28.basil' }) : null;

// Check if Stripe is properly configured
if (!stripe) {
  console.error('⚠️ Server: Stripe is not properly configured. Please set STRIPE_SECRET_KEY in .env');
}

/**
 * Create a payment intent for an event registration
 */
export async function createPaymentIntent({
  eventId,
  registrationId,
  amount,
  currency = 'usd',
  metadata = {},
}: {
  eventId: string;
  registrationId: string;
  amount: number; // amount in cents
  currency?: string;
  metadata?: Record<string, string>;
}) {
  try {
    if (!stripe) {
      console.error('Server: Stripe not initialized');
      return { success: false, error: 'Payment service not configured' };
    }

    // Fetch event details to include in metadata
    const { data: event } = await serverSupabase
      .from('events')
      .select('title')
      .eq('id', eventId)
      .single();

    // Create the payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        eventId,
        registrationId,
        eventTitle: event?.title || 'Event registration',
        ...metadata,
      },
    });

    // Update the registration with the payment intent ID
    const { error: updateError } = await serverSupabase
      .from('event_registrations')
      .update({ payment_intent_id: paymentIntent.id })
      .eq('id', registrationId);

    if (updateError) {
      console.error('Server: Error updating registration with payment intent:', updateError);
    }

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Server: Error creating payment intent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment',
    };
  }
}

/**
 * Handle a Stripe webhook event
 */
export async function handleStripeWebhook(payload: string, signature: string) {
  try {
    if (!stripe) {
      console.error('Server: Stripe not initialized');
      return { success: false, error: 'Payment service not configured' };
    }

    // Get the webhook endpoint secret from environment
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!endpointSecret) {
      console.error('Server: Missing STRIPE_WEBHOOK_SECRET');
      return { success: false, error: 'Webhook secret not configured' };
    }

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    } catch (err) {
      console.error('Server: Webhook signature verification failed:', err);
      return { success: false, error: 'Webhook signature verification failed' };
    }

    // Process the event based on type
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Get metadata from the payment intent
        const { registrationId } = paymentIntent.metadata;
        
        if (registrationId) {
          // Update registration payment status to 'paid'
          const { error } = await serverSupabase
            .from('event_registrations')
            .update({ payment_status: 'paid' })
            .eq('id', registrationId);
            
          if (error) {
            console.error('Server: Error updating payment status:', error);
            return { success: false, error: 'Failed to update payment status' };
          }
        }
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Log payment failure
        console.log('Server: Payment failed for intent:', paymentIntent.id);
        break;
      }
      
      // Add other Stripe event types here as needed
    }

    return { success: true, event: event.type };
  } catch (error) {
    console.error('Server: Error handling webhook:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Webhook processing failed',
    };
  }
}
