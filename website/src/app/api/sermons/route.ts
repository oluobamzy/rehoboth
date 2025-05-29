import { NextRequest, NextResponse } from 'next/server';
import { fetchSermons } from '@/services/sermonService';

// GET /api/sermons
// Get a list of sermons with optional filters
export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '12');
    const seriesId = url.searchParams.get('series_id');
    const speaker = url.searchParams.get('speaker');
    const query = url.searchParams.get('query');
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');
    const sortBy = url.searchParams.get('sort_by') || 'sermon_date';
    const sortOrder = (url.searchParams.get('sort_order') || 'desc') as 'asc' | 'desc';
    
    // Extract tags (comma-separated)
    const tagsParam = url.searchParams.get('tags');
    const tags = tagsParam ? tagsParam.split(',') : [];
    
    // Fetch sermons with filters
    const { sermons, count } = await fetchSermons({
      page,
      pageSize,
      series_id: seriesId || null,
      speaker: speaker || null,
      tags,
      query: query || null,
      start_date: startDate || null,
      end_date: endDate || null,
      sort_by: sortBy,
      sort_order: sortOrder,
    });
    
    // Return formatted response
    return NextResponse.json({
      sermons,
      pagination: {
        page,
        pageSize,
        totalItems: count,
        totalPages: Math.ceil((count ?? 0) / pageSize),
      },
      filters: {
        series_id: seriesId,
        speaker,
        tags,
        query,
        start_date: startDate,
        end_date: endDate,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/sermons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sermons' },
      { status: 500 }
    );
  }
}
