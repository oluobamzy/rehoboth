// src/app/api/admin/users/invites/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/services/auth/apiAuth';

export async function GET(req: NextRequest) {
  try {
    // Require admin authentication first
    await requireAdmin(req);

    // Get database connection
    const { serverSupabase } = await import('@/services/server/eventService.server');
    
    // Fetch pending invitations
    const { data: invites, error } = await serverSupabase
      .from('admin_invites')
      .select(`
        *,
        inviter:invited_by (
          email,
          profiles (full_name)
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching invites:', error);
      return NextResponse.json(
        { error: 'Failed to fetch invites' },
        { status: 500 }
      );
    }

    return NextResponse.json({ invites: invites || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}