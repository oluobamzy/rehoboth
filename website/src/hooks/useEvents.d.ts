// Type declarations for useEvents.js
import { UseMutationResult, UseQueryResult } from '@tanstack/react-query';

// Event interface
interface Event {
  id: string;
  title: string;
  description?: string;
  start_datetime: string;
  end_datetime: string;
  location_name?: string;
  location_address?: string;
  max_capacity?: number;
  registration_required: boolean;
  registration_deadline?: string;
  cost_cents: number;
  is_featured: boolean;
  is_published: boolean;
  event_type: string;
  categories?: string[];
  contact_email?: string;
  contact_phone?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

// Event registration interface
interface EventRegistration {
  id: string;
  event_id: string;
  attendee_name: string;
  attendee_email: string;
  attendee_phone?: string;
  party_size: number;
  special_requests?: string;
  registration_status: 'confirmed' | 'waitlist' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_intent_id?: string;
  registered_at: string;
  updated_at: string;
  event?: Event;
}

// Declare the hooks in the module
declare module '@/hooks/useEvents' {
  // Query hooks
  export function useEvents(params?: any): UseQueryResult<any, Error>;
  export function useEvent(id: string): UseQueryResult<Event, Error>;
  export function useEventRegistrations(eventId: string): UseQueryResult<any, Error>;
  
  // Mutation hooks
  export function useEventRegistration(): UseMutationResult<any, any, any, any>;
  export function useCancelRegistration(): UseMutationResult<any, any, any, any>;
  export function useUpdateRegistrationStatus(): UseMutationResult<any, any, any, any>;
  export function useCreateEvent(): UseMutationResult<any, any, any, any>;
  export function useUpdateEvent(): UseMutationResult<any, any, any, any>;
  export function useDeleteEvent(): UseMutationResult<any, any, any, any>;
  
  // Export Event and EventRegistration interfaces
  export { Event, EventRegistration };
}
