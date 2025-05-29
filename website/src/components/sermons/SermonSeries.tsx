"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { fetchSermonSeriesById, SermonSeries as SermonSeriesType } from '@/services/sermonService';
import SermonCard from './SermonCard';
import { useQuery } from '@tanstack/react-query';

interface SermonSeriesProps {
  seriesId: string;
  initialData?: SermonSeriesType & { sermons: any[] };
}

export default function SermonSeries({ seriesId, initialData }: SermonSeriesProps) {
  const [showAll, setShowAll] = useState(false);
  const MAX_DISPLAY = 6;

  // Fetch series data with React Query
  const {
    data: series,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['sermonSeries', seriesId],
    queryFn: () => fetchSermonSeriesById(seriesId),
    initialData,
    refetchOnWindowFocus: false,
  });

  // Handle loading state
  if (isLoading) {
    return (
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
    );
  }

  // Handle error state
  if (isError || !series) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Series Not Found</h2>
        <p className="text-gray-600 mb-6">
          The sermon series you are looking for may have been removed or does not exist.
        </p>
        <Link href="/sermons" className="text-orange-600 hover:text-orange-800 font-medium">
          ← Browse all sermons
        </Link>
      </div>
    );
  }

  // Format dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get sermons to display based on showAll state
  const sermonsToDisplay = showAll ? series.sermons : series.sermons?.slice(0, MAX_DISPLAY);
  const hasMoreSermons = series.sermons?.length > MAX_DISPLAY;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero section for the series */}
      <div className="relative w-full h-60 md:h-80 mb-8 rounded-lg overflow-hidden">
        {series.image_url ? (
          <Image
            src={series.image_url}
            alt={series.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-orange-500 to-orange-700"></div>
        )}
        
        {/* Overlay with series info */}
        <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-end p-6 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{series.title}</h1>
          
          {/* Date range if available */}
          {(series.start_date || series.end_date) && (
            <div className="text-white text-opacity-80">
              {series.start_date && formatDate(series.start_date)}
              {series.start_date && series.end_date && ' - '}
              {series.end_date && formatDate(series.end_date)}
            </div>
          )}
        </div>
      </div>
      
      {/* Series description */}
      {series.description && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4">About this series</h2>
          <p className="text-gray-700">{series.description}</p>
        </div>
      )}
      
      {/* Sermons in this series */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Sermons in this series</h2>
          <Link href="/sermons" className="text-orange-600 hover:text-orange-800">
            All sermons
          </Link>
        </div>
        
        {/* Sermons count */}
        <p className="mb-6 text-gray-600">
          {series.sermons?.length || 0} sermon{series.sermons?.length !== 1 ? 's' : ''}
        </p>
        
        {/* No sermons message */}
        {(!series.sermons || series.sermons.length === 0) && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No sermons available in this series yet.</p>
          </div>
        )}
        
        {/* Sermons grid */}
        {series.sermons && series.sermons.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {sermonsToDisplay.map((sermon: any) => (
              <SermonCard key={sermon.id} sermon={sermon} />
            ))}
          </div>
        )}
        
        {/* Show more/less button */}
        {hasMoreSermons && (
          <div className="text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-6 py-2 border border-orange-600 text-orange-600 rounded-md hover:bg-orange-600 hover:text-white transition-colors"
            >
              {showAll ? 'Show less' : `Show all ${series.sermons?.length} sermons`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface SermonItemProps {
  sermon: any; // Explicitly type sermon as any or a more specific type
  onPlay: (sermon: any) => void; // Explicitly type sermon as any or a more specific type
}

const SermonItem: React.FC<SermonItemProps> = ({ sermon, onPlay }) => {
  return (
    <li 
      key={sermon.id}
      className="py-3 px-4 hover:bg-gray-50 rounded-md cursor-pointer transition-colors duration-150 ease-in-out flex justify-between items-center"
      onClick={() => onPlay(sermon as any)} // Explicitly type sermon as any or a more specific type
    >
      <div>
        <p className="text-sm font-medium text-gray-800">{sermon.title}</p>
        <p className="text-xs text-gray-500">{sermon.speaker_name} - {new Date(sermon.sermon_date).toLocaleDateString()}</p>
      </div>
      <div className="ml-4">
        {/* Replace with an actual play icon or button */}
        <span className="text-blue-500 hover:text-blue-700">Play</span>
      </div>
    </li>
  );
};
