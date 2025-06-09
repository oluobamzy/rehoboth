// src/middleware-donation-security.ts
// This middleware can be integrated into the main middleware.ts file
// to provide additional security for the donation functionality

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_DONATION_REQUESTS = 10; // Maximum number of donation API requests per minute
const MAX_WEBHOOK_REQUESTS = 50; // Maximum number of webhook requests per minute

// Store for rate limiting (should be replaced with Redis in production)
const apiRateLimitStore: Record<string, { count: number, resetAt: number }> = {};

// Security middleware for donation routes
export function donationSecurityMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only apply to donation-related API routes
  if (pathname.startsWith('/api/donations') || pathname.startsWith('/api/webhooks/stripe')) {
    // Get client IP address (use X-Forwarded-For in production)
    const ipAddress = request.ip || 'unknown';
    
    // Determine rate limit parameters based on route
    const isWebhook = pathname.startsWith('/api/webhooks/stripe');
    const maxRequests = isWebhook ? MAX_WEBHOOK_REQUESTS : MAX_DONATION_REQUESTS;
    const rateLimitKey = `${ipAddress}:${isWebhook ? 'webhook' : 'donation'}`;
    
    // Check rate limit
    if (exceedsRateLimit(rateLimitKey, maxRequests)) {
      console.warn(`Rate limit exceeded for ${rateLimitKey}`);
      return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
        },
      });
    }
    
    // Verify webhook signatures (already implemented in the webhook handler)
    
    // Validate CSRF tokens for sensitive operations (should be implemented in the frontend)
    
    // Validate donation amount limits
    if (pathname === '/api/donations' && request.method === 'POST') {
      // This is just an example - the actual implementation would parse the request body
      // and validate the amount against min/max limits
      return validateDonationAmount(request);
    }
  }
  
  // Continue to the next middleware or route handler
  return NextResponse.next();
}

// Helper function to track and check rate limits
function exceedsRateLimit(key: string, maxRequests: number): boolean {
  const now = Date.now();
  
  // Clean up expired entries
  Object.keys(apiRateLimitStore).forEach(k => {
    if (apiRateLimitStore[k].resetAt < now) {
      delete apiRateLimitStore[k];
    }
  });
  
  // Get or create entry for this key
  if (!apiRateLimitStore[key] || apiRateLimitStore[key].resetAt < now) {
    apiRateLimitStore[key] = {
      count: 0,
      resetAt: now + RATE_LIMIT_WINDOW
    };
  }
  
  // Increment counter
  apiRateLimitStore[key].count += 1;
  
  // Check if exceeded
  return apiRateLimitStore[key].count > maxRequests;
}

// Helper function to validate donation amount (example implementation)
async function validateDonationAmount(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body = await request.json();
    const amount = body.amount;
    
    // Apply minimum and maximum donation limits
    const MIN_DONATION_CENTS = 100; // $1.00
    const MAX_DONATION_CENTS = 10000000; // $100,000.00
    
    if (amount < MIN_DONATION_CENTS) {
      return new NextResponse(JSON.stringify({ 
        error: 'Donation amount must be at least $1.00' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    if (amount > MAX_DONATION_CENTS) {
      return new NextResponse(JSON.stringify({ 
        error: 'Donation amount exceeds the maximum limit' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Continue processing the request
    return NextResponse.next();
  } catch (error) {
    console.error('Error validating donation amount:', error);
    return new NextResponse(JSON.stringify({ error: 'Invalid request format' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
