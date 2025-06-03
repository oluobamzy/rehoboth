// src/services/authLogger.ts
'use client';

import { supabase } from './supabase';
import { posthog } from './posthog';

export enum AuthEvent {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  SIGNUP_SUCCESS = 'signup_success',
  SIGNUP_FAILURE = 'signup_failure',
  PASSWORD_RESET_REQUEST = 'password_reset_request',
  PASSWORD_RESET_SUCCESS = 'password_reset_success',
  PASSWORD_RESET_FAILURE = 'password_reset_failure',
  MFA_ENABLED = 'mfa_enabled',
  MFA_DISABLED = 'mfa_disabled',
  MFA_CHALLENGE_SUCCESS = 'mfa_challenge_success',
  MFA_CHALLENGE_FAILURE = 'mfa_challenge_failure',
  LOGOUT = 'logout',
  SESSION_REFRESH = 'session_refresh',
}

interface LogEventOptions {
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export async function logAuthEvent(
  event: AuthEvent,
  options: LogEventOptions = {}
): Promise<void> {
  try {
    // Get client IP and user agent
    const ipAddress = options.ipAddress || 'unknown';
    const userAgent = options.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown');
    
    // Log to database (if we have a service role key)
    const { error } = await supabase
      .from('auth_logs')
      .insert([
        {
          event_type: event,
          user_id: options.userId || null,
          email: options.email || null,
          ip_address: ipAddress,
          user_agent: userAgent,
          error_message: options.errorMessage || null,
          metadata: options.metadata || {},
        },
      ]);
    
    if (error) {
      console.error('Error logging auth event:', error);
    }
    
    // Also log to analytics
    posthog.capture(event, {
      userId: options.userId,
      email: options.email,
      errorMessage: options.errorMessage,
      ...options.metadata,
    });
    
  } catch (error) {
    console.error('Failed to log auth event:', error);
  }
}
