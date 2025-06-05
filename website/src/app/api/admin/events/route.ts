import { NextRequest, NextResponse } from 'next/server';
import { createEvent } from '@/services/eventService';

// POST /api/admin/events
// Create a new event (admin only)
export async function POST(request: NextRequest) {
  try {
    // TODO: Add middleware/auth check to ensure admin access
    
    // Parse event data from request body
    const eventData = await request.json();
    
    // Validate required fields
    if (!eventData.title || !eventData.event_type || 
        !eventData.start_datetime || !eventData.end_datetime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create the event
    const newEvent = await createEvent(eventData);
    
    if (!newEvent) {
      return NextResponse.json(
        { error: 'Failed to create event' },
        { status: 500 }
      );
    }
    
    // Return the created event
    return NextResponse.json({
      success: true,
      event: newEvent
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/events:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
