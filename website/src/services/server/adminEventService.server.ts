// Server-side event admin service functions
// This file should only be imported in admin API routes or server components

import { serverSupabase, Event, EventRegistration } from './eventService.server';

/**
 * Fetch all events for admin (including unpublished)
 */
export async function fetchAllEvents({
  page = 1,
  pageSize = 20,
  fromDate = null,
  toDate = null,
  category = null,
  eventType = null,
  query = null,
  sortBy = 'start_datetime',
  sortOrder = 'asc',
}: {
  page?: number;
  pageSize?: number;
  fromDate?: string | null;
  toDate?: string | null;
  category?: string | null;
  eventType?: string | null;
  query?: string | null;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<{ events: Event[], count: number | null }> {
  try {
    // Calculate pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Start building the query - for admin we fetch ALL events including unpublished
    let queryBuilder = serverSupabase
      .from('events')
      .select('*', { count: 'exact' });

    // Add filters if provided
    if (fromDate) {
      queryBuilder = queryBuilder.gte('start_datetime', fromDate);
    }

    if (toDate) {
      queryBuilder = queryBuilder.lte('start_datetime', toDate);
    }

    if (category) {
      queryBuilder = queryBuilder.eq('category', category);
    }

    if (eventType) {
      queryBuilder = queryBuilder.eq('event_type', eventType);
    }

    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }

    // Apply sorting and pagination
    const { data: events, error, count } = await queryBuilder
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);

    if (error) {
      console.error('Server Admin: Error fetching events:', error);
      return { events: [], count: 0 };
    }

    return { events: events || [], count };
  } catch (error) {
    console.error('Server Admin: Error in fetchAllEvents:', error);
    return { events: [], count: 0 };
  }
}

/**
 * Create a new event
 */
export async function createEvent(eventData: Partial<Event>): Promise<Event | null> {
  try {
    const { data, error } = await serverSupabase
      .from('events')
      .insert({
        title: eventData.title,
        description: eventData.description,
        event_type: eventData.event_type,
        start_datetime: eventData.start_datetime,
        end_datetime: eventData.end_datetime,
        location_name: eventData.location_name,
        location_address: eventData.location_address,
        location_coordinates: eventData.location_coordinates,
        max_capacity: eventData.max_capacity,
        registration_required: eventData.registration_required ?? false,
        registration_deadline: eventData.registration_deadline,
        cost_cents: eventData.cost_cents ?? 0,
        image_url: eventData.image_url,
        contact_email: eventData.contact_email,
        contact_phone: eventData.contact_phone,
        is_featured: eventData.is_featured ?? false,
        is_published: eventData.is_published ?? true,
        category: eventData.category
      })
      .select()
      .single();

    if (error) {
      console.error('Server Admin: Error creating event:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Server Admin: Error in createEvent:', error);
    return null;
  }
}

/**
 * Update an existing event
 */
export async function updateEvent(id: string, eventData: Partial<Event>): Promise<Event | null> {
  try {
    const { data, error } = await serverSupabase
      .from('events')
      .update({
        title: eventData.title,
        description: eventData.description,
        event_type: eventData.event_type,
        start_datetime: eventData.start_datetime,
        end_datetime: eventData.end_datetime,
        location_name: eventData.location_name,
        location_address: eventData.location_address,
        location_coordinates: eventData.location_coordinates,
        max_capacity: eventData.max_capacity,
        registration_required: eventData.registration_required,
        registration_deadline: eventData.registration_deadline,
        cost_cents: eventData.cost_cents,
        image_url: eventData.image_url,
        contact_email: eventData.contact_email,
        contact_phone: eventData.contact_phone,
        is_featured: eventData.is_featured,
        is_published: eventData.is_published,
        category: eventData.category,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Server Admin: Error updating event:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Server Admin: Error in updateEvent:', error);
    return null;
  }
}

/**
 * Delete an event
 */
export async function deleteEvent(id: string): Promise<boolean> {
  try {
    const { error } = await serverSupabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Server Admin: Error deleting event:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Server Admin: Error in deleteEvent:', error);
    return false;
  }
}

/**
 * Get registrations for an event
 */
export async function getEventRegistrations(
  eventId: string
): Promise<{ registrations: EventRegistration[] }> {
  try {
    const { data, error } = await serverSupabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .order('registered_at', { ascending: false });

    if (error) {
      console.error('Server Admin: Error fetching registrations:', error);
      return { registrations: [] };
    }

    return { registrations: data || [] };
  } catch (error) {
    console.error('Server Admin: Error in getEventRegistrations:', error);
    return { registrations: [] };
  }
}

/**
 * Update registration status
 */
export async function updateRegistrationStatus(
  registrationId: string,
  status: 'confirmed' | 'waitlist' | 'cancelled'
): Promise<{ success: boolean, registration?: EventRegistration }> {
  try {
    const { data, error } = await serverSupabase
      .from('event_registrations')
      .update({
        registration_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', registrationId)
      .select()
      .single();

    if (error) {
      console.error('Server Admin: Error updating registration status:', error);
      return { success: false };
    }

    // In a real implementation, we would handle waitlist promotions here
    // when a registration is cancelled and spots become available

    return { success: true, registration: data };
  } catch (error) {
    console.error('Server Admin: Error in updateRegistrationStatus:', error);
    return { success: false };
  }
}
