import { NextRequest, NextResponse } from 'next/server';
import { fetchEvents, generateCalendarFeed } from '@/services/eventService';

// GET /api/events/calendar
// Generate iCal feed for events
export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const url = new URL(request.url);
    const fromDate = url.searchParams.get('from_date') || new Date().toISOString();
    const limit = parseInt(url.searchParams.get('limit') || '100');
    
    // Fetch upcoming events
    const { events } = await fetchEvents({
      fromDate,
      pageSize: limit,
      onlyPublished: true,
      sortBy: 'start_datetime',
      sortOrder: 'asc'
    });
    
    if (!events || events.length === 0) {
      return new NextResponse('No events found', {
        status: 404,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
    }
    
    // Generate iCal feed
    const iCalContent = generateCalendarFeed(events);
    
    // Return iCal content with appropriate headers
    return new NextResponse(iCalContent, {
      headers: {
        'Content-Type': 'text/calendar',
        'Content-Disposition': 'attachment; filename="rehoboth-events.ics"'
      }
    });
  } catch (error) {
    console.error('Error in GET /api/events/calendar:', error);
    return new NextResponse('Error generating calendar feed', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }
}
