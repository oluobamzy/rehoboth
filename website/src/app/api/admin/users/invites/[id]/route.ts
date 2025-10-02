// src/app/api/admin/users/invites/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/services/auth/apiAuth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require admin authentication first
    await requireAdmin(req);
    
    const inviteId = params.id;

    // Get database connection
    const { serverSupabase } = await import('@/services/server/eventService.server');
    
    // Update invitation status to cancelled
    const { error } = await serverSupabase
      .from('admin_invites')
      .update({ status: 'cancelled' })
      .eq('id', inviteId);
    
    if (error) {
      console.error('Error cancelling invite:', error);
      return NextResponse.json(
        { error: 'Failed to cancel invitation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}