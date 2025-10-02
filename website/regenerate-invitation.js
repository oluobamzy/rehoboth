#!/usr/bin/env node
// Regenerate admin invitation script
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function regenerateInvitation() {
  try {
    const email = 'oluidowu90@gmail.com';
    const oldToken = '6920706c5b1e0f035b20530662380b04fee9a7d996547f826d05ac63602bd711';
    
    console.log('🔄 Regenerating invitation for:', email);
    
    // First, cancel the old invitation
    console.log('1. Cancelling old invitation...');
    const { error: cancelError } = await supabase
      .from('admin_invites')
      .update({ status: 'cancelled' })
      .eq('invite_token', oldToken);
    
    if (cancelError) {
      console.error('❌ Error cancelling old invitation:', cancelError.message);
    } else {
      console.log('✅ Old invitation cancelled');
    }
    
    // Generate new invitation token
    const crypto = require('crypto');
    const newToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days
    
    console.log('2. Creating new invitation...');
    console.log('   New token:', newToken);
    console.log('   Expires:', expiresAt.toISOString());
    
    // Create new invitation
    const { data: newInvite, error: insertError } = await supabase
      .from('admin_invites')
      .insert({
        email: email,
        role: 'admin',
        invited_by: '1c79178f-ea97-42d4-b0cb-50d0061e85f9', // Your admin user ID
        invite_token: newToken,
        expires_at: expiresAt.toISOString(),
        status: 'pending'
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Error creating new invitation:', insertError.message);
    } else {
      console.log('✅ New invitation created successfully!');
      
      // Generate the correct URL
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rehobothcc.ca';
      const inviteUrl = `${siteUrl}/auth/invite?token=${newToken}`;
      
      console.log('');
      console.log('🎉 NEW INVITATION LINK:');
      console.log(inviteUrl);
      console.log('');
      console.log('📧 Invitation Details:');
      console.log('   Email:', email);
      console.log('   Role: Administrator');
      console.log('   Expires:', expiresAt.toLocaleDateString(), 'at', expiresAt.toLocaleTimeString());
      console.log('');
      console.log('👆 Use the link above to accept the invitation!');
    }
    
  } catch (error) {
    console.error('❌ Error regenerating invitation:', error.message);
  }
}

regenerateInvitation();