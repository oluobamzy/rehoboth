"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchSermonSeries, SermonSeries } from '@/services/sermonService';
import DatabaseErrorPage from '@/components/common/DatabaseErrorPage';

// Metadata moved to layout.tsx since client components can't export metadata

export default function SermonSeriesListPage() {
  const [allSeries, setAllSeries] = useState<SermonSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Check if we're using default Supabase credentials
  const usingDefaults = 
    !process.env.NEXT_PUBLIC_SUPABASE_URL || 
    process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://example.supabase.co' || 
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your-anon-key';
  
  useEffect(() => {
    async function loadSeriesData() {
      setIsLoading(true);
      
      // Check if we're using default credentials
      if (usingDefaults) {
        setConnectionError('Database credentials not properly configured');
        setIsLoading(false);
        return;
      }
      
      try {
        // Fetch all sermon series
        const seriesData = await fetchSermonSeries();
        
        if (Array.isArray(seriesData)) {
          setAllSeries(seriesData);
        } else {
          // Handle error response
          setConnectionError('Failed to load sermon series data');
        }
      } catch (error) {
        console.error('Error fetching sermon series data:', error);
        setConnectionError('Failed to connect to the database');
      } finally {
        setIsLoading(false);
      }
    }

    loadSeriesData();
  }, [usingDefaults]);
  
  // Show database error page if there's a connection error
  if (connectionError) {
    return <DatabaseErrorPage />;
  }
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-6">Sermon Series</h1>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-10"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden h-80">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">Sermon Series</h1>
      <p className="text-xl text-gray-600 mb-10">
        Explore our sermon series collections on various biblical topics and themes.
      </p>
      
      {allSeries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allSeries.map((series) => (
            <Link 
              key={series.id} 
              href={`/sermons/series/${series.id}`}
              className="group"
            >
              <div className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow group-hover:shadow-lg h-full flex flex-col">
                {/* Series image */}
                <div className="relative h-48 bg-gray-100">
                  {series.image_url ? (
                    <Image
                      src={series.image_url}
                      alt={series.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-orange-400 to-orange-600"></div>
                  )}
                </div>
                
                {/* Series content */}
                <div className="p-6 flex-grow">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                    {series.title}
                  </h2>
                  
                  {series.description && (
                    <p className="text-gray-600 line-clamp-3 mb-4">
                      {series.description}
                    </p>
                  )}
                  
                  {/* Date range if available */}
                  {(series.start_date || series.end_date) && (
                    <div className="text-sm text-gray-500">
                      {series.start_date && new Date(series.start_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                      })}
                      {series.start_date && series.end_date && ' - '}
                      {series.end_date && new Date(series.end_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                      })}
                    </div>
                  )}
                </div>
                
                {/* View button */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <span className="text-orange-600 font-medium text-sm group-hover:text-orange-700 transition-colors flex items-center">
                    View Series
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Series Available Yet</h2>
          <p className="text-gray-600">
            Check back later for sermon series content.
          </p>
          <Link href="/sermons" className="mt-6 inline-block text-orange-600 hover:text-orange-800">
            Browse all sermons instead
          </Link>
        </div>
      )}
    </div>
  );
}
