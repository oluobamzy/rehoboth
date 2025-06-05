'use client';

import { useState } from 'react';
import EventCalendar from '@/components/events/EventCalendar';
import EventFilters from '@/components/events/EventFilters';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CalendarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Parse filters from URL
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    eventType: searchParams.get('type') || '',
    featured: searchParams.has('featured') ? Boolean(searchParams.get('featured')) : null,
    query: searchParams.get('query') || '',
  });
  
  // Handle filter changes
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    
    // Update URL with new filters
    const params = new URLSearchParams();
    if (newFilters.category) params.append('category', newFilters.category);
    if (newFilters.eventType) params.append('type', newFilters.eventType);
    if (newFilters.featured !== null) params.append('featured', String(newFilters.featured));
    if (newFilters.query) params.append('query', newFilters.query);
    
    router.push(`/events/calendar?${params.toString()}`);
  };
  
  // Determine which event types to hide based on filters
  const hideEventTypes = filters.eventType ? 
    Object.entries(['service', 'study', 'social', 'outreach', 'children', 'youth', 'worship'])
      .filter(([type]) => type !== filters.eventType)
      .map(([type]) => type) 
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Event Calendar</h1>
        <div className="flex">
          <a 
            href="/events" 
            className="text-primary-600 hover:text-primary-700 font-medium mr-4 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            List View
          </a>
          <a 
            href="/events/calendar" 
            className="bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Calendar View
          </a>
        </div>
      </div>

      <div className="mb-6">
        <EventFilters 
          initialFilters={filters} 
          onFilterChange={handleFilterChange}
        />
      </div>
      
      <EventCalendar 
        initialView="dayGridMonth"
        height={800}
        showFilters={true}
        hideEventTypes={hideEventTypes}
      />
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Subscribe to our Events Calendar</h2>
        <p className="text-gray-600 mb-4">
          You can add our events to your calendar app by subscribing to our iCal feed.
        </p>
        <div className="flex space-x-4">
          <a 
            href="/api/events/calendar" 
            className="flex items-center text-primary-600 hover:text-primary-700"
            download="rehoboth-events.ics"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download iCal file
          </a>
          <a 
            href="/api/events/calendar" 
            className="flex items-center text-primary-600 hover:text-primary-700"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a5 5 0 01-5 5h13a5 5 0 01-5-5V7M1 5h22M12 5V4a1 1 0 011-1h2a1 1 0 011 1v1M8 5V4a1 1 0 011-1h2a1 1 0 011 1v1" />
            </svg>
            Subscribe to Calendar
          </a>
        </div>
      </div>
    </div>
  );
}
