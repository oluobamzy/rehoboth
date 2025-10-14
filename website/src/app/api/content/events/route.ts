import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageKey = searchParams.get('page_key') || 'home';
    const sectionKey = searchParams.get('section_key') || 'event_cards';
    const limit = parseInt(searchParams.get('limit') || '3');

    const supabase = createRouteHandlerClient({ cookies });

    // Get event cards from database
    const { data, error } = await supabase
      .from('page_content')
      .select('id, title, content, metadata, sort_order')
      .eq('page_key', pageKey)
      .eq('section_key', sectionKey)
      .eq('content_type', 'event')
      .eq('is_published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching event cards:', error);
      return NextResponse.json(
        { error: 'Failed to fetch event cards' },
        { status: 500 }
      );
    }

    // Transform database events to expected format
    const events = (data || []).map(event => ({
      id: event.id,
      title: event.title || 'Untitled Event',
      date: event.metadata?.date || new Date().toISOString(),
      time: event.metadata?.time || 'Time TBD',
      location: event.metadata?.location || 'Location TBD',
      description: event.content?.replace(/<[^>]*>/g, '') || 'No description available',
      link: event.metadata?.link || '#'
    }));

    return NextResponse.json(
      { 
        events,
        count: events.length
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in events API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}