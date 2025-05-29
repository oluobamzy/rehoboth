"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fetchSermonById, Sermon } from '@/services/sermonService';
import SermonPlayer from './SermonPlayer';
import { useQuery } from '@tanstack/react-query';
import SermonAnalytics from '@/services/analyticsService';

interface SermonDetailProps {
  sermonId: string;
  initialSermon?: Sermon;
}

export default function SermonDetail({ sermonId, initialSermon }: SermonDetailProps) {
  // Fetch the sermon data with React Query
  const { 
    data: sermon, 
    isLoading, 
    isError,
  } = useQuery({
    queryKey: ['sermon', sermonId],
    queryFn: () => fetchSermonById(sermonId),
    initialData: initialSermon,
    refetchOnWindowFocus: false,
    enabled: !!sermonId,
  });
  
  // Track sermon view when component mounts
  useEffect(() => {
    if (sermon && !isLoading) {
      SermonAnalytics.trackSermonView(
        sermonId,
        sermon.title,
        sermon.speaker_name,
        sermon.series_id
      );
    }
  }, [sermon, isLoading, sermonId]);

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="w-full py-12">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-8 bg-gray-200 w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 w-1/2 mb-8"></div>
          <div className="h-96 bg-gray-200 mb-6"></div>
          <div className="h-4 bg-gray-200 w-full mb-2"></div>
          <div className="h-4 bg-gray-200 w-full mb-2"></div>
          <div className="h-4 bg-gray-200 w-3/4"></div>
        </div>
      </div>
    );
  }

  if (isError || !sermon) {
    return (
      <div className="w-full py-12 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Sermon Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The sermon you are looking for may have been removed or does not exist.
        </p>
        <Link href="/sermons" className="text-orange-600 hover:text-orange-800 font-medium">
          ← Back to all sermons
        </Link>
      </div>
    );
  }

  // Format the date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format(date, 'MMMM d, yyyy');
  };

  // Share sermon function
  const handleShare = async (platform: string) => {
    // Create share URL
    const shareUrl = typeof window !== 'undefined' ? 
      `${window.location.origin}/sermons/${sermonId}` : 
      `/sermons/${sermonId}`;
    
    // Title for sharing
    const shareTitle = `Listen to "${sermon.title}" by ${sermon.speaker_name} at Rehoboth Christian Church`;
    
    // Platform-specific sharing
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`Check out this sermon: ${shareUrl}`)}`, '_blank');
        break;
      case 'link':
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
        break;
    }
    
    // Track sharing with analytics
    SermonAnalytics.trackSermonShared(sermonId, platform);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back to sermons link */}
      <div className="flex justify-between items-center mb-6">
        <Link href="/sermons" className="text-orange-600 hover:text-orange-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          All Sermons
        </Link>
        
        {/* Share dropdown */}
        <div className="relative group">
          <button className="flex items-center text-orange-600 hover:text-orange-800 px-3 py-1 rounded-md border border-orange-200 hover:bg-orange-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
          <div className="absolute right-0 z-10 mt-2 hidden group-hover:block">
            <div className="bg-white rounded-md shadow-lg py-1 min-w-[160px]">
              <button 
                onClick={() => handleShare('facebook')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <span className="text-blue-600 mr-2">f</span> Facebook
              </button>
              <button 
                onClick={() => handleShare('twitter')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <span className="text-blue-400 mr-2">🐦</span> Twitter
              </button>
              <button 
                onClick={() => handleShare('email')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <span className="text-gray-600 mr-2">✉️</span> Email
              </button>
              <button 
                onClick={() => handleShare('link')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <span className="text-gray-600 mr-2">🔗</span> Copy Link
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Series tag if available */}
      {sermon.series && (
        <Link href={`/sermons/series/${sermon.series.id}`}>
          <span className="inline-block text-sm font-medium text-orange-500 bg-orange-50 py-1 px-3 rounded-full mb-4">
            Series: {sermon.series.title}
          </span>
        </Link>
      )}

      {/* Sermon title */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{sermon.title}</h1>

      {/* Speaker and date row */}
      <div className="flex flex-wrap items-center text-gray-600 mb-6">
        <span className="font-medium mr-2">{sermon.speaker_name}</span>
        <span className="mr-2">•</span>
        <span>{formatDate(sermon.sermon_date)}</span>
        {sermon.view_count > 0 && (
          <>
            <span className="mx-2">•</span>
            <span>{sermon.view_count} views</span>
          </>
        )}
      </div>

      {/* Scripture reference */}
      {sermon.scripture_reference && (
        <div className="text-gray-700 italic mb-6">
          Scripture: {sermon.scripture_reference}
        </div>
      )}

      {/* Video or audio player */}
      <div className="w-full bg-gray-100 rounded-lg overflow-hidden mb-8 relative">
        {(sermon.video_url || sermon.audio_url) ? (
          <SermonPlayer 
            videoUrl={sermon.video_url}
            audioUrl={sermon.audio_url}
            title={sermon.title}
            sermonId={sermon.id}
            thumbnailUrl={sermon.thumbnail_url}
          />
        ) : (
          <div className="aspect-video bg-gray-200 flex flex-col items-center justify-center p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500">No media available for this sermon.</p>
            {sermon.transcript && (
              <p className="text-gray-500 mt-2">Transcript is available below.</p>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      {sermon.description && (
        <div className="prose max-w-none mb-8">
          <h2 className="text-2xl font-semibold mb-4">About this sermon</h2>
          <p className="text-gray-700">{sermon.description}</p>
        </div>
      )}

      {/* Transcript (if available) */}
      {sermon.transcript && (
        <div className="prose max-w-none mb-8">
          <h2 className="text-2xl font-semibold mb-4">Transcript</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="whitespace-pre-line text-gray-700">{sermon.transcript}</p>
          </div>
        </div>
      )}

      {/* Tags */}
      {sermon.tags && sermon.tags.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {sermon.tags.map((tag: string) => (
              <Link key={tag} href={`/sermons?tag=${tag}`}>
                <span className="text-sm text-gray-700 hover:text-orange-600 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors">
                  #{tag}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related sermons section can be added here */}
    </div>
  );
}
