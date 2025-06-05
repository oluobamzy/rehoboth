import { NextRequest, NextResponse } from 'next/server';
import { updateRegistrationStatus } from '@/services/eventService';

// PUT /api/admin/events/registrations/[id]
// Update registration status (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add middleware/auth check to ensure admin access
    
    // Extract registration ID from params
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Registration ID is required' }, { status: 400 });
    }
    
    // Parse request data
    const { status } = await request.json();
    
    if (!status || !['confirmed', 'waitlist', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required (confirmed, waitlist, or cancelled)' },
        { status: 400 }
      );
    }
    
    // Update registration status
    const success = await updateRegistrationStatus(
      id, 
      status as 'confirmed' | 'waitlist' | 'cancelled'
    );
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update registration status' },
        { status: 500 }
      );
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Registration status updated successfully'
    });
  } catch (error) {
    console.error(`Error in PUT /api/admin/events/registrations/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update registration status' },
      { status: 500 }
    );
  }
}
