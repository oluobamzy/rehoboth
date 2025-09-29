// src/app/api/admin/users/invites/[id]/resend/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const inviteId = params.id;

    // Get database connection
    const { serverSupabase } = await import('@/services/server/eventService.server');
    
    // Get the existing invitation
    const { data: invite, error: fetchError } = await serverSupabase
      .from('admin_invites')
      .select('*')
      .eq('id', inviteId)
      .single();
    
    if (fetchError || !invite) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    // Generate new invitation token and extend expiry
    const newInviteToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    // Update invitation with new token and expiry
    const { error } = await serverSupabase
      .from('admin_invites')
      .update({ 
        invite_token: newInviteToken,
        expires_at: expiresAt.toISOString(),
        status: 'pending'
      })
      .eq('id', inviteId);
    
    if (error) {
      console.error('Error updating invite:', error);
      return NextResponse.json(
        { error: 'Failed to resend invitation' },
        { status: 500 }
      );
    }

    // TODO: Send email invitation (implement email service)
    console.log(`Invitation resent for ${invite.email} with new token: ${newInviteToken}`);
    console.log(`Invite link: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/invite?token=${newInviteToken}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Invitation resent successfully' 
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}