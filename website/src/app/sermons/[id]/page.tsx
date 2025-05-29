"use client";

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { fetchSermonById } from '@/services/sermonService';
import SermonDetail from '@/components/sermons/SermonDetail';
import { useQuery } from '@tanstack/react-query';
import DatabaseErrorPage from '@/components/common/DatabaseErrorPage';

export default function SermonPage() {
  const params = useParams();
  const sermonId = params?.id as string;

  // Check if we're using default Supabase credentials
  const usingDefaults = 
    !process.env.NEXT_PUBLIC_SUPABASE_URL || 
    process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://example.supabase.co' || 
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your-anon-key';
  
  // Fetch sermon with React Query
  const {
    data: sermon,
    isLoading,
    // error: sermonLoadingError, // isError is assigned a value but never used.
  } = useQuery({
    queryKey: ['sermon', sermonId],
    queryFn: () => fetchSermonById(sermonId),
    enabled: !!sermonId && !usingDefaults,
    refetchOnWindowFocus: false,
  });

  // Set dynamic page title
  useEffect(() => {
    if (sermon) {
      document.title = `${sermon.title} | Rehoboth Christian Church`;
    }
  }, [sermon]);

  // Show database error page if using default credentials
  if (usingDefaults) {
    return <DatabaseErrorPage />;
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 w-3/4 mb-4 rounded"></div>
          <div className="h-4 bg-gray-200 w-1/2 mb-8 rounded"></div>
          <div className="h-96 bg-gray-200 mb-6 rounded"></div>
          <div className="h-4 bg-gray-200 w-full mb-2 rounded"></div>
          <div className="h-4 bg-gray-200 w-full mb-2 rounded"></div>
          <div className="h-4 bg-gray-200 w-3/4 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SermonDetail sermonId={sermonId} initialSermon={sermon} />
    </div>
  );
}
