"use client";

import SermonList from '@/components/sermons/SermonList';
import SermonSearch from '@/components/sermons/SermonSearch';
import { fetchSermons, fetchSermonSeries, Sermon, SermonSeries, PaginatedSermons } from '@/services/sermonService'; 
import MainLayout from '@/components/common/MainLayout';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import DatabaseErrorPage from '@/components/common/DatabaseErrorPage';

// Metadata can't be exported from client components in Next.js App Router
// Instead, create a separate file for metadata or use a layout.tsx file

export default function SermonsPage() {
  const searchParams = useSearchParams();
  const sermonsPerPage = 12;

  // Extract query parameters
  const page = searchParams.get('page') ? parseInt(searchParams.get('page') as string) : 1;
  const speaker = searchParams.get('speaker') || undefined;
  const tag = searchParams.get('tag') || undefined;
  const query = searchParams.get('query') || undefined;
  const dateFrom = searchParams.get('date_from') || undefined;
  const dateTo = searchParams.get('date_to') || undefined;
  
  // Check if we're using default Supabase credentials
  const usingDefaults = 
    !process.env.NEXT_PUBLIC_SUPABASE_URL || 
    process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://example.supabase.co' || 
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your-anon-key';
  
  // const series = useFetchSermonSeries(); // 'series' is assigned a value but never used.
  const { 
    data: sermonsData, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading, 
    error 
  } = useInfiniteQuery<PaginatedSermons, Error>({
    queryKey: ['sermons', { sort_by: 'sermon_date', sort_order: 'desc' }],
    queryFn: ({ pageParam = 1 }) =>
      fetchSermons({ page: pageParam as number, pageSize: sermonsPerPage, sort_by: 'sermon_date', sort_order: 'desc' }),
    getNextPageParam: (lastPage: PaginatedSermons, allPages: PaginatedSermons[]) => {
      if (!lastPage || !lastPage.sermons || lastPage.sermons.length < sermonsPerPage) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
  });

  const { data: seriesList = [] } = useQuery<SermonSeries[], Error>({ // Fetch series list
    queryKey: ['sermonSeries'],
    queryFn: fetchSermonSeries,
  });


  const sermons = useMemo(() => sermonsData?.pages.flatMap(page => (page as PaginatedSermons).sermons) ?? [], [sermonsData]);
  const totalSermons = useMemo(() => (sermonsData?.pages[0] as PaginatedSermons)?.count ?? 0, [sermonsData]);
  const totalPages = Math.ceil(totalSermons / sermonsPerPage);
  
  // Show database error page if there's a connection error
  if (error) {
    return <DatabaseErrorPage />;
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">Sermons</h1>
      <p className="text-xl text-gray-600 mb-10">
        Listen to recent messages from our church services
      </p>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar with search and filters */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <SermonSearch />
        </div>
        
        {/* Main sermon listing */}
        <div className="w-full md:w-2/3 lg:w-3/4">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <SermonList 
              initialSermons={sermons}
              initialCount={totalSermons}
              searchQuery={query}
              tag={tag}
              speakerId={speaker}
            />
          )}
        </div>
      </div>
    </div>
  );
}
