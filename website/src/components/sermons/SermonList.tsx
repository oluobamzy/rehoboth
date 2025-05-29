"use client";

import React, { useState, /*useEffect,*/ useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchSermons, Sermon } from '@/services/sermonService';
import SermonCard from './SermonCard';
import { useQuery } from '@tanstack/react-query';

interface SermonListProps {
  initialSermons?: Sermon[];
  initialCount?: number;
  seriesId?: string;
  speakerId?: string;
  tag?: string;
  searchQuery?: string;
  limit?: number;
}

export default function SermonList({
  initialSermons,
  initialCount = 0,
  seriesId,
  speakerId,
  tag,
  searchQuery,
  limit = 12,
}: SermonListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Extract page from query params or default to 1
  const [page, setPage] = useState<number>(
    searchParams?.get('page') ? parseInt(searchParams.get('page')!) : 1
  );

  // Prepare filters
  const filters = {
    page,
    pageSize: limit,
    series_id: seriesId || null,
    speaker: speakerId || null,
    tags: tag ? [tag] : [],
    query: searchQuery || null,
    sort_by: 'sermon_date',
    sort_order: 'desc' as 'asc' | 'desc',
  };

  // Query sermons with React Query
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['sermons', filters],
    queryFn: () => fetchSermons(filters),
    initialData: initialSermons && initialCount 
      ? { sermons: initialSermons, count: initialCount } 
      : undefined,
    refetchOnWindowFocus: false,
    enabled: !initialSermons,
  });

  const sermons = data?.sermons || initialSermons || [];
  const totalSermons = data?.count || initialCount || 0;
  const totalPages = Math.ceil(totalSermons / limit);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      
      // Update URL with the new page
      const params = new URLSearchParams(searchParams?.toString() || '');
      params.set('page', newPage.toString());
      
      // Replace or push state based on if we're already paginating
      if (searchParams?.has('page')) {
        router.replace(`?${params.toString()}`);
      } else {
        router.push(`?${params.toString()}`);
      }
    }
  };

  // If no sermons are found
  if (!isLoading && sermons.length === 0) {
    return (
      <div className="w-full py-16 text-center">
        <h3 className="text-xl font-semibold mb-4">No Sermons Found</h3>
        <p className="text-gray-500">
          {searchQuery 
            ? `No sermons found matching "${searchQuery}". Please try a different search term.` 
            : 'No sermons are available at this time.'}
        </p>
      </div>
    );
  }

  // For errors
  if (isError) {
    return (
      <div className="w-full py-8 text-center">
        <h3 className="text-xl font-semibold text-red-600 mb-2">Error Loading Sermons</h3>
        <p className="text-gray-700">
          There was a problem loading the sermons. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {isLoading ? (
        // Loading state with skeleton cards
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: limit }).map((_, index) => (
            <div key={index} className="bg-gray-100 rounded-lg overflow-hidden h-96 animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Main sermon grid
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sermons.map((sermon) => (
              <SermonCard key={sermon.id} sermon={sermon} />
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12 mb-8 items-center">
              <button 
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border rounded-l-md bg-white text-gray-700 disabled:bg-gray-100 disabled:text-gray-400"
                aria-label="Previous page"
              >
                &larr;
              </button>
              <div className="px-4 py-2 border-t border-b bg-white">
                Page {page} of {totalPages}
              </div>
              <button 
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="px-4 py-2 border rounded-r-md bg-white text-gray-700 disabled:bg-gray-100 disabled:text-gray-400"
                aria-label="Next page"
              >
                &rarr;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
