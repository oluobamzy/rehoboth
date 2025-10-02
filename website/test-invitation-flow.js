// Test the complete invitation flow
(async () => {
const token = '4c88b20a320767074e3d36c645827605a84c26f9096336e8db82f4f54fa526b9';
const testEmail = 'oluidowu90@gmail.com';
const testPassword = 'TestPassword123!';
const testFullName = 'Test User';

console.log('🧪 Testing complete invitation flow...');

// Step 1: Validate invitation
console.log('Step 1: Validating invitation...');
const validateResponse = await fetch('https://rehobothcc.ca/api/auth/invite/accept', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token, password: testPassword, fullName: testFullName })
});

if (!validateResponse.ok) {
  const error = await validateResponse.json();
  console.log('❌ Validation failed:', error);
  throw new Error('Validation failed');
}

const { invitation } = await validateResponse.json();
console.log('✅ Invitation validated:', invitation.email, invitation.role);

// Note: Step 2 (signup) would be done by Supabase client in browser
// Step 3 would be done after successful signup
console.log('✅ Validation flow complete. Frontend can now proceed with signup.');
console.log('📝 Next: User signs up with:', invitation.email);
console.log('📝 Then: Call /api/auth/invite/complete with token and fullName');
})();