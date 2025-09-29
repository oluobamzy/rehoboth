// src/app/api/auth/invite/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Get database connection
    const { serverSupabase } = await import('@/services/server/eventService.server');
    
    // Find the invitation by token
    const { data: invite, error } = await serverSupabase
      .from('admin_invites')
      .select(`
        *,
        inviter:invited_by (
          email,
          profiles (full_name)
        )
      `)
      .eq('invite_token', token)
      .eq('status', 'pending')
      .single();
    
    if (error || !invite) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      );
    }

    // Check if invitation has expired
    const expiresAt = new Date(invite.expires_at);
    const now = new Date();
    
    if (expiresAt < now) {
      // Mark as expired
      await serverSupabase
        .from('admin_invites')
        .update({ status: 'expired' })
        .eq('id', invite.id);

      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 410 }
      );
    }

    // Return invitation details
    const inviteDetails = {
      id: invite.id,
      email: invite.email,
      role: invite.role,
      expires_at: invite.expires_at,
      invited_by_email: invite.inviter?.email,
      invited_by_name: invite.inviter?.profiles?.full_name,
    };

    return NextResponse.json({ invite: inviteDetails });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}