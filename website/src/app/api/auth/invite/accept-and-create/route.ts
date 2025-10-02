// src/app/api/auth/invite/accept-and-create/route.ts
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

    // Create the user account with auto-confirmed email
    const { data: newUser, error: createError } = await serverSupabase.auth.admin.createUser({
      email: invite.email,
      password: password,
      email_confirm: true, // Auto-confirm email since they were invited
      user_metadata: {
        role: invite.role,
        full_name: fullName,
        invited_by: invite.invited_by,
        invitation_accepted_at: new Date().toISOString()
      }
    });

    if (createError || !newUser.user) {
      console.error('Error creating user:', createError);
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    // The trigger should create the profile, but let's ensure it has the right role
    // Wait a moment for the trigger to execute
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update the profile to ensure it has the correct role and full_name
    const { error: profileError } = await serverSupabase
      .from('profiles')
      .update({
        role: invite.role,
        full_name: fullName,
        updated_at: new Date().toISOString()
      })
      .eq('id', newUser.user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      // Don't fail the request if profile update fails
    }

    // Mark invitation as accepted
    const { error: updateError } = await serverSupabase
      .from('admin_invites')
      .update({ 
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', invite.id);

    if (updateError) {
      console.error('Error updating invitation status:', updateError);
      // Don't fail the request if status update fails
    }

    // Send welcome email
    try {
      const { sendAdminWelcomeEmail } = await import('@/services/emailService');
      
      const emailSent = await sendAdminWelcomeEmail(
        invite.email,
        fullName,
        invite.role as 'admin' | 'moderator'
      );
      
      if (!emailSent) {
        console.warn('Failed to send welcome email, but account was created');
      }
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Don't fail the API call if email fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Account created successfully with confirmed email',
      userId: newUser.user.id
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}