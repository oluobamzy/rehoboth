const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

async function testStripeConfig() {
  try {
    console.log('Testing Stripe configuration...');
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-05-28.basil'
    });

    // Try to create a test payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000, // $10.00
      currency: 'usd',
      metadata: { test: 'configuration' }
    });

    console.log('✅ Stripe configuration is working. Created payment intent:', paymentIntent.id);
  } catch (error) {
    console.error('❌ Stripe test failed:', error);
  }
}

testStripeConfig();
