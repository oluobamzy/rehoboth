// Events React Query hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Event, EventRegistration } from '@/services/eventService';

// Fetch events with filters
export function useEvents({
  page = 1,
  pageSize = 12,
  fromDate,
  toDate,
  category,
  eventType,
  featured,
  query,
  sortBy = 'start_datetime',
  sortOrder = 'asc',
} = {}) {
  return useQuery({
    queryKey: ['events', { page, pageSize, fromDate, toDate, category, eventType, featured, query, sortBy, sortOrder }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('pageSize', String(pageSize));
      if (fromDate) params.append('from_date', fromDate);
      if (toDate) params.append('to_date', toDate);
      if (category) params.append('category', category);
      if (eventType) params.append('type', eventType);
      if (featured !== undefined) params.append('featured', String(featured));
      if (query) params.append('query', query);
      if (sortBy) params.append('sort_by', sortBy);
      if (sortOrder) params.append('sort_order', sortOrder);
      
      const response = await fetch(`/api/events?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Fetch a single event by ID
export function useEvent(id) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await fetch(`/api/events/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch event');
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Register for an event
export function useEventRegistration() {
  const queryClient = useQueryClient();
  
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
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
    },
  });
}

// Cancel event registration
export function useCancelRegistration() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ eventId, registrationId }) => {
      const response = await fetch(`/api/events/${eventId}/register/${registrationId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel registration');
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
    },
  });
}

// Admin hooks

// Fetch all events (including unpublished) for admin
export function useAdminEvents({
  page = 1,
  pageSize = 20,
  fromDate,
  toDate,
  category,
  eventType,
  query,
  sortBy = 'start_datetime',
  sortOrder = 'asc',
} = {}) {
  return useQuery({
    queryKey: ['admin', 'events', { page, pageSize, fromDate, toDate, category, eventType, query, sortBy, sortOrder }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('pageSize', String(pageSize));
      if (fromDate) params.append('from_date', fromDate);
      if (toDate) params.append('to_date', toDate);
      if (category) params.append('category', category);
      if (eventType) params.append('type', eventType);
      if (query) params.append('query', query);
      if (sortBy) params.append('sort_by', sortBy);
      if (sortOrder) params.append('sort_order', sortOrder);
      
      const response = await fetch(`/api/admin/events/get-all?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Create a new event
export function useCreateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (eventData) => {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create event');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all event queries
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
    },
  });
}

// Update an event
export function useUpdateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, eventData }) => {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update event');
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['event', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
    },
  });
}

// Delete an event
export function useDeleteEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete event');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all event queries
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
    },
  });
}

// Fetch registrations for an event
export function useEventRegistrations(eventId) {
  return useQuery({
    queryKey: ['admin', 'event', eventId, 'registrations'],
    queryFn: async () => {
      if (!eventId) return { registrations: [] };
      const response = await fetch(`/api/admin/events/${eventId}/registrations`);
      if (!response.ok) {
        throw new Error('Failed to fetch registrations');
      }
      return response.json();
    },
    enabled: !!eventId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Update registration status
export function useUpdateRegistrationStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ registrationId, status, eventId }) => {
      const response = await fetch(`/api/admin/events/registrations/${registrationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update registration status');
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ['admin', 'event', variables.eventId, 'registrations'] 
      });
    },
  });
}
