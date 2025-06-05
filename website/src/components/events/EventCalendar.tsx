'use client';

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useRouter } from 'next/navigation';
import { useEvents } from '@/hooks/useEvents';
import { Event } from '@/services/eventService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';

interface EventCalendarProps {
  initialView?: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';
  height?: number | 'auto';
  eventLimit?: boolean;
  showFilters?: boolean;
  hideEventTypes?: string[];
}

export default function EventCalendar({
  initialView = 'dayGridMonth',
  height = 'auto',
  eventLimit = true,
  showFilters = true,
  hideEventTypes = []
}: EventCalendarProps) {
  const router = useRouter();
  const [view, setView] = useState(initialView);
  const [dateRange, setDateRange] = useState<{ fromDate: string | null, toDate: string | null }>({
    fromDate: null,
    toDate: null
  });

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  // Get date 6 months from now
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
  const sixMonthsDate = sixMonthsFromNow.toISOString().split('T')[0];

  // Set initial date range based on current month
  useEffect(() => {
    // Default to showing events from today to 6 months from now
    setDateRange({
      fromDate: today,
      toDate: sixMonthsDate
    });
  }, []);

  const {
    data: eventsData,
    isLoading,
    isError,
    error
  } = useEvents({
    pageSize: 1000,  // Get all events
    fromDate: dateRange.fromDate,
    toDate: dateRange.toDate,
    sortBy: 'start_datetime',
    sortOrder: 'asc',
    // Filter out event types that should be hidden
    eventType: hideEventTypes.length > 0 ? undefined : undefined
  });
  
  // Handle events fetched
  const events = eventsData?.events || [];

  // Handle date range changes from calendar
  const handleDatesSet = (dateInfo: any) => {
    const newFromDate = dateInfo.startStr.split('T')[0];
    const newToDate = dateInfo.endStr.split('T')[0];
    
    if (newFromDate !== dateRange.fromDate || newToDate !== dateRange.toDate) {
      setDateRange({
        fromDate: newFromDate,
        toDate: newToDate
      });
    }
  };

  // Handle event click
  const handleEventClick = (info: any) => {
    router.push(`/events/${info.event.id}`);
  };

  // Format events for FullCalendar
  const calendarEvents = events.map((event: Event) => ({
    id: event.id,
    title: event.title,
    start: new Date(event.start_datetime),
    end: new Date(event.end_datetime),
    allDay: false,
    url: null, // We'll handle navigation ourselves in the click handler
    classNames: [
      'event-type-' + event.event_type.toLowerCase().replace(' ', '-'),
      event.is_featured ? 'featured-event' : ''
    ],
    extendedProps: {
      description: event.description,
      location: event.location_name,
      type: event.event_type,
      category: event.category,
      isFeatured: event.is_featured,
      requiresRegistration: event.registration_required
    },
    backgroundColor: getEventColor(event.event_type),
    borderColor: getEventColor(event.event_type)
  }));

  // Get color based on event type
  function getEventColor(eventType: string): string {
    const colorMap: {[key: string]: string} = {
      'service': '#4f46e5', // indigo
      'study': '#0891b2', // cyan
      'social': '#65a30d', // lime
      'outreach': '#ea580c', // orange
      'children': '#7e22ce', // purple
      'youth': '#be185d', // pink
      'worship': '#b45309', // amber
      'prayer': '#1d4ed8', // blue
      'meeting': '#475569', // slate
    };
    
    return colorMap[eventType.toLowerCase()] || '#4f46e5';
  }

  if (isLoading) {
    return <div className="flex justify-center items-center p-12">
      <LoadingSpinner />
    </div>;
  }

  if (isError) {
    return <ErrorMessage message={error?.message || 'Failed to load events'} />;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {showFilters && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setView('dayGridMonth')}
              className={`px-4 py-2 rounded-md text-sm ${
                view === 'dayGridMonth'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView('timeGridWeek')}
              className={`px-4 py-2 rounded-md text-sm ${
                view === 'timeGridWeek'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView('timeGridDay')}
              className={`px-4 py-2 rounded-md text-sm ${
                view === 'timeGridDay'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              Day
            </button>
          </div>
          
          {/* Event type legend */}
          <div className="flex flex-wrap gap-3 pb-2">
            {['service', 'study', 'social', 'outreach', 'children', 'youth', 'worship'].map(type => (
              <div key={type} className="flex items-center">
                <span 
                  className="inline-block w-3 h-3 rounded-full mr-1"
                  style={{ backgroundColor: getEventColor(type) }}
                />
                <span className="text-xs text-gray-600 capitalize">{type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={view}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: ''
          }}
          events={calendarEvents}
          eventClick={handleEventClick}
          datesSet={handleDatesSet}
          height={height}
          dayMaxEvents={eventLimit ? true : false}
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short'
          }}
          eventContent={(eventInfo) => {
            return (
              <div className="fc-event-main-content">
                <div className="fc-event-title font-medium">
                  {eventInfo.event.title}
                </div>
                {eventInfo.timeText && (
                  <div className="fc-event-time text-xs">
                    {eventInfo.timeText}
                  </div>
                )}
                {eventInfo.event.extendedProps.location && view !== 'dayGridMonth' && (
                  <div className="text-xs mt-1 opacity-75">
                    {eventInfo.event.extendedProps.location}
                  </div>
                )}
                {eventInfo.event.extendedProps.requiresRegistration && (
                  <span className="inline-block bg-white bg-opacity-90 text-xs px-1 mt-1 rounded">
                    Registration Required
                  </span>
                )}
              </div>
            );
          }}
        />
      </div>
      
      {/* Add custom styles for FullCalendar */}
      <style jsx global>{`
        .fc .fc-toolbar-title {
          font-size: 1.5em;
          font-weight: 600;
        }
        
        .fc .fc-button {
          background-color: #f3f4f6;
          border-color: #e5e7eb;
          color: #4b5563;
        }
        
        .fc .fc-button-primary:not(:disabled).fc-button-active,
        .fc .fc-button-primary:not(:disabled):active {
          background-color: #4f46e5;
          border-color: #4338ca;
        }
        
        .fc .fc-button-primary:hover {
          background-color: #e5e7eb;
          border-color: #d1d5db;
        }
        
        .fc-event {
          cursor: pointer;
          border-radius: 4px;
        }
        
        .fc-event.featured-event {
          border-width: 2px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
