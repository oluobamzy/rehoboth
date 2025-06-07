// Type-safe wrapper for useEvents.js
import { useMutation, useQuery, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { fetchEvents } from '@/services/eventService';

// Define the types for event data
export interface Event {
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
  category?: string;
  contact_email?: string;
  contact_phone?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

// Define filter types
export interface EventFilters {
  page?: number;
  pageSize?: number;
  fromDate?: string | null;
  toDate?: string | null;
  category?: string | null;
  eventType?: string | null;
  featured?: boolean | null;
  query?: string | null;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Define the response type for events
export interface EventsResponse {
  events: Event[];
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  }
}

// Define the types for the registration functionality
export interface RegistrationFormData {
  attendee_name: string;
  attendee_email: string;
  attendee_phone: string;
  party_size: number;
  special_requests: string;
}

export interface RegistrationParams {
  eventId: string;
  registrationData: RegistrationFormData;
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

// Events query hook
export function useEvents(filters: EventFilters = {}): UseQueryResult<EventsResponse, Error> {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: async () => {
      // Build query string from filters
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
      if (filters.fromDate) params.append('fromDate', filters.fromDate);
      if (filters.toDate) params.append('toDate', filters.toDate);
      if (filters.category) params.append('category', filters.category);
      if (filters.eventType) params.append('eventType', filters.eventType);
      if (filters.featured !== null && filters.featured !== undefined) 
        params.append('featured', filters.featured.toString());
      if (filters.query) params.append('query', filters.query);
      
      const response = await fetch(`/api/events?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      return response.json();
    }
  });
}

// Admin events query hook - includes unpublished events
export function useAdminEvents(filters: EventFilters = {}): UseQueryResult<EventsResponse, Error> {
  return useQuery({
    queryKey: ['admin-events', filters],
    queryFn: async () => {
      try {
        // Call the server-side fetchEvents function directly
        const { events, count } = await fetchEvents({
          page: filters.page || 1,
          pageSize: filters.pageSize || 20,
          fromDate: filters.fromDate,
          toDate: filters.toDate,
          category: filters.category,
          eventType: filters.eventType,
          featured: filters.featured,
          query: filters.query,
          sortBy: filters.sortBy || 'start_datetime',
          sortOrder: filters.sortOrder || 'desc',
          onlyPublished: false,
          includeUnpublished: true
        });

        return {
          events: events || [],
          pagination: {
            page: filters.page || 1,
            totalPages: Math.ceil((count || 0) / (filters.pageSize || 20)),
            totalItems: count || 0,
            pageSize: filters.pageSize || 20
          }
        };
      } catch (error) {
        console.error('Error in useAdminEvents:', error);
        throw error;
      }
    }
  });
}

// Single event query hook
export function useEvent(id: string): UseQueryResult<Event, Error> {
  return useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const response = await fetch(`/api/events/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch event');
      }
      
      return response.json();
    },
    enabled: !!id
  });
}

// Create a typed version of useEventRegistration
export function useTypedEventRegistration(): UseMutationResult<
  RegistrationResponse,
  RegistrationError,
  RegistrationParams,
  unknown
> {
  return useMutation({
    mutationFn: async ({ eventId, registrationData }) => {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to register for event');
      }
      
      return response.json();
    },
  });
}

// Delete event mutation hook
export function useDeleteEvent(): UseMutationResult<boolean, Error, string, unknown> {
  return useMutation({
    mutationFn: async (eventId: string) => {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete event');
      }
      
      return true;
    },
  });
}
