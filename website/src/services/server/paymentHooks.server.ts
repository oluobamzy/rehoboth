// Server-side payment hooks for handling payment status updates
// This file should only be imported in server components or API routes

import { serverSupabase } from './eventService.server';
import { sendPaymentConfirmation } from './emailService.server';
import type { EventRegistration } from './eventService.server';

export interface PaymentUpdateResult {
  success: boolean;
  registration?: EventRegistration;
  error?: string;
}

/**
 * Update registration payment status and send notifications
 */
export async function handlePaymentSuccess(
  paymentIntentId: string,
  amount: number
): Promise<PaymentUpdateResult> {
  try {
    // 1. Find the registration by payment intent ID
    const { data: registration, error: findError } = await serverSupabase
      .from('event_registrations')
      .select(`
        *,
        event:events (
          title,
          start_datetime,
          end_datetime,
          location_name,
          location_address,
          contact_email
        )
      `)
      .eq('payment_intent_id', paymentIntentId)
      .single();

    if (findError || !registration) {
      console.error('Server: Error finding registration:', findError);
      return { success: false, error: 'Registration not found' };
    }

    // 2. Update payment status to paid
    const { data: updatedRegistration, error: updateError } = await serverSupabase
      .from('event_registrations')
      .update({
        payment_status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('id', registration.id)
      .select()
      .single();

    if (updateError) {
      console.error('Server: Error updating payment status:', updateError);
      return { success: false, error: 'Failed to update payment status' };
    }

    // 3. Send payment confirmation email
    if (registration.event) {
      try {
        await sendPaymentConfirmation(registration, registration.event, amount);
      } catch (emailError) {
        console.error('Server: Error sending payment confirmation:', emailError);
        // Don't fail the update if email fails
      }
    }

    return {
      success: true,
      registration: updatedRegistration
    };
  } catch (error) {
    console.error('Server: Error in handlePaymentSuccess:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error processing payment'
    };
  }
}

/**
 * Handle payment failure
 */
export async function handlePaymentFailure(
  paymentIntentId: string,
  failureReason?: string
): Promise<PaymentUpdateResult> {
  try {
    // 1. Find the registration
    const { data: registration, error: findError } = await serverSupabase
      .from('event_registrations')
      .select('*')
      .eq('payment_intent_id', paymentIntentId)
      .single();

    if (findError || !registration) {
      console.error('Server: Error finding registration:', findError);
      return { success: false, error: 'Registration not found' };
    }

    // 2. Log the failure but keep payment status as pending
    // This allows the user to retry the payment
    const { data: updatedRegistration, error: updateError } = await serverSupabase
      .from('event_registrations')
      .update({
        updated_at: new Date().toISOString(),
        payment_failure_reason: failureReason
      })
      .eq('id', registration.id)
      .select()
      .single();

    if (updateError) {
      console.error('Server: Error updating registration:', updateError);
      return { success: false, error: 'Failed to update registration' };
    }

    return {
      success: true,
      registration: updatedRegistration
    };
  } catch (error) {
    console.error('Server: Error in handlePaymentFailure:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error processing payment failure'
    };
  }
}

/**
 * Handle payment refund
 */
export async function handlePaymentRefund(
  paymentIntentId: string
): Promise<PaymentUpdateResult> {
  try {
    // 1. Find the registration
    const { data: registration, error: findError } = await serverSupabase
      .from('event_registrations')
      .select('*')
      .eq('payment_intent_id', paymentIntentId)
      .single();

    if (findError || !registration) {
      console.error('Server: Error finding registration:', findError);
      return { success: false, error: 'Registration not found' };
    }

    // 2. Update payment status to refunded
    const { data: updatedRegistration, error: updateError } = await serverSupabase
      .from('event_registrations')
      .update({
        payment_status: 'refunded',
        updated_at: new Date().toISOString()
      })
      .eq('id', registration.id)
      .select()
      .single();

    if (updateError) {
      console.error('Server: Error updating payment status:', updateError);
      return { success: false, error: 'Failed to update payment status' };
    }

    return {
      success: true,
      registration: updatedRegistration
    };
  } catch (error) {
    console.error('Server: Error in handlePaymentRefund:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error processing refund'
    };
  }
}
