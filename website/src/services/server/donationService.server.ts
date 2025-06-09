// src/services/server/donationService.server.ts
// Server-side donation service functions
// This file should only be imported in server components or API routes

import Stripe from 'stripe';
import { serverSupabase } from './eventService.server';
import { sendDonationReceipt } from './emailService.server';
import { 
  Donation, 
  DonationInput, 
  RecurringDonationInput, 
  DonationDesignation,
  DonationStatistics 
} from '../../types/donations';

// Initialize Stripe with the secret key (should be in .env)
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2025-05-28.basil' }) : null;

// Check if Stripe is properly configured
if (!stripe) {
  console.error('⚠️ Server: Stripe is not properly configured. Please set STRIPE_SECRET_KEY in .env');
}

/**
 * Create a payment intent for a donation
 */
export async function createDonationPaymentIntent({
  amount,
  currency = 'usd',
  donorEmail,
  donorName,
  fundDesignation,
  metadata = {},
}: {
  amount: number; // amount in cents
  currency?: string;
  donorEmail?: string;
  donorName?: string;
  fundDesignation?: string;
  metadata?: Record<string, string>;
}) {
  try {
    if (!stripe) {
      console.error('Server: Stripe not initialized');
      return { success: false, error: 'Payment service not configured' };
    }

    // Create the payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        donorEmail: donorEmail || '',
        donorName: donorName || '',
        fundDesignation: fundDesignation || '',
        donationType: 'one-time',
        ...metadata
      },
      receipt_email: donorEmail,
      // Automatically confirm the payment when possible
      automatic_payment_methods: {
        enabled: true,
      },
      // Use an idempotency key to prevent duplicate processing
      idempotency_key: `donation-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    };
  } catch (error) {
    console.error('Error creating donation payment intent:', error);
    return { success: false, error: 'Failed to create payment' };
  }
}

/**
 * Create a subscription for recurring donations
 */
export async function createDonationSubscription({
  amount,
  currency = 'usd',
  donorEmail,
  donorName,
  fundDesignation,
  frequency = 'monthly',
  metadata = {},
  paymentMethodId
}: {
  amount: number; // amount in cents
  currency?: string;
  donorEmail: string;
  donorName?: string;
  fundDesignation?: string;
  frequency?: string;
  metadata?: Record<string, string>;
  paymentMethodId: string;
}) {
  try {
    if (!stripe) {
      console.error('Server: Stripe not initialized');
      return { success: false, error: 'Payment service not configured' };
    }

    // Find or create a customer
    const customerSearch = await stripe.customers.list({
      email: donorEmail,
      limit: 1
    });

    let customerId;
    if (customerSearch.data.length > 0) {
      customerId = customerSearch.data[0].id;
      
      // Attach the payment method to the existing customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId
      });
    } else {
      // Create a new customer with the payment method
      const customer = await stripe.customers.create({
        email: donorEmail,
        name: donorName,
        payment_method: paymentMethodId,
      });
      customerId = customer.id;
    }

    // Set this payment method as the default
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });

    // Calculate the interval based on frequency
    const interval = frequency === 'weekly' ? 'week' : 
                     frequency === 'biweekly' ? 'week' : 
                     frequency === 'quarterly' ? 'month' : 
                     frequency === 'annually' ? 'year' : 'month';
                     
    const intervalCount = frequency === 'biweekly' ? 2 : 
                          frequency === 'quarterly' ? 3 : 1;

    // Create a subscription with the customer
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{
        price_data: {
          currency,
          product_data: {
            name: fundDesignation ? 
              `Recurring ${frequency} donation to ${fundDesignation}` : 
              `Recurring ${frequency} donation`,
            metadata: {
              fundDesignation: fundDesignation || 'General Fund'
            }
          },
          unit_amount: amount,
          recurring: {
            interval,
            interval_count: intervalCount
          }
        }
      }],
      metadata: {
        donorEmail,
        donorName: donorName || '',
        fundDesignation: fundDesignation || '',
        frequency,
        donationType: 'recurring',
        ...metadata
      },
      // Automatically collect payment
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription'
      },
      expand: ['latest_invoice.payment_intent'],
    });

    return {
      success: true,
      subscriptionId: subscription.id,
      customerId,
      status: subscription.status
    };
  } catch (error) {
    console.error('Error creating donation subscription:', error);
    return { success: false, error: 'Failed to create subscription' };
  }
}

/**
 * Update a recurring donation's details
 */
export async function updateDonationSubscription({
  subscriptionId,
  amount,
  frequency,
  paymentMethodId,
  fundDesignation,
}: {
  subscriptionId: string;
  amount?: number;
  frequency?: string;
  paymentMethodId?: string;
  fundDesignation?: string;
}) {
  try {
    if (!stripe) {
      return { success: false, error: 'Payment service not configured' };
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const updateParams: any = { };
    
    // Update payment method if provided
    if (paymentMethodId) {
      await stripe.subscriptions.update(subscriptionId, {
        default_payment_method: paymentMethodId
      });

      // Also update the customer's default payment method
      await stripe.customers.update(subscription.customer as string, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });
    }

    // Update frequency if provided
    if (frequency) {
      const interval = frequency === 'weekly' ? 'week' : 
                       frequency === 'biweekly' ? 'week' : 
                       frequency === 'quarterly' ? 'month' : 
                       frequency === 'annually' ? 'year' : 'month';
                       
      const intervalCount = frequency === 'biweekly' ? 2 : 
                            frequency === 'quarterly' ? 3 : 1;

      // Get the first subscription item ID
      const itemId = subscription.items.data[0].id;

      // Update the price data
      updateParams.items = [{
        id: itemId,
        price_data: {
          currency: subscription.currency,
          product: subscription.items.data[0].price.product as string,
          unit_amount: amount || subscription.items.data[0].price.unit_amount,
          recurring: {
            interval,
            interval_count: intervalCount
          }
        }
      }];

      // Update the metadata
      const metadata = {
        ...subscription.metadata,
        frequency
      };
      
      if (fundDesignation) {
        metadata.fundDesignation = fundDesignation;
      }
      
      updateParams.metadata = metadata;
    } else if (amount || fundDesignation) {
      // Only update amount or fund designation
      const itemId = subscription.items.data[0].id;
      
      if (amount) {
        updateParams.items = [{
          id: itemId,
          price_data: {
            currency: subscription.currency,
            product: subscription.items.data[0].price.product as string,
            unit_amount: amount,
            recurring: {
              interval: subscription.items.data[0].price.recurring?.interval,
              interval_count: subscription.items.data[0].price.recurring?.interval_count
            }
          }
        }];
      }
      
      if (fundDesignation) {
        const metadata = {
          ...subscription.metadata,
          fundDesignation
        };
        updateParams.metadata = metadata;
      }
    }

    // Apply updates if we have any
    if (Object.keys(updateParams).length > 0) {
      await stripe.subscriptions.update(subscriptionId, updateParams);
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating donation subscription:', error);
    return { success: false, error: 'Failed to update subscription' };
  }
}

/**
 * Cancel a recurring donation
 */
export async function cancelDonationSubscription(subscriptionId: string) {
  try {
    if (!stripe) {
      return { success: false, error: 'Payment service not configured' };
    }

    await stripe.subscriptions.cancel(subscriptionId);

    return { success: true };
  } catch (error) {
    console.error('Error canceling donation subscription:', error);
    return { success: false, error: 'Failed to cancel subscription' };
  }
}

/**
 * Record a donation in Supabase
 */
export async function recordDonation(donationData: DonationInput): Promise<{ success: boolean, donation?: Donation, error?: string }> {
  try {
    const { data, error } = await serverSupabase
      .from('donations')
      .insert([donationData])
      .select()
      .single();

    if (error) throw error;

    // If this is associated with a fund, update the fund's amount
    if (data.fund_designation) {
      await updateFundAmount(
        data.fund_designation, 
        Math.round(Number(data.amount) * 100) // Convert to cents
      );
    }

    // Send receipt if email is available
    if (data.donor_email) {
      await sendDonationReceipt(data.donor_email, data);
    }

    return { success: true, donation: data };
  } catch (error) {
    console.error('Error recording donation:', error);
    return { success: false, error: 'Failed to record donation' };
  }
}

/**
 * Record a recurring donation in Supabase
 */
export async function recordRecurringDonation(recurringData: RecurringDonationInput): Promise<{ success: boolean, donation?: any, error?: string }> {
  try {
    const { data, error } = await serverSupabase
      .from('recurring_donations')
      .insert([recurringData])
      .select()
      .single();

    if (error) throw error;

    return { success: true, donation: data };
  } catch (error) {
    console.error('Error recording recurring donation:', error);
    return { success: false, error: 'Failed to record recurring donation' };
  }
}

/**
 * Get all donation designations (funds)
 */
export async function getDonationDesignations(activeOnly: boolean = true): Promise<{ designations: DonationDesignation[] }> {
  try {
    let query = serverSupabase
      .from('donation_designations')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query;

    if (error) throw error;
    return { designations: data };
  } catch (error) {
    console.error('Error fetching donation designations:', error);
    return { designations: [] };
  }
}

/**
 * Update a fund's current amount
 */
async function updateFundAmount(fundName: string, amountCents: number) {
  try {
    // First get the current fund
    const { data: fund, error: fundError } = await serverSupabase
      .from('donation_designations')
      .select('*')
      .eq('name', fundName)
      .single();
      
    if (fundError || !fund) return;
    
    // Update the fund amount
    await serverSupabase
      .from('donation_designations')
      .update({ 
        current_amount_cents: fund.current_amount_cents + amountCents
      })
      .eq('id', fund.id);
      
  } catch (error) {
    console.error('Error updating fund amount:', error);
  }
}

/**
 * Get donation statistics
 */
export async function getDonationStatistics(
  startDate?: string, 
  endDate?: string
): Promise<DonationStatistics> {
  try {
    // Set default date range to current year
    const now = new Date();
    const thisYear = now.getFullYear();
    const start = startDate || `${thisYear}-01-01`;
    const end = endDate || now.toISOString().split('T')[0];

    // Get total donations
    const { data: donations, error: donationError } = await serverSupabase
      .from('donations')
      .select('*')
      .gte('created_at', start)
      .lte('created_at', end);
    
    if (donationError) throw donationError;

    // Get donation designations
    const { designations } = await getDonationDesignations(false);
    
    // Get recurring donors count
    const { data: recurringCount, error: recurringError } = await serverSupabase
      .from('recurring_donations')
      .select('id')
      .eq('status', 'active')
      .count();
      
    if (recurringError) throw recurringError;

    // Calculate statistics
    const totalAmount = donations.reduce((sum, d) => sum + Number(d.amount), 0);
    const averageAmount = donations.length ? totalAmount / donations.length : 0;
    
    // Calculate designation totals
    const designationTotals = designations.map(d => {
      const fundDonations = donations.filter(donation => 
        donation.fund_designation === d.name
      );
      const amount = fundDonations.reduce((sum, d) => sum + Number(d.amount), 0);
      const percentage = d.target_amount_cents 
        ? (d.current_amount_cents / d.target_amount_cents) * 100 
        : undefined;
      
      return {
        name: d.name,
        amount,
        target: d.target_amount_cents ? d.target_amount_cents / 100 : undefined,
        percentage
      };
    });
    
    // Get recent donations
    const recentDonations = donations
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map(d => ({
        id: d.id,
        amount: Number(d.amount),
        date: d.created_at,
        designation: d.fund_designation
      }));
    
    // Calculate monthly totals
    const months: Record<string, number> = {};
    donations.forEach(d => {
      const month = d.created_at.substring(0, 7); // YYYY-MM
      months[month] = (months[month] || 0) + Number(d.amount);
    });
    
    const monthlyTotals = Object.entries(months)
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalAmount,
      averageAmount,
      donationCount: donations.length,
      recurringDonorCount: recurringCount?.count || 0,
      designationTotals,
      recentDonations,
      monthlyTotals
    };
  } catch (error) {
    console.error('Error getting donation statistics:', error);
    return {
      totalAmount: 0,
      averageAmount: 0,
      donationCount: 0,
      recurringDonorCount: 0,
      designationTotals: [],
      recentDonations: [],
      monthlyTotals: []
    };
  }
}
