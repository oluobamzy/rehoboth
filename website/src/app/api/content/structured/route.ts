import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageKey = searchParams.get('page_key');
    const sectionKey = searchParams.get('section_key');

    if (!pageKey || !sectionKey) {
      return NextResponse.json(
        { error: 'page_key and section_key are required' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Get structured content from database
    const { data, error } = await supabase
      .from('page_content')
      .select('content, metadata, title, content_type')
      .eq('page_key', pageKey)
      .eq('section_key', sectionKey)
      .eq('is_published', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No content found
        return NextResponse.json(
          { content: null },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json(
      { 
        content: {
          content: data.content,
          metadata: data.metadata,
          title: data.title,
          content_type: data.content_type
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching structured content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}