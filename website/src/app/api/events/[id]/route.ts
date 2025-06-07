import { NextRequest, NextResponse } from 'next/server';
import { fetchEventById } from '@/services/server/eventService.server';

// GET /api/events/[id]
// Get details for a single event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract event ID from params - making sure we properly await params in Next.js
    const id = params.id;
    
    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }
    
    // Fetch event details
    const event = await fetchEventById(id);
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // Return event data
    return NextResponse.json({ event });
  } catch (error) {
    console.error(`Error in GET /api/events/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch event details' },
      { status: 500 }
    );
  }
}
