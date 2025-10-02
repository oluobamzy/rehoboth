// src/app/api/auth/invite/accept/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { token, password, fullName } = await req.json();

    if (!token || !password || !fullName) {
      return NextResponse.json(
        { error: 'Token, password, and full name are required' },
        { status: 400 }
      );
    }

    // Get database connection
    const { serverSupabase } = await import('@/services/server/eventService.server');
    
    // Find and validate the invitation
    const { data: invite, error: inviteError } = await serverSupabase
      .from('admin_invites')
      .select('*')
      .eq('invite_token', token)
      .eq('status', 'pending')
      .single();
    
    if (inviteError || !invite) {
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

    // Check if user already exists
    const { data: users } = await serverSupabase.auth.admin.listUsers();
    const existingUser = users.users.find(u => u.email === invite.email);
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Instead of creating the user server-side (which has database issues),
    // return the invitation details so the frontend can handle signup
    // and then we'll update the role after successful signup
    
    // Mark invitation as in-progress to prevent concurrent usage
    const { error: markInProgressError } = await serverSupabase
      .from('admin_invites')
      .update({ 
        status: 'in_progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', invite.id);

    if (markInProgressError) {
      console.error('Error marking invitation as in progress:', markInProgressError);
      return NextResponse.json(
        { error: 'Failed to process invitation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Invitation validated. Please proceed with account creation.',
      invitation: {
        email: invite.email,
        role: invite.role,
        token: token
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}