// src/app/api/donations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { 
  createDonationPaymentIntent,
  recordDonation
} from '../../../services/server/donationService.server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency, donorEmail, donorName, fundDesignation } = body;
    
    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }
    
    // Convert amount to cents for Stripe
    const amountInCents = Math.round(amount * 100);
    
    // Create payment intent with Stripe
    const result = await createDonationPaymentIntent({
      amount: amountInCents,
      currency,
      donorEmail,
      donorName,
      fundDesignation
    });
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create payment intent' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId
    });
  } catch (error) {
    console.error('Error processing one-time donation:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// This handles GET requests to get donation total for public display
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const fund = url.searchParams.get('fund');
    
    // If no fund is specified, return a 400 error
    if (!fund) {
      return NextResponse.json(
        { error: 'Fund parameter is required' },
        { status: 400 }
      );
    }
    
    // Get the database connection from our server utility
    const { serverSupabase } = await import('../../../services/server/eventService.server');
    
    // Query the designation
    const { data, error } = await serverSupabase
      .from('donation_designations')
      .select('current_amount_cents, target_amount_cents')
      .eq('name', fund)
      .single();
    
    if (error) {
      return NextResponse.json(
        { error: 'Fund not found' },
        { status: 404 }
      );
    }
    
    // Convert cents to dollars for the client
    return NextResponse.json({
      currentAmount: data.current_amount_cents / 100,
      targetAmount: data.target_amount_cents ? data.target_amount_cents / 100 : null,
      percentage: data.target_amount_cents 
        ? (data.current_amount_cents / data.target_amount_cents * 100)
        : null
    });
  } catch (error) {
    console.error('Error fetching fund totals:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
