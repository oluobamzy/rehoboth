import { NextRequest, NextResponse } from 'next/server';
import { fetchEventRegistrations } from '@/services/eventService';

// GET /api/admin/events/[id]/registrations
// Get all registrations for an event (admin only)
export async function GET(
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
    
    // Fetch all registrations for this event
    const registrations = await fetchEventRegistrations(id);
    
    // Return registrations list
    return NextResponse.json({
      registrations,
      count: registrations.length
    });
  } catch (error) {
    console.error(`Error in GET /api/admin/events/${params.id}/registrations:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}
