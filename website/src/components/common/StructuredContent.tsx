'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/services/auth';

interface StructuredContentProps {
  pageKey: string;
  sectionKey: string;
  fallbackData?: Record<string, any>;
  renderContent: (data: Record<string, any>) => React.ReactNode;
  className?: string;
}

export default function StructuredContent({
  pageKey,
  sectionKey,
  fallbackData = {},
  renderContent,
  className = ''
}: StructuredContentProps) {
  const [data, setData] = useState<Record<string, any>>(fallbackData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchStructuredContent();
  }, [pageKey, sectionKey]);

  const fetchStructuredContent = async () => {
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
          setData(fallbackData);
          setIsLoading(false);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.content && result.content.metadata) {
        setData(result.content.metadata);
      } else {
        setData(fallbackData);
      }
    } catch (err) {
      console.error('Error fetching structured content:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch content');
      setData(fallbackData);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    console.warn(`Error loading structured content for ${pageKey}.${sectionKey}:`, error);
    // Fallback to default data on error
  }

  return (
    <div className={className}>
      {renderContent(data)}
    </div>
  );
}