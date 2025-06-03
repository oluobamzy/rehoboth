// Rate limiting middleware for Supabase Auth
// Create this as a Supabase Edge Function

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

// Simple in-memory store for rate limiting
// In production, use Redis or another distributed store
const ipAttempts = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT = {
  MAX_ATTEMPTS: 5,
  WINDOW_MS: 60 * 1000, // 1 minute
  LOCKOUT_MS: 15 * 60 * 1000, // 15 minutes
};

serve(async (req: Request) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers });
  }

  try {
    // Parse request
    const { email, action } = await req.json();
    
    if (!action || (action !== 'login' && action !== 'signup' && action !== 'reset')) {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Must be login, signup, or reset' }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }

    // Get client IP
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown-ip';
    
    // Get current attempts for this IP
    const now = Date.now();
    const ipData = ipAttempts.get(clientIp);
    
    // Check if IP is currently locked out
    if (ipData && ipData.resetAt > now) {
      const remainingSeconds = Math.ceil((ipData.resetAt - now) / 1000);
      return new Response(
        JSON.stringify({
          allowed: false,
          message: `Too many attempts. Try again in ${remainingSeconds} seconds.`,
          retryAfter: remainingSeconds,
        }),
        { status: 429, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }
    
    // Reset expired rate limit data
    if (ipData && ipData.resetAt <= now) {
      ipAttempts.delete(clientIp);
    }
    
    // Increment attempt counter
    const currentData = ipAttempts.get(clientIp) || { count: 0, resetAt: now + RATE_LIMIT.WINDOW_MS };
    currentData.count++;
    
    // Check if exceeded rate limit
    if (currentData.count > RATE_LIMIT.MAX_ATTEMPTS) {
      currentData.resetAt = now + RATE_LIMIT.LOCKOUT_MS;
      ipAttempts.set(clientIp, currentData);
      
      return new Response(
        JSON.stringify({
          allowed: false,
          message: `Too many attempts. Try again in ${RATE_LIMIT.LOCKOUT_MS / 1000} seconds.`,
          retryAfter: RATE_LIMIT.LOCKOUT_MS / 1000,
        }),
        { status: 429, headers: { ...headers, 'Content-Type': 'application/json' } }
      );
    }
    
    // Update attempt counter
    ipAttempts.set(clientIp, currentData);
    
    // Request is allowed
    return new Response(
      JSON.stringify({
        allowed: true,
        remainingAttempts: RATE_LIMIT.MAX_ATTEMPTS - currentData.count,
      }),
      { status: 200, headers: { ...headers, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...headers, 'Content-Type': 'application/json' } }
    );
  }
});
