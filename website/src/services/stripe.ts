// src/services/stripe.ts
import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('Stripe publishable key not provided in environment variables');
}

export const stripePromise = loadStripe(stripePublishableKey || '');
