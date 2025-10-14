import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

// GET /api/content - Get published content for public use
export async function GET(request: NextRequest) {
  try {
    // Use server-side supabase client
    
    const { searchParams } = new URL(request.url);
    const pageKey = searchParams.get('page_key');
    const sectionKey = searchParams.get('section_key');

    let query = supabase
      .from('page_content')
      .select('id, page_key, section_key, title, content, content_type, updated_at')
      .eq('is_published', true)
      .order('page_key', { ascending: true })
      .order('section_key', { ascending: true });

    // Apply filters
    if (pageKey) {
      query = query.eq('page_key', pageKey);
    }
    if (sectionKey) {
      query = query.eq('section_key', sectionKey);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching published content:', error);
      return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
    }

    // If requesting specific page and section, return single item
    if (pageKey && sectionKey && data && data.length > 0) {
      return NextResponse.json({ content: data[0] }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }

    return NextResponse.json({ content: data || [] }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache', 
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error in GET /api/content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// HEAD /api/content - Check if content exists (for caching)
export async function HEAD(request: NextRequest) {
  try {
    // Use server-side supabase client
    
    const { searchParams } = new URL(request.url);
    const pageKey = searchParams.get('page_key');
    const sectionKey = searchParams.get('section_key');

    if (!pageKey || !sectionKey) {
      return new NextResponse(null, { status: 400 });
    }

    const { data, error } = await supabase
      .from('page_content')
      .select('updated_at')
      .eq('page_key', pageKey)
      .eq('section_key', sectionKey)
      .eq('is_published', true)
      .single();

    if (error || !data) {
      return new NextResponse(null, { status: 404 });
    }

    // Return headers with last modified date for caching
    return new NextResponse(null, { 
      status: 200,
      headers: {
        'Last-Modified': new Date(data.updated_at).toUTCString(),
        'Cache-Control': 'public, max-age=300' // 5 minutes cache
      }
    });
  } catch (error) {
    console.error('Error in HEAD /api/content:', error);
    return new NextResponse(null, { status: 500 });
  }
}