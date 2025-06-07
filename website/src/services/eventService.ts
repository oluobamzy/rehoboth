// Service for events functionality
"use client";

import { supabase } from './supabase';
import { posthog } from './posthog';

// Define types based on the schema
export interface Event {
  id: string;
  title: string;
  description?: string;
  event_type: string;
  start_datetime: string;
  end_datetime: string;
  location_name?: string;
  location_address?: string;
  location_coordinates?: any; // PostGIS POINT data
  max_capacity?: number;
  registration_required: boolean;
  registration_deadline?: string;
  cost_cents: number;
  image_url?: string;
  contact_email?: string;
  contact_phone?: string;
  is_featured: boolean;
  is_published: boolean;
  category?: string;
  created_at: string;
  updated_at: string;
}

// Add realtime subscription types
export type RealtimeSubscription = {
  subscription: any;
  unsubscribe: () => void;
};

export interface EventRegistration {
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

export interface PaginatedEvents {
  events: Event[];
  count: number | null;
  error?: string | null;
}

// Helper function to check if tables exist
async function checkTablesExist() {
  try {
    console.log('Checking if events tables exist...');
    const { data: eventsCheck, error: eventsError } = await supabase
      .from('events')
      .select('id')
      .limit(1);
    
    console.log('Events check result:', eventsCheck ? 'Success' : 'Failed', eventsError);
    
    const { data: registrationsCheck, error: registrationsError } = await supabase
      .from('event_registrations')
      .select('id')
      .limit(1);
    
    console.log('Registrations check result:', registrationsCheck ? 'Success' : 'Failed', registrationsError);
    
    const eventsTableExists = eventsCheck !== null || (eventsError && !eventsError.message.includes('does not exist'));
    const registrationsTableExists = registrationsCheck !== null || (registrationsError && !registrationsError.message.includes('does not exist'));
    
    return {
      eventsTable: eventsTableExists,
      registrationsTable: registrationsTableExists,
      errors: {
        events: eventsError?.message,
        registrations: registrationsError?.message
      }
    };
  } catch (error) {
    console.error('Error checking tables:', error);
    return {
      eventsTable: false,
      registrationsTable: false,
      errors: {
        general: error instanceof Error ? error.message : 'Unknown error checking tables'
      }
    };
  }
}

// Fetch events with optional filters
export async function fetchEvents({
  page = 1,
  pageSize = 12,
  fromDate = null,
  toDate = null,
  category = null,
  eventType = null,
  featured = null,
  query = null,
  sortBy = 'start_datetime',
  sortOrder = 'asc',
  onlyPublished = true,
  includeUnpublished = false,
  limit
}: {
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
  onlyPublished?: boolean;
  includeUnpublished?: boolean;
  limit?: number;
}): Promise<{ events: Event[], count: number, error?: string | null }> {
  try {
    // Check if tables exist first
    const tables = await checkTablesExist();
    if (!tables.eventsTable) {
      console.error('Events table does not exist');
      return { events: [], count: 0 };
    }

    // Calculate pagination
    const actualLimit = limit || pageSize;
    const from = (page - 1) * actualLimit;
    const to = from + actualLimit - 1;

    // Start building the query
    let queryBuilder = supabase
      .from('events')
      .select('*', { count: 'exact' });

    // Add filters if provided
    if (onlyPublished && !includeUnpublished) {
      queryBuilder = queryBuilder.eq('is_published', true);
    }

    if (fromDate) {
      queryBuilder = queryBuilder.gte('start_datetime', fromDate);
    }

    if (toDate) {
      queryBuilder = queryBuilder.lte('end_datetime', toDate);
    }

    if (category) {
      queryBuilder = queryBuilder.eq('category', category);
    }

    if (eventType) {
      queryBuilder = queryBuilder.eq('event_type', eventType);
    }

    if (featured !== null) {
      queryBuilder = queryBuilder.eq('is_featured', featured);
    }

    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }

    // Add sorting and pagination
    const { data: events, error, count } = await queryBuilder
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);

    if (error) {
      console.error('Error fetching events:', error);
      return { events: [], count: 0, error: error.message };
    }

    // Log analytics
    posthog?.capture('events_fetched', {
      page,
      pageSize,
      filters: {
        fromDate,
        toDate,
        category,
        eventType,
        featured,
        query
      },
      resultCount: events?.length || 0
    });

    return {
      events: events || [],
      count: count ?? 0, // Convert null to 0
      error: null
    };
  } catch (error) {
    console.error('Error in fetchEvents:', error);
    return { 
      events: [], 
      count: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Fetch a single event by ID
export async function fetchEventById(id: string): Promise<{ event: Event | null, error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching event:', error);
      return { event: null, error: error.message };
    }

    // Track event view
    posthog?.capture('event_viewed', {
      eventId: id,
      title: data.title,
      eventType: data.event_type
    });

    return { event: data, error: null };
  } catch (error) {
    console.error('Error in fetchEventById:', error);
    return { event: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Create a new event registration
export async function registerForEvent(eventId: string, registration: Partial<EventRegistration>): Promise<{
  success: boolean;
  registration?: EventRegistration;
  status?: 'confirmed' | 'waitlist';
  confirmationCode?: string;
  paymentRequired: boolean;
  error?: string;
}> {
  try {
    // Import email service functions dynamically to avoid server/client mismatch
    const { sendRegistrationConfirmation, sendWaitlistNotification } = await import('./emailService');

    // 1. Fetch the event to check capacity
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      console.error('Error fetching event for registration:', eventError);
      return { success: false, paymentRequired: false, error: 'Event not found' };
    }

    // 2. Check if registration is required and open
    if (!event.registration_required) {
      return { success: false, paymentRequired: false, error: 'Registration not required for this event' };
    }

    if (event.registration_deadline && new Date(event.registration_deadline) < new Date()) {
      return { success: false, paymentRequired: false, error: 'Registration deadline has passed' };
    }

    // 3. Check capacity and get waitlist position if needed
    let status: 'confirmed' | 'waitlist' = 'confirmed';
    let waitlistPosition = 0;
    
    if (event.max_capacity) {
      // Get current registrations to calculate availability and waitlist position
      const { data: registrations, error: countError } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .not('registration_status', 'eq', 'cancelled');

      if (countError) {
        console.error('Error counting registrations:', countError);
      } else {
        // Calculate total attendees from the registrations
        const totalAttendees = registrations ? registrations.reduce(
          (sum, reg) => sum + (reg.party_size || 1), 0
        ) : 0;
        
        // Check if adding these attendees would exceed capacity
        if (event.max_capacity <= totalAttendees + (registration.party_size || 1)) {
          status = 'waitlist';
          // Calculate waitlist position
          const waitlistRegs = registrations?.filter(r => r.registration_status === 'waitlist') || [];
          waitlistPosition = waitlistRegs.length + 1;
        }
      }
    }

    // 4. Generate confirmation code
    const confirmationCode = generateConfirmationCode();

    // 5. Create registration
    const { data: newRegistration, error: registrationError } = await supabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
        attendee_name: registration.attendee_name,
        attendee_email: registration.attendee_email,
        attendee_phone: registration.attendee_phone,
        party_size: registration.party_size || 1,
        special_requests: registration.special_requests,
        registration_status: status,
        payment_status: event.cost_cents > 0 ? 'pending' : 'paid'
      })
      .select()
      .single();

    if (registrationError) {
      console.error('Error creating registration:', registrationError);
      return { success: false, paymentRequired: false, error: 'Failed to create registration' };
    }

    // 6. Send confirmation email
    try {
      if (status === 'confirmed') {
        await sendRegistrationConfirmation({
          event,
          registration: newRegistration,
          confirmationCode
        });
      } else if (status === 'waitlist') {
        await sendWaitlistNotification({
          event,
          registration: newRegistration,
          waitlistPosition
        });
      }
    } catch (emailError) {
      // Log email error but continue the registration process
      console.error('Error sending confirmation email:', emailError);
    }

    // Track registration
    posthog?.capture('event_registration', {
      eventId,
      registrationId: newRegistration.id,
      status,
      partySize: registration.party_size || 1
    });

    return {
      success: true,
      registration: newRegistration,
      status,
      confirmationCode,
      paymentRequired: event.cost_cents > 0
    };
  } catch (error) {
    console.error('Error in registerForEvent:', error);
    return { 
      success: false, 
      paymentRequired: false,
      error: error instanceof Error ? error.message : 'Unknown error during registration'
    };
  }
}

// Generate a random confirmation code
function generateConfirmationCode(): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Cancel event registration
export async function cancelRegistration(registrationId: string): Promise<boolean> {
  try {
    // Import email service dynamically to avoid server/client mismatch
    const { sendWaitlistPromotionNotification } = await import('./emailService');
    
    // Get the registration to be cancelled
    const { data: registration, error: regError } = await supabase
      .from('event_registrations')
      .select('*, event:events(*)')
      .eq('id', registrationId)
      .single();

    if (regError) {
      console.error('Error fetching registration:', regError);
      return false;
    }
    
    // Mark the registration as cancelled
    const { error } = await supabase
      .from('event_registrations')
      .update({ registration_status: 'cancelled' })
      .eq('id', registrationId);

    if (error) {
      console.error('Error cancelling registration:', error);
      return false;
    }
    
    // If this was a confirmed registration and the event has a waitlist,
    // promote the next waitlisted attendee
    if (registration.registration_status === 'confirmed') {
      // Check if the event has a waitlist
      const { data: waitlistRegistrations, error: waitlistError } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', registration.event_id)
        .eq('registration_status', 'waitlist')
        .order('registered_at', { ascending: true })
        .limit(1);
      
      if (waitlistError) {
        console.error('Error checking waitlist:', waitlistError);
      } else if (waitlistRegistrations && waitlistRegistrations.length > 0) {
        // Promote the first waitlisted person
        const nextRegistration = waitlistRegistrations[0];
        
        // Update status to confirmed
        const { error: updateError } = await supabase
          .from('event_registrations')
          .update({ registration_status: 'confirmed' })
          .eq('id', nextRegistration.id);
          
        if (updateError) {
          console.error('Error promoting waitlisted registration:', updateError);
        } else {
          // Send promotion notification
          try {
            await sendWaitlistPromotionNotification({
              event: registration.event,
              registration: nextRegistration
            });
          } catch (emailError) {
            console.error('Error sending waitlist promotion notification:', emailError);
          }
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error in cancelRegistration:', error);
    return false;
  }
}

// Generate iCal format for a single event
export function generateEventIcal(event: Event): string {
  const startDate = new Date(event.start_datetime).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/g, '');
  const endDate = new Date(event.end_datetime).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/g, '');
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Rehoboth Church//Event Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${event.id}@rehoboth-church.org
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location_name || ''}, ${event.location_address || ''}
URL:https://rehoboth-church.org/events/${event.id}
END:VEVENT
END:VCALENDAR`;
}

// Generate iCal format for multiple events
export function generateCalendarFeed(events: Event[]): string {
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Rehoboth Church//Event Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
${events.map(event => {
  const startDate = new Date(event.start_datetime).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/g, '');
  const endDate = new Date(event.end_datetime).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/g, '');
  
  return `BEGIN:VEVENT
UID:${event.id}@rehoboth-church.org
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location_name || ''}, ${event.location_address || ''}
URL:https://rehoboth-church.org/events/${event.id}
END:VEVENT`;
}).join('\n')}
END:VCALENDAR`;
}

// Admin functions

// Create a new event
export async function createEvent(eventData: Partial<Event>): Promise<{ event: Event | null, error: string | null }> {
  try {
    const { data, error } = await supabase
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
      console.error('Error creating event:', error);
      return { event: null, error: error.message };
    }

    return { event: data, error: null };
  } catch (error) {
    console.error('Error in createEvent:', error);
    return { event: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Update an existing event
export async function updateEvent(eventData: { id: string } & Partial<Event>): Promise<{ success: boolean, error: string | null }> {
  try {
    const { data, error } = await supabase
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
      .eq('id', eventData.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating event:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error in updateEvent:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error updating event' };
  }
}

// Delete an event
export async function deleteEvent(id: string): Promise<{ success: boolean, error: string | null }> {
  try {
    // Check if there are registrations
    const { count } = await supabase
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', id);

    // If there are registrations, just unpublish the event
    if (count && count > 0) {
      const { error } = await supabase
        .from('events')
        .update({ is_published: false })
        .eq('id', id);
      
      if (error) {
        console.error('Error unpublishing event:', error);
        return { success: false, error: error.message };
      }
    } else {
      // Otherwise, delete the event
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting event:', error);
        return { success: false, error: error.message };
      }
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error in deleteEvent:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error deleting event' };
  }
}

// Fetch registrations for an event
export async function fetchEventRegistrations(eventId: string): Promise<{ registrations: EventRegistration[], error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .order('registered_at', { ascending: false });

    if (error) {
      console.error('Error fetching event registrations:', error);
      return { registrations: [], error: error.message };
    }

    return { registrations: data || [], error: null };
  } catch (error) {
    console.error('Error in fetchEventRegistrations:', error);
    return { registrations: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Update registration status
export async function updateRegistrationStatus(
  registrationId: string, 
  status: 'confirmed' | 'waitlist' | 'cancelled'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('event_registrations')
      .update({ registration_status: status })
      .eq('id', registrationId);

    if (error) {
      console.error('Error updating registration status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateRegistrationStatus:', error);
    return false;
  }
}

// Subscribe to real-time event registration changes
export function subscribeToEventRegistrations(
  eventId: string, 
  callback: (payload: any) => void
): RealtimeSubscription {
  // Subscribe to changes in the event_registrations table filtered by the event_id
  const subscription = supabase
    .channel(`event-registrations-${eventId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'event_registrations',
      filter: `event_id=eq.${eventId}`
    }, payload => {
      callback(payload);
    })
    .subscribe();
  
  // Return the subscription and an unsubscribe function
  return {
    subscription,
    unsubscribe: () => {
      supabase.removeChannel(subscription);
    }
  };
}

// Get current event capacity information
export async function getEventCapacity(eventId: string): Promise<{
  total: number;
  registered: number;
  available: number;
  isWaitlist: boolean;
}> {
  try {
    // Get event details to check max capacity
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('max_capacity')
      .eq('id', eventId)
      .single();
    
    if (eventError || !event) {
      console.error('Error fetching event capacity:', eventError);
      return { total: 0, registered: 0, available: 0, isWaitlist: false };
    }

    // Count confirmed registrations and their party size
    const { data: registrations, error: regError } = await supabase
      .from('event_registrations')
      .select('party_size')
      .eq('event_id', eventId)
      .eq('registration_status', 'confirmed');
    
    if (regError) {
      console.error('Error counting registrations:', regError);
      return { 
        total: event.max_capacity || 0, 
        registered: 0, 
        available: event.max_capacity || 0,
        isWaitlist: false
      };
    }

    // Sum up total registered attendees based on party size
    const registered = registrations?.reduce((sum, reg) => sum + (reg.party_size || 1), 0) || 0;
    const total = event.max_capacity || 0;
    const available = Math.max(0, total - registered);
    const isWaitlist = total > 0 && registered >= total;

    return {
      total,
      registered,
      available,
      isWaitlist
    };
  } catch (error) {
    console.error('Error in getEventCapacity:', error);
    return { total: 0, registered: 0, available: 0, isWaitlist: false };
  }
}
