import { NextRequest, NextResponse } from 'next/server';
import { updateEvent, deleteEvent } from '@/services/eventService';

// GET /api/admin/events/[id]
// Admin version to get a single event (already covered by public API, could add more details)

// PUT /api/admin/events/[id]
// Update an existing event (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add middleware/auth check to ensure admin access
    
    // Extract event ID from params
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }
    
    // Parse event data from request body
    const eventData = await request.json();
    
    // Update the event
    const updatedEvent = await updateEvent(id, eventData);
    
    if (!updatedEvent) {
      return NextResponse.json(
        { error: 'Failed to update event' },
        { status: 500 }
      );
    }
    
    // Return updated event
    return NextResponse.json({
      success: true,
      event: updatedEvent
    });
  } catch (error) {
    console.error(`Error in PUT /api/admin/events/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/events/[id]
// Delete or unpublish an event (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add middleware/auth check to ensure admin access
    
    // Extract event ID from params
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }
    
    // Delete or unpublish the event (based on if registrations exist)
    const success = await deleteEvent(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete event' },
        { status: 500 }
      );
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Event deleted or unpublished successfully'
    });
  } catch (error) {
    console.error(`Error in DELETE /api/admin/events/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
