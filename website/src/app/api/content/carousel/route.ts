import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get carousel slides from database
    const { data, error } = await supabase
      .from('page_content')
      .select('id, title, content, metadata, sort_order')
      .eq('page_key', 'home')
      .eq('section_key', 'carousel_slide')
      .eq('content_type', 'carousel')
      .eq('is_published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching carousel slides:', error);
      return NextResponse.json(
        { error: 'Failed to fetch carousel slides' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        slides: data || [],
        count: data?.length || 0
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in carousel API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}