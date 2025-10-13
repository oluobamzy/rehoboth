import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Helper function to check if user is admin
async function isAdmin(supabase: any): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    return !error && data?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// GET /api/admin/content/[id]/history - Get content history
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is admin
    if (!(await isAdmin(supabase))) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get content history with user details
    const { data, error } = await supabase
      .from('page_content_history')
      .select(`
        *,
        creator:created_by(email)
      `)
      .eq('page_content_id', params.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching content history:', error);
      return NextResponse.json({ error: 'Failed to fetch content history' }, { status: 500 });
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('page_content_history')
      .select('*', { count: 'exact', head: true })
      .eq('page_content_id', params.id);

    if (countError) {
      console.error('Error counting content history:', countError);
    }

    return NextResponse.json({ 
      history: data || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });
  } catch (error) {
    console.error('Error in GET /api/admin/content/[id]/history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/content/[id]/history/revert - Revert to a specific version
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check if user is admin
    if (!(await isAdmin(supabase))) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { version } = await request.json();
    
    if (!version) {
      return NextResponse.json({ error: 'Version number is required' }, { status: 400 });
    }

    // Get the historical version
    const { data: historyData, error: historyError } = await supabase
      .from('page_content_history')
      .select('title, content, content_type')
      .eq('page_content_id', params.id)
      .eq('version', version)
      .single();

    if (historyError) {
      if (historyError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Version not found' }, { status: 404 });
      }
      console.error('Error fetching historical version:', historyError);
      return NextResponse.json({ error: 'Failed to fetch historical version' }, { status: 500 });
    }

    // Update the current content with the historical version
    const { data, error } = await supabase
      .from('page_content')
      .update({
        title: historyData.title,
        content: historyData.content,
        content_type: historyData.content_type,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error reverting content:', error);
      return NextResponse.json({ error: 'Failed to revert content' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: `Content reverted to version ${version}`,
      content: data
    });
  } catch (error) {
    console.error('Error in POST /api/admin/content/[id]/history/revert:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}