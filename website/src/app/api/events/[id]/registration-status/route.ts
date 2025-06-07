import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/services/server/eventService.server';

// GET /api/events/[id]/registration-status
// Get the status of a registration, including payment status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract event ID from params
    const eventId = params.id;
    const url = new URL(request.url);
    const registrationId = url.searchParams.get('registration');
    
    if (!eventId || !registrationId) {
      return NextResponse.json(
        { error: 'Event ID and Registration ID are required' },
        { status: 400 }
      );
    }
    
    // Get the registration details
    const { data: registration, error } = await serverSupabase
      .from('event_registrations')
      .select(`
        *,
        event:events (
          title,
          cost_cents
        )
      `)
      .eq('id', registrationId)
      .eq('event_id', eventId)
      .single();
    
    if (error || !registration) {
      console.error('Error fetching registration:', error);
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      status: registration.registration_status,
      paymentStatus: registration.payment_status,
      paymentRequired: (registration.event?.cost_cents || 0) > 0,
      eventTitle: registration.event?.title
    });
  } catch (error) {
    console.error(`Error in GET /api/events/${params.id}/registration-status:`, error);
    return NextResponse.json(
      { error: 'Failed to get registration status' },
      { status: 500 }
    );
  }
}
