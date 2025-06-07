// TypeScript declaration file for events hooks
import { UseMutationResult } from '@tanstack/react-query';

// Extend useEvents hooks with proper TypeScript typing
declare module '@/hooks/useEvents' {
  export interface EventRegistrationParams {
    eventId: string;
    registrationData: {
      attendee_name: string;
      attendee_email: string;
      attendee_phone: string;
      party_size: number;
      special_requests: string;
    };
  }

  export interface RegistrationResponse {
    success: boolean;
    registrationId: string;
    status: 'confirmed' | 'waitlist';
    confirmationCode?: string;
    paymentRequired: boolean;
    eventId?: string;
  }

  export interface RegistrationError {
    message: string;
  }

  // Re-declare the hook with proper typing
  export function useEventRegistration(): UseMutationResult<
    RegistrationResponse,
    RegistrationError,
    EventRegistrationParams,
    unknown
  >;
}
