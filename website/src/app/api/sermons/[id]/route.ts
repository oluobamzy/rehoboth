import { NextRequest, NextResponse } from 'next/server';
import { fetchSermonById } from '@/services/sermonService';

// GET /api/sermons/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sermon = await fetchSermonById(params.id);
    
    if (!sermon) {
      return NextResponse.json(
        { error: 'Sermon not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(sermon);
  } catch (error) {
    console.error(`Error fetching sermon ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch sermon' },
      { status: 500 }
    );
  }
}
