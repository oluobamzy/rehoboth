'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/services/auth';
import Image from 'next/image';

interface EditableImageProps {
  pageKey: string;
  sectionKey: string;
  fallbackSrc: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  showEditButton?: boolean;
  onImageUpdate?: () => void;
}

export default function EditableImage({
  pageKey,
  sectionKey,
  fallbackSrc,
  alt,
  width = 400,
  height = 300,
  className = '',
  showEditButton = true,
  onImageUpdate
}: EditableImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(fallbackSrc);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Check if user is admin (authenticated user in your case)
  const isAdmin = !!user;

  useEffect(() => {
    fetchImageSrc();
  }, [pageKey, sectionKey]);

  const fetchImageSrc = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/content/structured?page_key=${encodeURIComponent(pageKey)}&section_key=${encodeURIComponent(sectionKey)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          // Content not found, use fallback
          setImageSrc(fallbackSrc);
          setIsLoading(false);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.content && result.content.metadata && result.content.metadata.image_url) {
        setImageSrc(result.content.metadata.image_url);
      } else {
        setImageSrc(fallbackSrc);
      }
    } catch (err) {
      console.error('Error fetching image:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch image');
      setImageSrc(fallbackSrc);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveImage = async () => {
    if (!newImageUrl.trim()) {
      setError('Please enter a valid image URL');
      return;
    }

    try {
      setError(null);

      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page_key: pageKey,
          section_key: sectionKey,
          content: `<img src="${newImageUrl}" alt="${alt}" />`,
          content_type: 'image',
          metadata: {
            image_url: newImageUrl,
            alt_text: alt
          },
          is_published: true
        }),
      });

      if (response.ok) {
        setImageSrc(newImageUrl);
        setIsEditing(false);
        setNewImageUrl('');
        if (onImageUpdate) {
          onImageUpdate();
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save image');
      }
    } catch (err) {
      console.error('Error saving image:', err);
      setError('Failed to save image');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewImageUrl('');
    setError(null);
  };

  if (isLoading) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} style={{ width, height }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <Image 
        src={imageSrc} 
        alt={alt} 
        width={width} 
        height={height}
        className={className}
        onError={() => {
          if (imageSrc !== fallbackSrc) {
            setImageSrc(fallbackSrc);
          }
        }}
      />
      
      {isAdmin && showEditButton && !isEditing && (
        <button
          onClick={() => {
            setIsEditing(true);
            setNewImageUrl(imageSrc);
          }}
          className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          title="Edit Image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      )}

      {isEditing && (
        <div className="absolute inset-0 bg-white bg-opacity-95 p-4 rounded-lg border-2 border-blue-500">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Image URL:
            </label>
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Enter image URL..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            {error && (
              <p className="text-red-600 text-xs">{error}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleSaveImage}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}