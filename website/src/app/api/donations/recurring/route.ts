// src/app/api/donations/recurring/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { 
  createDonationSubscription,
  recordRecurringDonation
} from '../../../../services/server/donationService.server';
import { RecurringDonationInput } from '../../../../types/donations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      amount, 
      currency, 
      donorEmail, 
      donorName, 
      fundDesignation, 
      frequency,
      paymentMethodId 
    } = body;
    
    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }
    
    if (!donorEmail) {
      return NextResponse.json(
        { error: 'Donor email is required' },
        { status: 400 }
      );
    }
    
    if (!paymentMethodId) {
      return NextResponse.json(
        { error: 'Payment method is required' },
        { status: 400 }
      );
    }
    
    if (!frequency) {
      return NextResponse.json(
        { error: 'Donation frequency is required' },
        { status: 400 }
      );
    }
    
    // Convert amount to cents for Stripe
    const amountInCents = Math.round(amount * 100);
    
    // Create subscription with Stripe
    const result = await createDonationSubscription({
      amount: amountInCents,
      currency,
      donorEmail,
      donorName,
      fundDesignation,
      frequency,
      paymentMethodId
    });
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create recurring donation' },
        { status: 500 }
      );
    }
    
    // Record subscription in database
    const recurringDonation: RecurringDonationInput = {
      donor_email: donorEmail,
      donor_name: donorName,
      amount: amount,
      currency: currency || 'USD',
      fund_designation: fundDesignation,
      frequency: frequency,
      stripe_subscription_id: result.subscriptionId!,
      stripe_customer_id: result.customerId!,
      status: result.status || 'active',
    };
    
    const recordResult = await recordRecurringDonation(recurringDonation);
    
    if (!recordResult.success) {
      console.error('Failed to record recurring donation in database:', recordResult.error);
      // Continue despite database error, as the subscription was created in Stripe
    }
    
    return NextResponse.json({
      success: true,
      subscriptionId: result.subscriptionId,
      status: result.status
    });
  } catch (error) {
    console.error('Error processing recurring donation:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
