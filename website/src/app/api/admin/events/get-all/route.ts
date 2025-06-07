import { NextRequest, NextResponse } from 'next/server';
import { fetchAllEvents } from '@/services/server/adminEventService.server';

// GET /api/admin/events
// Get a list of all events including unpublished (admin only)
export async function GET(request: NextRequest) {
  try {
    // TODO: Add middleware/auth check to ensure admin access
    
    // Extract query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    const fromDate = url.searchParams.get('from_date');
    const toDate = url.searchParams.get('to_date');
    const category = url.searchParams.get('category');
    const eventType = url.searchParams.get('type');
    const query = url.searchParams.get('query');
    const sortBy = url.searchParams.get('sort_by') || 'start_datetime';
    const sortOrder = (url.searchParams.get('sort_order') || 'asc') as 'asc' | 'desc';
    
    // Include unpublished events for admin view
    const { events, count } = await fetchAllEvents({
      page,
      pageSize,
      fromDate,
      toDate,
      category,
      eventType,
      query,
      sortBy,
      sortOrder,
      // No need to pass onlyPublished parameter since the admin service includes all events by default
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
        query,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/admin/events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
