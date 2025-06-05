import { NextRequest, NextResponse } from 'next/server';
import { registerForEvent } from '@/services/eventService';

// POST /api/events/[id]/register
// Register for an event
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract event ID from params
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }
    
    // Parse registration data from request body
    const registrationData = await request.json();
    
    // Validate required fields
    if (!registrationData.attendee_name || !registrationData.attendee_email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }
    
    // Register for the event
    const result = await registerForEvent(id, registrationData);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Registration failed' },
        { status: 400 }
      );
    }
    
    // Return registration result
    return NextResponse.json({
      success: true,
      registrationId: result.registration?.id,
      status: result.status,
      confirmationCode: result.confirmationCode,
      paymentRequired: result.paymentRequired
    });
  } catch (error) {
    console.error(`Error in POST /api/events/${params.id}/register:`, error);
    return NextResponse.json(
      { error: 'Failed to process registration' },
      { status: 500 }
    );
  }
}
