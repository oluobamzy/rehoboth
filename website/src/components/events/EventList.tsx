'use client';

import { useState, useMemo } from 'react';
import { useEvents } from '@/hooks/useEvents';
import EventCard from './EventCard';
import EventFilters from './EventFilters';
import Pagination from '@/components/common/Pagination';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function EventList() {
  // State for filters
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 12,
    fromDate: null,
    toDate: null,
    category: null,
    eventType: null,
    featured: null,
    query: '',
  });

  // Fetch events with the current filters
  const { 
    data, 
    error, 
    isLoading, 
    isError 
  } = useEvents(filters);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page on filter change
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage,
    }));
  };

  // Extract events and pagination data
  const events = data?.events || [];
  const pagination = data?.pagination || { 
    page: 1, 
    pageSize: 12, 
    totalItems: 0, 
    totalPages: 0 
  };

  // Group events by month or category if needed
  const groupedEvents = useMemo(() => {
    // For now, just return the events array
    return events;
  }, [events]);

  // Check if no events after filtering
  const noEvents = !isLoading && !isError && events.length === 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Upcoming Events</h1>
      
      {/* Filters */}
      <EventFilters 
        filters={filters} 
        onFilterChange={handleFilterChange} 
      />
      
      {/* Loading and Error states */}
      {isLoading && <LoadingSpinner />}
      {isError && <ErrorMessage message={error?.message || 'Failed to load events'} />}
      
      {/* No events message */}
      {noEvents && (
        <div className="text-center py-12">
          <h2 className="text-xl mb-4">No events found</h2>
          <p className="text-gray-600">
            Try adjusting your filters or check back later for upcoming events.
          </p>
        </div>
      )}
      
      {/* Events grid */}
      {!isLoading && !isError && events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
      
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination 
          currentPage={pagination.page} 
          totalPages={pagination.totalPages} 
          onPageChange={handlePageChange} 
        />
      )}
    </div>
  );
}
