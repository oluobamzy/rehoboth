import { NextRequest, NextResponse } from 'next/server';
import { fetchSermonSeriesById } from '@/services/sermonService';

// GET /api/sermons/series/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const series = await fetchSermonSeriesById(params.id);
    
    if (!series) {
      return NextResponse.json(
        { error: 'Sermon series not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(series);
  } catch (error) {
    console.error(`Error fetching sermon series ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch sermon series' },
      { status: 500 }
    );
  }
}
