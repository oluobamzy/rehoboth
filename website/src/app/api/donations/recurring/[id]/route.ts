// src/app/api/donations/recurring/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { 
  updateDonationSubscription,
  cancelDonationSubscription
} from '../../../../../services/server/donationService.server';

// Helper to authorize the user to modify this subscription
async function authorizeSubscriptionAccess(id: string, email?: string) {
  // If no email, not authenticated
  if (!email) return false;

  const { serverSupabase } = await import('../../../../../services/server/eventService.server');
  
  // Check if subscription belongs to user or user is admin
  const { data: isAdmin } = await serverSupabase
    .rpc('is_admin', { user_email: email });
    
  if (isAdmin) return true;
  
  const { data: subscription } = await serverSupabase
    .from('recurring_donations')
    .select('donor_email')
    .eq('id', id)
    .eq('donor_email', email)
    .single();
    
  return !!subscription;
}

// Handler for updating recurring donations
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();
    const { amount, frequency, paymentMethodId, fundDesignation } = body;
    
    // Get user information from session
    const { serverSupabase } = await import('../../../../../services/server/eventService.server');
    const { data: { session } } = await serverSupabase.auth.getSession();
    const userEmail = session?.user?.email;
    
    // Check authorization
    const isAuthorized = await authorizeSubscriptionAccess(id, userEmail);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized to modify this subscription' },
        { status: 403 }
      );
    }
    
    // Get the subscription from database to get the Stripe subscription ID
    const { data: subscription, error: fetchError } = await serverSupabase
      .from('recurring_donations')
      .select('stripe_subscription_id')
      .eq('id', id)
      .single();
      
    if (fetchError || !subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }
    
    // Calculate amount in cents if provided
    const amountInCents = amount ? Math.round(amount * 100) : undefined;
    
    // Update subscription in Stripe
    const result = await updateDonationSubscription({
      subscriptionId: subscription.stripe_subscription_id,
      amount: amountInCents,
      frequency,
      paymentMethodId,
      fundDesignation
    });
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update subscription' },
        { status: 500 }
      );
    }
    
    // Update subscription in database
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    
    if (amount) updates.amount = amount;
    if (frequency) updates.frequency = frequency;
    if (fundDesignation) updates.fund_designation = fundDesignation;
    
    const { error: updateError } = await serverSupabase
      .from('recurring_donations')
      .update(updates)
      .eq('id', id);
      
    if (updateError) {
      console.error('Error updating subscription in database:', updateError);
      // Continue despite database error as Stripe update was successful
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating recurring donation:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Handler for canceling recurring donations
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Get user information from session
    const { serverSupabase } = await import('../../../../../services/server/eventService.server');
    const { data: { session } } = await serverSupabase.auth.getSession();
    const userEmail = session?.user?.email;
    
    // Check authorization
    const isAuthorized = await authorizeSubscriptionAccess(id, userEmail);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized to cancel this subscription' },
        { status: 403 }
      );
    }
    
    // Get the subscription from database to get the Stripe subscription ID
    const { data: subscription, error: fetchError } = await serverSupabase
      .from('recurring_donations')
      .select('stripe_subscription_id')
      .eq('id', id)
      .single();
      
    if (fetchError || !subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }
    
    // Cancel subscription in Stripe
    const result = await cancelDonationSubscription(subscription.stripe_subscription_id);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to cancel subscription' },
        { status: 500 }
      );
    }
    
    // Update subscription status in database
    const { error: updateError } = await serverSupabase
      .from('recurring_donations')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
      
    if (updateError) {
      console.error('Error updating subscription status in database:', updateError);
      // Continue despite database error as Stripe cancellation was successful
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error canceling recurring donation:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
