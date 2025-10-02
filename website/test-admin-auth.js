#!/usr/bin/env node
// Test script to verify admin authentication is working
require('dotenv').config({ path: '.env' });

const fetch = require('node-fetch');

async function testAdminAuth() {
  console.log('🧪 Testing admin authentication fixes...\n');
  
  try {
    // Test 1: Try to access admin endpoint without authentication (should get 401)
    console.log('Test 1: Testing unauthenticated access...');
    const response1 = await fetch('http://localhost:3000/api/admin/users/invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        role: 'admin'
      })
    });
    
    console.log('Status:', response1.status);
    const data1 = await response1.json();
    console.log('Response:', data1);
    
    if (response1.status === 401) {
      console.log('✅ Test 1 PASSED: Properly returns 401 for unauthenticated requests\n');
    } else {
      console.log('❌ Test 1 FAILED: Expected 401 but got', response1.status, '\n');
    }
    
    // Test 2: Try to get admin users list (should also get 401)
    console.log('Test 2: Testing admin users endpoint...');
    const response2 = await fetch('http://localhost:3000/api/admin/users');
    
    console.log('Status:', response2.status);
    const data2 = await response2.json();
    console.log('Response:', data2);
    
    if (response2.status === 401) {
      console.log('✅ Test 2 PASSED: Properly returns 401 for unauthenticated requests\n');
    } else {
      console.log('❌ Test 2 FAILED: Expected 401 but got', response2.status, '\n');
    }
    
    console.log('🎉 Authentication tests completed!');
    console.log('💡 Now you should log in as an admin and try the invite functionality in the browser.');
    
  } catch (error) {
    console.error('❌ Error running tests:', error.message);
    console.log('\n💡 Make sure the development server is running on port 3000');
    console.log('Run: npm run dev');
  }
}

testAdminAuth();