"use client";

import { useState, useEffect } from 'react';
import { fetchSermonSeriesById } from '@/services/sermonService';
import SermonSeries from '@/components/sermons/SermonSeries';
import { notFound, useParams } from 'next/navigation';
import DatabaseErrorPage from '@/components/common/DatabaseErrorPage';
import MainLayout from '@/components/common/MainLayout';
import Card from '@/components/common/Card';
import Image from 'next/image';
import Link from 'next/link'; // Ensure Link is imported

// Metadata is now handled dynamically in the component using Head

export default function SermonSeriesPage() {
  const params = useParams();
  const seriesId = params.id as string;
  
  const [series, setSeries] = useState<any>(null);
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
        // Fetch series data
        const seriesData = await fetchSermonSeriesById(seriesId);
        
        if (seriesData?.connectionError) {
          setConnectionError(seriesData.connectionError);
        } else if (seriesData) {
          setSeries(seriesData);
        } else {
          // Handle not found
          notFound();
        }
      } catch (error) {
        console.error('Error fetching series data:', error);
        setConnectionError('Failed to connect to the database');
      } finally {
        setIsLoading(false);
      }
    }

    if (seriesId) {
      loadSeriesData();
    }
  }, [seriesId, usingDefaults]);
  
  // Show database error page if there's a connection error
  if (connectionError) {
    return <DatabaseErrorPage />;
  }
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="animate-pulse">
          <div className="h-60 bg-gray-200 rounded-lg mb-8"></div>
          <div className="h-10 bg-gray-200 w-1/2 mb-2"></div>
          <div className="h-6 bg-gray-200 w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-72 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // const pageTitle = series ? `${series.title} | Rehoboth Christian Church` : 'Sermon Series | Rehoboth Christian Church';
  // const pageDescription = series?.description || 'Sermon series from Rehoboth Christian Church';
  
  // Note: In Next.js App Router, metadata is handled in layout.tsx
  // We can't use Head component in client components, metadata is handled by the layout
  
  if (!series) {
    return null; // or a loading state, or handle as per your app's requirement
  }

  return (
    <MainLayout>
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 py-12"> {/* Ensure this div is correctly structured */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{series.title}</h1>
            <p className="text-lg text-gray-700">{series.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {series.sermons.map((sermon: any) => (
              <Card key={sermon.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-48">
                  <Image 
                    src={sermon.thumbnailUrl} 
                    alt={sermon.title} 
                    layout="fill" 
                    objectFit="cover" 
                    className="rounded-t-lg"
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    <Link href={`/sermons/${sermon.id}`}>
                      {sermon.title}
                    </Link>
                  </h2>
                  <p className="text-gray-600 mb-4">{sermon.description}</p>
                  <Link href={`/sermons/${sermon.id}`}>
                    <a className="text-blue-600 hover:underline">Watch Sermon</a>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
