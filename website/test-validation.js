#!/usr/bin/env node
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testValidationLogic() {
  try {
    const token = '4c88b20a320767074e3d36c645827605a84c26f9096336e8db82f4f54fa526b9';
    
    console.log('🔍 Testing validation logic locally...');
    console.log('Token:', token);
    
    // Replicate the exact logic from the validation endpoint
    const { data: invite, error } = await supabase
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
    
    console.log('Database query result:');
    console.log('Error:', error);
    console.log('Invite:', invite);
    
    if (error || !invite) {
      console.log('❌ Database query failed or no invite found');
      return;
    }

    // Check if invitation has expired
    const expiresAt = new Date(invite.expires_at);
    const now = new Date();
    
    console.log('Expiry check:');
    console.log('Expires at:', expiresAt.toISOString());
    console.log('Current time:', now.toISOString());
    console.log('Is expired?', expiresAt < now);
    
    if (expiresAt < now) {
      console.log('❌ Invitation has expired');
      return;
    }

    // Return invitation details (what the API should return)
    const inviteDetails = {
      id: invite.id,
      email: invite.email,
      role: invite.role,
      expires_at: invite.expires_at,
      invited_by_email: invite.inviter?.email,
      invited_by_name: invite.inviter?.profiles?.full_name,
    };

    console.log('✅ Validation should succeed!');
    console.log('Invite details:', JSON.stringify(inviteDetails, null, 2));
    
  } catch (error) {
    console.error('❌ Error in validation logic:', error.message);
  }
}

testValidationLogic();