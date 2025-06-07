import { NextRequest, NextResponse } from 'next/server';
import { registerForEvent, fetchEventById } from '@/services/server/eventService.server';
import { sendRegistrationConfirmation, sendAdminRegistrationNotification } from '@/services/server/emailService.server';

// POST /api/events/[id]/register
// Register for an event
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
    
    // Get event details for email
    if (result.registration) {
      try {
        const event = await fetchEventById(id);
        if (event) {
          // Send confirmation email to attendee
          await sendRegistrationConfirmation(result.registration, event);
          
          // Send notification to admin
          await sendAdminRegistrationNotification(result.registration, event);
        }
      } catch (emailError) {
        console.error('Failed to send registration emails:', emailError);
        // Don't fail the registration if email fails
      }
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
