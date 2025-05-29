import { NextResponse } from 'next/server'; // NextRequest is unused
import { fetchSermonSeries } from '@/services/sermonService';

// GET /api/sermons/series
export async function GET() {
  try {
    const series = await fetchSermonSeries();
    
    return NextResponse.json(series);
  } catch (error) {
    console.error('Error fetching sermon series:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sermon series' },
      { status: 500 }
    );
  }
}
