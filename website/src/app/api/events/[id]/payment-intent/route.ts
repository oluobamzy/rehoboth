import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent } from '@/services/server/paymentService.server';
import { fetchEventById } from '@/services/server/eventService.server';

// POST /api/events/[id]/payment-intent
// Create a payment intent for an event registration
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract event ID from params
    const id = params.id;
    
    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }
    
    // Parse request body
    const data = await request.json();
    const { registrationId } = data;
    
    if (!registrationId) {
      return NextResponse.json({ error: 'Registration ID is required' }, { status: 400 });
    }
    
    // Get the event details to determine the amount
    const event = await fetchEventById(id);
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // Create payment intent (amount in cents)
    const result = await createPaymentIntent({
      eventId: id,
      registrationId,
      amount: event.cost_cents,
      metadata: {
        eventTitle: event.title,
      },
    });
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create payment' },
        { status: 500 }
      );
    }
    
    // Return the client secret for the frontend to complete payment
    return NextResponse.json({
      clientSecret: result.clientSecret,
      amount: event.cost_cents,
      eventTitle: event.title,
      currency: 'usd', // Hardcoded for now, could be configurable
    });
  } catch (error) {
    console.error(`Error in POST /api/events/${params.id}/payment-intent:`, error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
