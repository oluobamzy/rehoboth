'use client';

import { useState } from 'react';
import { useAdminEvents, EventFilters, Event } from '@/hooks/useEvents';
import AdminEventCard from './AdminEventCard';
import AdminEventFilters from './AdminEventFilters';
import Pagination from '@/components/common/Pagination';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import Link from 'next/link';

export default function AdminEventList() {
  // State for filters
  const [filters, setFilters] = useState<EventFilters>({
    page: 1,
    pageSize: 20,
    fromDate: null,
    toDate: null,
    category: null,
    eventType: null,
    query: '',
    sortBy: 'start_datetime',
    sortOrder: 'asc',
  });

  // Fetch events with the current filters
  const { 
    data, 
    error, 
    isLoading, 
    isError 
  } = useAdminEvents(filters);

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<EventFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page on filter change
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      page: newPage,
    }));
  };

  // Extract events and pagination data
  const events = data?.events || [];
  const pagination = data?.pagination || { 
    page: 1, 
    pageSize: 20, 
    totalItems: 0, 
    totalPages: 0 
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Events</h1>
        <Link
          href="/admin/events/new"
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md inline-flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Create Event
        </Link>
      </div>
      
      {/* Filters */}
      <AdminEventFilters 
        filters={filters} 
        onFilterChange={handleFilterChange} 
      />
      
      {/* Loading and Error states */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      )}
      
      {isError && (
        <ErrorMessage message={error?.message || 'Failed to load events'} />
      )}
      
      {/* No events message */}
      {!isLoading && !isError && events.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-xl mb-2">No events found</h2>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters or create your first event.
          </p>
          <Link
            href="/admin/events/new"
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Create Your First Event
          </Link>
        </div>
      )}
      
      {/* Events table */}
      {!isLoading && !isError && events.length > 0 && (
        <div className="mt-4 bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map((event: Event) => (
                <AdminEventCard key={event.id} event={event} />
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6">
          <Pagination 
            currentPage={pagination.page} 
            totalPages={pagination.totalPages} 
            onPageChange={handlePageChange} 
          />
        </div>
      )}
    </div>
  );
}
