import { NextRequest, NextResponse } from 'next/server';
import { fetchEvents } from '@/services/eventService';

// GET /api/events
// Get a list of events with optional filters
export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '12');
    const fromDate = url.searchParams.get('from_date');
    const toDate = url.searchParams.get('to_date');
    const category = url.searchParams.get('category');
    const eventType = url.searchParams.get('type');
    const featured = url.searchParams.get('featured') === 'true' ? true : 
                    url.searchParams.get('featured') === 'false' ? false : null;
    const query = url.searchParams.get('query');
    const sortBy = url.searchParams.get('sort_by') || 'start_datetime';
    const sortOrder = (url.searchParams.get('sort_order') || 'asc') as 'asc' | 'desc';
    
    // Fetch events with filters
    const { events, count } = await fetchEvents({
      page,
      pageSize,
      fromDate,
      toDate,
      category,
      eventType,
      featured,
      query,
      sortBy,
      sortOrder,
      onlyPublished: true
    });
    
    // Return formatted response
    return NextResponse.json({
      events,
      pagination: {
        page,
        pageSize,
        totalItems: count,
        totalPages: Math.ceil((count ?? 0) / pageSize),
      },
      filters: {
        fromDate,
        toDate,
        category,
        eventType,
        featured,
        query,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
