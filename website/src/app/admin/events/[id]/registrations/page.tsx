"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/services/auth';
import ErrorMessage from '@/components/common/ErrorMessage';
import { fetchEventById, fetchEventRegistrations, Event, EventRegistration } from '@/services/eventService';
import Link from 'next/link';

interface RegistrationsPageProps {
  params: {
    id: string;
  };
}

export default function EventRegistrationsPage({ params }: RegistrationsPageProps) {
  const eventId = params.id;
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.push('/auth/login');
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        
        // Load event details
        const { event: eventData, error: eventError } = await fetchEventById(eventId);
        
        if (eventError) {
          throw new Error(eventError);
        }
        
        if (!eventData) {
          throw new Error('Event not found');
        }
        
        setEvent(eventData);
        
        // Load registrations
        const { registrations: registrationsData, error: registrationsError } = 
          await fetchEventRegistrations(eventId);
        
        if (registrationsError) {
          throw new Error(registrationsError);
        }
        
        setRegistrations(registrationsData || []);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [eventId, user, router]);

  if (!user) {
    return null; // Handled by useEffect redirect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Event Registrations</h1>
        <div className="space-x-2">
          <Link
            href={`/admin/events/${eventId}`}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Back to Event
          </Link>
          {event && (
            <Link
              href="/admin/events"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              All Events
            </Link>
          )}
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {event && (
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-2">{event.title}</h2>
              <p className="text-gray-600">
                {new Date(event.start_datetime).toLocaleDateString()} {' '}
                {new Date(event.start_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
              {event.max_capacity && (
                <p className="text-gray-600 mt-2">
                  Capacity: {registrations.filter(r => r.registration_status === 'confirmed').reduce((acc, curr) => acc + curr.party_size, 0)} / {event.max_capacity}
                </p>
              )}
            </div>
          )}

          {registrations.length === 0 ? (
            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <h3 className="text-lg font-medium text-gray-900">No registrations yet</h3>
              <p className="mt-2 text-gray-600">
                There are no registrations for this event yet.
              </p>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Party Size
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registered On
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {registrations.map((registration) => (
                    <tr key={registration.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {registration.attendee_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{registration.attendee_email}</div>
                        {registration.attendee_phone && (
                          <div className="text-sm text-gray-500">{registration.attendee_phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {registration.party_size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          registration.registration_status === 'confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : registration.registration_status === 'waitlist'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {registration.registration_status.charAt(0).toUpperCase() + registration.registration_status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          registration.payment_status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : registration.payment_status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {registration.payment_status.charAt(0).toUpperCase() + registration.payment_status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(registration.registered_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Download CSV button would typically go here */}
        </>
      )}
    </div>
  );
}
