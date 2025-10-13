// src/app/api/auth/invite/complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { token, fullName } = await req.json();

    if (!token || !fullName) {
      return NextResponse.json(
        { error: 'Token and full name are required' },
        { status: 400 }
      );
    }

    // Get the current authenticated user
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get database connection with service role for admin operations
    const { serverSupabase } = await import('@/services/server/eventService.server');
    
    // Find and validate the invitation
    const { data: invite, error: inviteError } = await serverSupabase
      .from('admin_invites')
      .select('*')
      .eq('invite_token', token)
      .eq('email', user.email)
      .eq('status', 'pending')
      .single();
    
    if (inviteError || !invite) {
      return NextResponse.json(
        { error: 'Invalid invitation or invitation already processed' },
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

    // Update user metadata with admin role and confirm email
    const { error: updateUserError } = await serverSupabase.auth.admin.updateUserById(
      user.id,
      {
        email_confirm: true, // Auto-confirm email for invited users
        user_metadata: {
          ...user.user_metadata,
          role: invite.role,
          full_name: fullName,
          invited_by: invite.invited_by,
          invitation_accepted_at: new Date().toISOString()
        }
      }
    );

    if (updateUserError) {
      console.error('Error updating user metadata:', updateUserError);
      return NextResponse.json(
        { error: 'Failed to update user role' },
        { status: 500 }
      );
    }

    // Create or update profile
    const { error: profileError } = await serverSupabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: fullName,
        role: invite.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Don't fail the request if profile creation fails
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
        user.email || '',
        fullName,
        invite.role as 'admin' | 'moderator'
      );
      
      if (!emailSent) {
        console.warn('Failed to send welcome email, but account was updated');
      }
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Don't fail the API call if email fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Admin account setup completed successfully',
      role: invite.role
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}