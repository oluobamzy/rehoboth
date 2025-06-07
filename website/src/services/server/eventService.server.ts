// Server-side event service functions
// This file should only be imported in server components or API routes

import { createClient } from '@supabase/supabase-js';

// Initialize server-side Supabase client
// This client will work in API routes and server components
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('⚠️ Server: Missing Supabase URL or service key');
}

// Create server-side client with admin privileges
export const serverSupabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Define types (duplicated from client service to avoid imports)
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
  payment_failure_reason?: string;
  confirmation_code: string;
  registered_at: string;
  updated_at: string;
  event?: Event;
  waitlist_position?: number;
}

export interface PaginatedEvents {
  events: Event[];
  count: number | null;
}

// Helper function to check if tables exist
async function checkTablesExist() {
  try {
    console.log('Server: Checking if events tables exist...');
    const { data: eventsCheck, error: eventsError } = await serverSupabase
      .from('events')
      .select('id')
      .limit(1);
    
    const { data: registrationsCheck, error: registrationsError } = await serverSupabase
      .from('event_registrations')
      .select('id')
      .limit(1);
    
    const eventsTableExists = eventsCheck !== null || (eventsError && !eventsError.message.includes('does not exist'));
    const registrationsTableExists = registrationsCheck !== null || (registrationsError && !registrationsError.message.includes('does not exist'));
    
    return {
      eventsTable: eventsTableExists,
      registrationsTable: registrationsTableExists,
      errors: {
        events: eventsError,
        registrations: registrationsError
      }
    };
  } catch (error) {
    console.error('Server: Error checking tables:', error);
    return { eventsTable: false, registrationsTable: false, errors: { events: error, registrations: error } };
  }
}

// Generate a random confirmation code
function generateConfirmationCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing characters like I, O, 0, 1
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Fetch events with optional filters (server-side)
 */
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
  onlyPublished = true
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
}): Promise<PaginatedEvents> {
  try {
    // Check if tables exist first
    const tables = await checkTablesExist();
    if (!tables.eventsTable) {
      console.error('Server: Events table does not exist');
      return { events: [], count: 0 };
    }

    // Calculate pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Start building the query
    let queryBuilder = serverSupabase
      .from('events')
      .select('*', { count: 'exact' });

    // Add filters if provided
    if (onlyPublished) {
      queryBuilder = queryBuilder.eq('is_published', true);
    }

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

    if (featured !== null) {
      queryBuilder = queryBuilder.eq('is_featured', featured);
    }

    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }

    // Apply sorting and pagination
    const { data: events, error, count } = await queryBuilder
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);

    if (error) {
      console.error('Server: Error fetching events:', error);
      return { events: [], count: 0 };
    }

    return { events: events || [], count };
  } catch (error) {
    console.error('Server: Error in fetchEvents:', error);
    return { events: [], count: 0 };
  }
}

/**
 * Fetch a single event by ID (server-side)
 */
export async function fetchEventById(id: string): Promise<Event | null> {
  try {
    const { data, error } = await serverSupabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Server: Error fetching event:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Server: Error in fetchEventById:', error);
    return null;
  }
}

/**
 * Register for an event (server-side)
 */
export async function registerForEvent(
  eventId: string, 
  registration: Partial<EventRegistration>
): Promise<{
  success: boolean;
  registration?: EventRegistration;
  status?: 'confirmed' | 'waitlist';
  confirmationCode?: string;
  paymentRequired: boolean;
  error?: string;
}> {
  try {
    // 1. Fetch the event to check capacity
    const { data: event, error: eventError } = await serverSupabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      console.error('Server: Error fetching event for registration:', eventError);
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
      const { data: registrations, error: countError } = await serverSupabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .not('registration_status', 'eq', 'cancelled');

      if (countError) {
        console.error('Server: Error counting registrations:', countError);
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

    // 5. Create registration with confirmation code
    const { data: newRegistration, error: registrationError } = await serverSupabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
        attendee_name: registration.attendee_name,
        attendee_email: registration.attendee_email,
        attendee_phone: registration.attendee_phone,
        party_size: registration.party_size || 1,
        special_requests: registration.special_requests,
        registration_status: status,
        payment_status: event.cost_cents > 0 ? 'pending' : 'paid',
        confirmation_code: confirmationCode,
        registered_at: new Date().toISOString()
      })
      .select(`
        *,
        event:events (
          title,
          start_datetime,
          end_datetime,
          location_name,
          location_address,
          cost_cents,
          contact_email
        )
      `)
      .single();

    if (registrationError) {
      console.error('Server: Error creating registration:', registrationError);
      return { success: false, paymentRequired: false, error: 'Failed to create registration' };
    }

    // Return early if registration failed
    if (!newRegistration) {
      return { success: false, paymentRequired: false, error: 'Failed to create registration' };
    }

    return {
      success: true,
      registration: newRegistration,
      status,
      confirmationCode,
      paymentRequired: event.cost_cents > 0
    };
  } catch (error) {
    console.error('Server: Error in registerForEvent:', error);
    return { 
      success: false, 
      paymentRequired: false,
      error: error instanceof Error ? error.message : 'Unknown error during registration'
    };
  }
}

/**
 * Get current capacity for an event (server-side)
 */
export async function getServerEventCapacity(eventId: string): Promise<{
  total: number;
  registered: number;
  available: number;
  isWaitlist: boolean;
}> {
  try {
    // Get event details to check max capacity
    const { data: event, error: eventError } = await serverSupabase
      .from('events')
      .select('max_capacity')
      .eq('id', eventId)
      .single();
    
    if (eventError || !event) {
      console.error('Server: Error fetching event capacity:', eventError);
      return { total: 0, registered: 0, available: 0, isWaitlist: false };
    }

    // Count confirmed registrations and their party size
    const { data: registrations, error: regError } = await serverSupabase
      .from('event_registrations')
      .select('party_size')
      .eq('event_id', eventId)
      .eq('registration_status', 'confirmed');
    
    if (regError) {
      console.error('Server: Error counting registrations:', regError);
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
    console.error('Server: Error in getServerEventCapacity:', error);
    return { total: 0, registered: 0, available: 0, isWaitlist: false };
  }
}
