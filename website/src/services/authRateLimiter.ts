// src/services/authRateLimiter.ts
'use client';

export async function checkRateLimit(email: string, action: 'login' | 'signup' | 'reset') {
  try {
    // Access environment variables properly in client components
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Ensure we have the URL and key
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase URL or anon key missing');
      return { allowed: true }; // Fall back to allowing the request
    }
    
    const response = await fetch(`${supabaseUrl}/functions/v1/auth-rate-limit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ email, action }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      return { allowed: false, message: data.message || 'Rate limit exceeded', retryAfter: data.retryAfter };
    }
    
    return { allowed: true };
  } catch (error) {
    // If the rate limiting service fails, allow the request to proceed
    console.error('Rate limit check failed:', error);
    return { allowed: true };
  }
}
