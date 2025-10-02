// src/app/api/admin/users/invite/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/services/auth/apiAuth';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    console.log('📥 Admin invite request received');
    
    // Require admin authentication first
    const currentUser = await requireAdmin(req);
    console.log('✅ Admin authenticated, proceeding with invite...');

    const { email, role } = await req.json();

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    if (!['admin', 'moderator'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Get database connection
    const { serverSupabase } = await import('@/services/server/eventService.server');
    
    // Check if user is already registered
    const { data: users } = await serverSupabase.auth.admin.listUsers();
    const existingUser = users.users.find(u => u.email === email);
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Check if invitation already exists
    const { data: existingInvite, error: inviteCheckError } = await serverSupabase
      .from('admin_invites')
      .select('*')
      .eq('email', email)
      .eq('status', 'pending')
      .single();

    if (inviteCheckError && inviteCheckError.code !== 'PGRST116') {
      console.error('Error checking existing invite:', inviteCheckError);
      return NextResponse.json(
        { error: 'Failed to check existing invitations' },
        { status: 500 }
      );
    }

    if (existingInvite) {
      return NextResponse.json(
        { error: 'Invitation already sent to this email' },
        { status: 409 }
      );
    }

    // Generate invitation token
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    // Create invitation record using current authenticated admin user
    const { data: invite, error: insertError } = await serverSupabase
      .from('admin_invites')
      .insert({
        email,
        role,
        invited_by: currentUser.id,
        invite_token: inviteToken,
        expires_at: expiresAt.toISOString(),
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating invite:', insertError);
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 500 }
      );
    }

    // TODO: Send email invitation (implement email service)
    // For now, we'll just create the invitation record
    // In a real app, you would send an email with the invitation link:
    // const inviteLink = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/invite?token=${inviteToken}`;

    console.log(`Invitation created for ${email} with token: ${inviteToken}`);
    
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rehobothcc.ca';
    console.log(`Invite link: ${siteUrl}/auth/invite?token=${inviteToken}`);

    // Send invitation email
    try {
      const { sendAdminInvitation } = await import('@/services/emailService');
      
      // Get inviter profile for name
      const { data: inviterProfile } = await serverSupabase
        .from('profiles')
        .select('full_name')
        .eq('id', currentUser.id)
        .single();
      
      const emailSent = await sendAdminInvitation({
        email,
        role,
        inviteToken,
        inviterName: inviterProfile?.full_name,
        inviterEmail: currentUser.email || '',
        expiresAt: expiresAt.toISOString()
      });
      
      if (!emailSent) {
        console.warn('Failed to send invitation email, but invitation was created');
      }
    } catch (emailError) {
      console.error('Error sending invitation email:', emailError);
      // Don't fail the API call if email fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Invitation sent successfully',
      inviteId: invite.id
    });
  } catch (error) {
    console.error('❌ Unexpected error in admin invite:', error);
    
    // Check if it's an authentication error
    if (error instanceof Error && error.message.includes('required')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}