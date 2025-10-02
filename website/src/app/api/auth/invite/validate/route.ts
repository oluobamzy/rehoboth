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
    
    // Find the invitation by token (simplified query to avoid foreign key issues)
    const { data: invite, error } = await serverSupabase
      .from('admin_invites')
      .select('*')
      .eq('invite_token', token)
      .eq('status', 'pending')
      .single();
    
    if (error || !invite) {
      console.error('Validation error:', error);
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

    // Get inviter details separately if needed
    let inviterEmail = '';
    let inviterName = '';
    
    try {
      // Get inviter user info
      const { data: inviterUser } = await serverSupabase.auth.admin.getUserById(invite.invited_by);
      if (inviterUser?.user) {
        inviterEmail = inviterUser.user.email || '';
        
        // Try to get inviter profile name
        const { data: inviterProfile } = await serverSupabase
          .from('profiles')
          .select('full_name')
          .eq('id', invite.invited_by)
          .single();
        
        inviterName = inviterProfile?.full_name || '';
      }
    } catch (inviterError) {
      console.warn('Could not get inviter details:', inviterError);
      // Continue without inviter details
    }

    // Return invitation details
    const inviteDetails = {
      id: invite.id,
      email: invite.email,
      role: invite.role,
      expires_at: invite.expires_at,
      invited_by_email: inviterEmail,
      invited_by_name: inviterName,
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