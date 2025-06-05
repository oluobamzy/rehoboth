// scripts/debug_test_login.js
// This script tests the basic supabase login flow with plain JS
// It's useful for debugging login issues independent of the React app
// Run with: node scripts/debug_test_login.js
// This generates a simple HTML file for testing login directly

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase URL or anon key in .env.local file');
  process.exit(1);
}

// Generate a test login HTML file
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Supabase Login Test</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    input, button { margin: 5px 0; padding: 8px; }
    button { cursor: pointer; background: #3182ce; color: white; border: none; }
    pre { background: #f5f5f5; padding: 10px; overflow: auto; }
    .success { color: green; }
    .error { color: red; }
  </style>
</head>
<body>
  <h1>Supabase Login Test</h1>
  <p>This page tests login with Supabase directly, bypassing the React app.</p>

  <div>
    <h2>Login</h2>
    <form id="loginForm">
      <div>
        <label for="email">Email:</label><br>
        <input type="email" id="email" required>
      </div>
      <div>
        <label for="password">Password:</label><br>
        <input type="password" id="password" required>
      </div>
      <button type="submit">Log In</button>
    </form>
    <div id="loginResult"></div>
  </div>

  <div>
    <h2>Current Session</h2>
    <button id="checkSession">Check Current Session</button>
    <pre id="sessionInfo">Click "Check Current Session" to see details</pre>
  </div>

  <div>
    <h2>Sign Out</h2>
    <button id="signOut">Sign Out</button>
    <div id="signOutResult"></div>
  </div>

  <div>
    <h2>Debug Tools</h2>
    <button id="clearStorage">Clear Local Storage</button>
    <button id="clearCookies">Clear All Cookies</button>
    <div id="debugResult"></div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script>
    // Initialize Supabase client
    const supabaseUrl = '${supabaseUrl}';
    const supabaseKey = '${supabaseAnonKey}';
    const supabase = supabase.createClient(supabaseUrl, supabaseKey);

    // Login form
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const resultElem = document.getElementById('loginResult');
      
      try {
        resultElem.innerHTML = 'Logging in...';
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
          resultElem.innerHTML = '<p class="error">Error: ' + error.message + '</p>';
        } else {
          resultElem.innerHTML = '<p class="success">Login successful!</p>';
          checkSession();
        }
      } catch (err) {
        resultElem.innerHTML = '<p class="error">Exception: ' + err.message + '</p>';
      }
    });

    // Check session
    async function checkSession() {
      const sessionInfoElem = document.getElementById('sessionInfo');
      
      try {
        sessionInfoElem.textContent = 'Checking session...';
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          sessionInfoElem.textContent = 'Error: ' + error.message;
        } else if (!data.session) {
          sessionInfoElem.textContent = 'No active session found';
        } else {
          const session = data.session;
          const user = session.user;
          
          let sessionInfo = 'Session found:\\n';
          sessionInfo += 'User: ' + user.email + '\\n';
          sessionInfo += 'User ID: ' + user.id + '\\n';
          sessionInfo += 'Role: ' + (user.app_metadata?.role || 'none') + '\\n';
          sessionInfo += 'Expires: ' + new Date(session.expires_at * 1000).toLocaleString() + '\\n\\n';
          
          sessionInfo += 'Full session data:\\n';
          sessionInfo += JSON.stringify(session, null, 2);
          
          sessionInfoElem.textContent = sessionInfo;
        }
      } catch (err) {
        sessionInfoElem.textContent = 'Exception: ' + err.message;
      }
    }

    // Sign out
    document.getElementById('signOut').addEventListener('click', async () => {
      const resultElem = document.getElementById('signOutResult');
      
      try {
        resultElem.innerHTML = 'Signing out...';
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          resultElem.innerHTML = '<p class="error">Error: ' + error.message + '</p>';
        } else {
          resultElem.innerHTML = '<p class="success">Signed out successfully</p>';
          checkSession();
        }
      } catch (err) {
        resultElem.innerHTML = '<p class="error">Exception: ' + err.message + '</p>';
      }
    });

    // Clear storage
    document.getElementById('clearStorage').addEventListener('click', () => {
      try {
        localStorage.clear();
        sessionStorage.clear();
        document.getElementById('debugResult').innerHTML = '<p class="success">Local & session storage cleared!</p>';
      } catch (err) {
        document.getElementById('debugResult').innerHTML = '<p class="error">Error: ' + err.message + '</p>';
      }
    });

    // Clear cookies
    document.getElementById('clearCookies').addEventListener('click', () => {
      try {
        const cookies = document.cookie.split(';');
        
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i];
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
        }
        
        document.getElementById('debugResult').innerHTML = 
          '<p class="success">All cookies cleared! (' + cookies.length + ' cookies)</p>';
      } catch (err) {
        document.getElementById('debugResult').innerHTML = '<p class="error">Error: ' + err.message + '</p>';
      }
    });

    // Check session button
    document.getElementById('checkSession').addEventListener('click', checkSession);
    
    // Check session on page load
    document.addEventListener('DOMContentLoaded', checkSession);
  </script>
</body>
</html>`;

// Write the HTML file
const outputPath = path.join(__dirname, '..', 'public', 'test_login.html');
fs.writeFileSync(outputPath, htmlContent);

console.log(`✅ Generated test login page at: ${outputPath}`);
console.log('Access it at: http://localhost:3000/test_login.html');
console.log('Use this page to test login directly with Supabase, bypassing your app code');
