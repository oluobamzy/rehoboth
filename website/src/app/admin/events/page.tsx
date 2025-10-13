"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/services/auth';
import { fetchEvents, Event } from '@/services/eventService';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function AdminEventsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.push('/auth/login');
      return;
    }

    async function loadEvents() {
      try {
        setLoading(true);
        const { events: eventsData, error: fetchError } = await fetchEvents({
          onlyPublished: false,
          includeUnpublished: true,
          limit: 50,
        });
        
        if (fetchError) {
          throw new Error(fetchError);
        }
        
        setEvents(eventsData || []);
      } catch (err) {
        console.error('Error loading events:', err);
        setError(err instanceof Error ? err.message : 'Failed to load events');
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, [user, router]);

  // Handle create new event
  const handleCreateEvent = () => {
    router.push('/admin/events/new');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Manage Events</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <button 
            onClick={handleCreateEvent}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm sm:text-base"
          >
            Create New Event
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">No events found</h3>
          <p className="mt-2 text-gray-600">Create your first event to get started.</p>
          <button
            onClick={handleCreateEvent}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Create New Event
          </button>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th scope="col" className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registrations
                  </th>
                  <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event.id}>
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex items-center">
                        {event.image_url ? (
                          <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                            <img className="h-8 w-8 sm:h-10 sm:w-10 rounded-md object-cover" src={event.image_url} alt={event.title} />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 rounded-md flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-6 sm:w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                          <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">{event.title}</div>
                          <div className="text-xs text-gray-500 truncate">{event.event_type}</div>
                          <div className="sm:hidden mt-1 space-y-1">
                            <div className="text-xs text-gray-600">
                              {new Date(event.start_datetime).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-600">
                              {new Date(event.start_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              {' '} - {' '}
                              {new Date(event.end_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                            <div className="text-xs text-gray-600 md:hidden">
                              Registration: {event.registration_required ? 'Required' : 'None'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(event.start_datetime).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(event.start_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        {' '} - {' '}
                        {new Date(event.end_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        event.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {event.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.registration_required ? 'Required' : 'None'}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 items-end sm:items-center">
                        <Link
                          href={`/admin/events/${event.id}`}
                          className="text-blue-600 hover:text-blue-900 text-xs sm:text-sm"
                        >
                          Edit
                        </Link>
                        {event.registration_required && (
                          <Link
                            href={`/admin/events/${event.id}/registrations`}
                            className="text-purple-600 hover:text-purple-900 text-xs sm:text-sm"
                          >
                            Registrations
                          </Link>
                        )}
                        <Link
                          href={`/events/${event.id}`}
                          target="_blank"
                          className="text-green-600 hover:text-green-900 text-xs sm:text-sm"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
