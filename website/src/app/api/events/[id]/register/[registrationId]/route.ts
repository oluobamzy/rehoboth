import { NextRequest, NextResponse } from 'next/server';
import { cancelRegistration } from '@/services/eventService';

// DELETE /api/events/[id]/register/[registrationId]
// Cancel event registration
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; registrationId: string } }
) {
  try {
    // Extract event ID and registration ID from params
    const { id, registrationId } = params;
    
    if (!id || !registrationId) {
      return NextResponse.json(
        { error: 'Event ID and Registration ID are required' },
        { status: 400 }
      );
    }
    
    // TODO: Add token validation to ensure the user has permission to cancel this registration
    
    // Cancel the registration
    const success = await cancelRegistration(registrationId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to cancel registration' },
        { status: 400 }
      );
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Registration cancelled successfully'
    });
  } catch (error) {
    console.error(`Error in DELETE /api/events/${params.id}/register/${params.registrationId}:`, error);
    return NextResponse.json(
      { error: 'Failed to cancel registration' },
      { status: 500 }
    );
  }
}
