import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

// Type definitions for content
interface PageContent {
  id?: string;
  page_key: string;
  section_key: string;
  title?: string;
  content: string;
  content_type?: string;
  metadata?: any;
  is_published?: boolean;
}

// GET /api/admin/content - Get all content or specific content
export async function GET(request: NextRequest) {
  try {
    // Use server-side supabase client with service role
    
    const { searchParams } = new URL(request.url);
    const pageKey = searchParams.get('page_key');
    const sectionKey = searchParams.get('section_key');
    const published = searchParams.get('published');

    let query = supabase
      .from('page_content')
      .select('*')
      .order('page_key', { ascending: true })
      .order('section_key', { ascending: true });

    // Apply filters
    if (pageKey) {
      query = query.eq('page_key', pageKey);
    }
    if (sectionKey) {
      query = query.eq('section_key', sectionKey);
    }
    if (published !== null) {
      query = query.eq('is_published', published === 'true');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching content:', error);
      return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
    }

    return NextResponse.json({ content: data || [] });
  } catch (error) {
    console.error('Error in GET /api/admin/content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/content - Create new content
export async function POST(request: NextRequest) {
  try {
    // Use server-side supabase client with service role
    
    const body: PageContent = await request.json();
    
    console.log('📝 Received content data:', {
      page_key: body.page_key,
      section_key: body.section_key,
      title: body.title,
      content: body.content?.substring(0, 100) + '...',
      content_type: body.content_type,
      metadata: body.metadata,
      is_published: body.is_published
    });
    
    // Validate required fields
    if (!body.page_key || !body.section_key || !body.content) {
      return NextResponse.json({ 
        error: 'Missing required fields: page_key, section_key, and content are required' 
      }, { status: 400 });
    }

    // Insert or update content using upsert
    const { data, error } = await supabase
      .from('page_content')
      .upsert({
        page_key: body.page_key,
        section_key: body.section_key,
        title: body.title || null,
        content: body.content,
        content_type: body.content_type || 'html',
        metadata: body.metadata || null,
        is_published: body.is_published !== false, // Default to true
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'page_key,section_key', // Handle conflicts on unique constraint
        ignoreDuplicates: false // Update existing records instead of ignoring
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving content:', error);
      return NextResponse.json({ error: 'Failed to save content' }, { status: 500 });
    }

    return NextResponse.json({ content: data }, { status: 200 });
  } catch (error) {
    console.error('Error in POST /api/admin/content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/content - Bulk update content
export async function PUT(request: NextRequest) {
  try {
    // Use server-side supabase client with service role
    
    const body = await request.json();
    
    // Handle bulk update
    if (Array.isArray(body.content)) {
      const results = [];
      const errors = [];

      for (const contentItem of body.content) {
        try {
          const { data, error } = await supabase
            .from('page_content')
            .upsert({
              page_key: contentItem.page_key,
              section_key: contentItem.section_key,
              title: contentItem.title,
              content: contentItem.content,
              content_type: contentItem.content_type || 'html',
              is_published: contentItem.is_published !== false
            })
            .select()
            .single();

          if (error) {
            errors.push({ item: contentItem, error: error.message });
          } else {
            results.push(data);
          }
        } catch (err) {
          errors.push({ item: contentItem, error: err instanceof Error ? err.message : 'Unknown error' });
        }
      }

      return NextResponse.json({ 
        success: results.length,
        errors: errors.length,
        content: results,
        failed: errors
      });
    }

    return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
  } catch (error) {
    console.error('Error in PUT /api/admin/content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}