"use client";

import Link from 'next/link';
import Image from 'next/image';
import { formatDistance } from 'date-fns';
import { Sermon } from '@/services/sermonService';

interface SermonCardProps {
  sermon: Sermon;
}

export default function SermonCard({ sermon }: SermonCardProps) {
  // Format the duration from seconds to minutes
  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  // Format the date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Time since upload
  const getTimeSince = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return formatDistance(date, new Date(), { addSuffix: true });
  };

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Thumbnail */}
      <div className="relative h-48 bg-gray-100">
        {sermon.thumbnail_url ? (
          <Image 
            src={sermon.thumbnail_url}
            alt={sermon.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Pill for video/audio indicator */}
        <div className="absolute top-4 right-4 bg-gray-900 bg-opacity-75 text-white text-xs py-1 px-2 rounded-full">
          {sermon.video_url ? 'Video' : sermon.audio_url ? 'Audio' : 'Transcript'}
        </div>
        
        {/* Duration */}
        {sermon.duration_seconds && (
          <div className="absolute bottom-4 right-4 bg-gray-900 bg-opacity-75 text-white text-xs py-1 px-2 rounded-full">
            {formatDuration(sermon.duration_seconds)}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4 flex-grow flex flex-col">
        {/* Series tag if available */}
        {sermon.series && (
          <Link href={`/sermons/series/${sermon.series.id}`} className="inline-block">
            <span className="text-xs font-medium text-orange-500 bg-orange-50 py-1 px-2 rounded-full mb-2">
              {sermon.series.title}
            </span>
          </Link>
        )}
        
        {/* Title */}
        <h3 className="font-bold text-xl mb-1 line-clamp-2">
          <Link href={`/sermons/${sermon.id}`} className="hover:text-orange-500 transition-colors">
            {sermon.title}
          </Link>
        </h3>
        
        {/* Speaker and date */}
        <div className="text-sm text-gray-600 mb-3">
          <span className="font-medium">{sermon.speaker_name}</span> • {formatDate(sermon.sermon_date)}
        </div>
        
        {/* Description */}
        {sermon.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {sermon.description}
          </p>
        )}
        
        {/* Scripture */}
        {sermon.scripture_reference && (
          <div className="text-xs text-gray-500 italic mb-2">
            Scripture: {sermon.scripture_reference}
          </div>
        )}
        
        {/* Tags */}
        {sermon.tags && sermon.tags.length > 0 && (
          <div className="mt-auto pt-3">
            <div className="flex flex-wrap gap-1">
              {sermon.tags.slice(0, 3).map((tag) => (
                <Link key={tag} href={`/sermons?tag=${tag}`}>
                  <span className="text-xs text-gray-600 hover:text-orange-500 bg-gray-100 px-2 py-1 rounded">
                    #{tag}
                  </span>
                </Link>
              ))}
              {sermon.tags.length > 3 && (
                <span className="text-xs text-gray-600 px-2 py-1">
                  +{sermon.tags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Footer with stats/actions */}
      <div className="px-4 py-3 bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
        <div>{getTimeSince(sermon.created_at)}</div>
        <div>{sermon.view_count} views</div>
      </div>
    </div>
  );
}
