#!/usr/bin/env node
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkTokens() {
  const errorToken = '1bb58ce497e01aff9d9748251738ebfee84bad72950e8fce11064b1dc2522ebc';
  const correctToken = '4c88b20a320767074e3d36c645827605a84c26f9096336e8db82f4f54fa526b9';
  
  console.log('🔍 Checking both tokens...\n');
  
  // Check error token
  console.log('1. Error token:', errorToken);
  const { data: invite1, error: error1 } = await supabase
    .from('admin_invites')
    .select('*')
    .eq('invite_token', errorToken);
  
  if (error1 || !invite1 || invite1.length === 0) {
    console.log('   ❌ Not found in database\n');
  } else {
    console.log('   ✅ Found:', invite1[0].status, 'for', invite1[0].email, '\n');
  }
  
  // Check correct token  
  console.log('2. Correct token:', correctToken);
  const { data: invite2, error: error2 } = await supabase
    .from('admin_invites')
    .select('*')
    .eq('invite_token', correctToken);
  
  if (error2 || !invite2 || invite2.length === 0) {
    console.log('   ❌ Not found in database\n');
  } else {
    console.log('   ✅ Found:', invite2[0].status, 'for', invite2[0].email, '\n');
  }
  
  // Show all pending invites
  console.log('3. All pending invites:');
  const { data: allInvites, error: allError } = await supabase
    .from('admin_invites')
    .select('email, status, invite_token, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  
  if (allError || !allInvites || allInvites.length === 0) {
    console.log('   ❌ No pending invites found');
  } else {
    allInvites.forEach((inv, i) => {
      console.log(`   ${i+1}. Email: ${inv.email}`);
      console.log(`      Token: ${inv.invite_token}`);
      console.log(`      Created: ${new Date(inv.created_at).toLocaleString()}\n`);
    });
  }
}

checkTokens();